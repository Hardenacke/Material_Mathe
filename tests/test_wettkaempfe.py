import importlib.util
import json
import re
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class CompetitionPublicationTests(unittest.TestCase):
    def test_public_build_contains_portal_and_local_assets_only(self):
        site = ROOT / "_site"
        self.assertTrue((site / "wettkaempfe/index.html").is_file())
        for name in ["app.js", "config.js", "style.css", "vendor/katex/katex.min.js",
                     "vendor/katex/katex.min.css", "vendor/katex/LICENSE", "assets/parabel-scheitel.svg"]:
            self.assertTrue((site / "wettkaempfe" / name).is_file(), name)
        for name in [".local", "werkzeuge", "fragenpools", "backend", "node_modules", "ergebnisse"]:
            self.assertFalse((site / name).exists(), name)
            self.assertFalse((site / "wettkaempfe" / name).exists(), name)
        self.assertFalse(any(site.rglob(".dev.vars")))
        self.assertFalse(any(site.rglob("ergebnisse")))
        self.assertFalse(any(site.rglob("*-codes.csv")))
        self.assertFalse(any(site.rglob("quadratische-funktionen-9-demo.json")))
        public_config = (site / "wettkaempfe/config.js").read_text(encoding="utf-8")
        self.assertNotIn("ADMIN_TOKEN", public_config)
        self.assertNotIn("GITHUB_TOKEN", public_config)
        css = site / "wettkaempfe/vendor/katex/katex.min.css"
        for match in re.findall(r"url\(([^)]+)\)", css.read_text(encoding="utf-8")):
            target = match.strip("\"'")
            if not target.startswith("data:"):
                self.assertTrue((css.parent / target).is_file(), target)

    def test_setup_rejects_traversal_and_preserves_private_content(self):
        spec = importlib.util.spec_from_file_location("wettkampf_vorbereiten", ROOT / "werkzeuge/wettkampf_vorbereiten.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            module.TARGET = folder / "private"
            archive = folder / "test.zip"
            with zipfile.ZipFile(archive, "w") as z:
                z.writestr(module.PREFIX + "backend/fragenpools/eigen.json", '{"demo": true}')
            module.prepare(archive)
            portal = module.TARGET / "public"
            self.assertTrue((portal / "index.html").is_file())
            self.assertTrue((portal / "favicon.svg").is_file())
            self.assertIn("globalThis.location.origin", (portal / "config.js").read_text(encoding="utf-8"))
            self.assertFalse((portal / "fragenpools").exists())
            self.assertFalse((portal / "verwaltung").exists())
            pool = module.TARGET / "fragenpools/eigen.json"
            pool.write_text('{"demo": false}', encoding="utf-8")
            module.prepare(archive)
            self.assertFalse(json.loads(pool.read_text(encoding="utf-8"))["demo"])
            private = module.TARGET / "verwaltung"
            private.mkdir()
            (private / "test-codes.csv").write_text("test-only", encoding="utf-8")
            (module.TARGET / ".dev.vars").write_text("TEST_ONLY=example", encoding="utf-8")
            package = module.package_backend()
            with zipfile.ZipFile(package) as z:
                self.assertIn("Material_Mathe_Wettkampf_API/fragenpools/eigen.json", z.namelist())
                self.assertIn("Material_Mathe_Wettkampf_API/public/index.html", z.namelist())
                self.assertFalse(any("/verwaltung/" in name or name.endswith(".dev.vars") for name in z.namelist()))
            with zipfile.ZipFile(archive, "w") as z:
                z.writestr(module.PREFIX + "backend/../../outside.json", "{}")
            with self.assertRaises(ValueError):
                module.prepare(archive)
            self.assertFalse((folder / "outside.json").exists())


if __name__ == "__main__":
    unittest.main()
