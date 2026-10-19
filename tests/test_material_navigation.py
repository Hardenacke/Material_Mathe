import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("build_site", ROOT / "werkzeuge/build_site.py")
build_site = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build_site)


class MaterialNavigationBuildTests(unittest.TestCase):
    def test_navigation_is_added_to_generated_materials_and_followup_pages(self):
        with tempfile.TemporaryDirectory(prefix=".navigation-test-", dir=ROOT) as directory:
            output = Path(directory)
            source = "<!doctype html><html><body><h1>Aufgabe</h1></body></html>"
            (output / "index.html").write_text(source, encoding="utf-8")
            page = output / "kurs/thema/aufgabe.html"
            page.parent.mkdir(parents=True)
            page.write_text(source, encoding="utf-8")
            followup = page.with_name("uebersicht.htm")
            followup.write_text(source.replace("</body>", "</BODY>"), encoding="utf-8")
            asset = page.with_name("script.js")
            asset.write_text("const text = '</body>';", encoding="utf-8")
            with patch.object(build_site, "OUT", output):
                build_site.add_material_navigation()
                once = page.read_text(encoding="utf-8")
                build_site.add_material_navigation()
            self.assertIn('src="../../material-navigation.js" defer data-sammlung-navigation', once)
            self.assertLess(once.index("data-sammlung-navigation"), once.index("</body>"))
            self.assertEqual(page.read_text(encoding="utf-8"), once)
            self.assertIn("data-sammlung-navigation", followup.read_text(encoding="utf-8"))
            self.assertEqual((output / "index.html").read_text(encoding="utf-8"), source)
            self.assertEqual(asset.read_text(encoding="utf-8"), "const text = '</body>';")


if __name__ == "__main__":
    unittest.main()
