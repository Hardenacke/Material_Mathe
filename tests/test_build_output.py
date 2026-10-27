"""Prüft die Bereinigung der Ausgabe bei Windows-Dateisperren."""
import importlib.util
import os
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("build_output", ROOT / "werkzeuge/build_site.py")
build_site = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build_site)


class BuildOutputTests(unittest.TestCase):
    def test_cleanup_keeps_output_working_directory_and_removes_readonly_files(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            output = root / "_site"
            nested = output / "kurs"
            nested.mkdir(parents=True)
            readonly = nested / "alt.html"
            readonly.write_text("Veraltete Ausgabe", encoding="utf-8")
            readonly.chmod(stat.S_IREAD)
            (output / "alt.json").write_text("{}", encoding="utf-8")
            source = root / "index.html"
            source.write_text("Quelle behalten", encoding="utf-8")
            previous = Path.cwd()
            try:
                os.chdir(output)
                with patch.object(build_site, "ROOT", root), patch.object(build_site, "OUT", output):
                    build_site.prepare_output()
                self.assertEqual(Path.cwd(), output)
                self.assertEqual(list(output.iterdir()), [])
                self.assertEqual(source.read_text(encoding="utf-8"), "Quelle behalten")
            finally:
                os.chdir(previous)

    def test_transient_lock_is_retried_and_stale_content_is_removed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            output = root / "_site"
            nested = output / "kurs"
            nested.mkdir(parents=True)
            (nested / "alt.html").write_text("Veraltet", encoding="utf-8")
            original = build_site.shutil.rmtree
            locked = True

            def briefly_locked(path, **kwargs):
                nonlocal locked
                if locked:
                    locked = False
                    raise PermissionError(13, "Datei in Benutzung", str(nested / "alt.html"))
                return original(path, **kwargs)

            with patch.object(build_site, "ROOT", root), patch.object(build_site, "OUT", output), \
                    patch.object(build_site.shutil, "rmtree", side_effect=briefly_locked), \
                    patch.object(build_site.time, "sleep"):
                build_site.prepare_output()
            self.assertTrue(output.is_dir())
            self.assertEqual(list(output.iterdir()), [])

    def test_persistent_lock_aborts_with_the_blocked_path(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            output = root / "_site"
            nested = output / "kurs"
            nested.mkdir(parents=True)
            locked = nested / "gesperrt.html"
            locked.write_text("Gesperrt", encoding="utf-8")
            error = PermissionError(13, "Datei in Benutzung", str(locked))
            with patch.object(build_site, "ROOT", root), patch.object(build_site, "OUT", output), \
                    patch.object(build_site.shutil, "rmtree", side_effect=error), \
                    patch.object(build_site.time, "sleep"):
                with self.assertRaisesRegex(build_site.OutputLockedError, "gesperrt.html"):
                    build_site.prepare_output()
            self.assertEqual(locked.read_text(encoding="utf-8"), "Gesperrt")

    def test_cleanup_refuses_a_source_directory_as_output(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "index.html"
            source.write_text("Quelle behalten", encoding="utf-8")
            with patch.object(build_site, "ROOT", root), patch.object(build_site, "OUT", root):
                with self.assertRaisesRegex(ValueError, "Unzulässiger Ausgabeordner"):
                    build_site.prepare_output()
            self.assertEqual(source.read_text(encoding="utf-8"), "Quelle behalten")


if __name__ == "__main__":
    unittest.main()
