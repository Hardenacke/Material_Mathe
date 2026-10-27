import base64
import importlib.util
import json
import tempfile
import unittest
import zipfile
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / "klasse-9/02-funktionen/01-quadratische-funktionen/lernpfad-quadratische-funktionen"
MEDIA = COURSE.parent / "assets/quadratische-ergaenzung"
spec = importlib.util.spec_from_file_location("quadratische_katalog", ROOT / "werkzeuge/katalog.py")
katalog = importlib.util.module_from_spec(spec)
spec.loader.exec_module(katalog)


class Downloads(HTMLParser):
    def __init__(self):
        super().__init__()
        self.items = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a" and "h5p-download" in attrs.get("class", "").split() and attrs.get("download", "").endswith(".h5p"):
            self.items.append((attrs["download"], attrs["href"]))


class QuadraticMaterialTests(unittest.TestCase):
    def test_each_registered_material_is_catalogued_once_in_correct_topic(self):
        data = katalog.build_catalog()
        assignments = json.loads(katalog.MATERIAL_ASSIGNMENTS_FILE.read_text(encoding="utf-8"))["materialien"]
        self.assertEqual(sum(entry["typ"] != "Quiz" for entry in assignments), 14)
        found = {}
        counts = Counter()
        for area in data["bereiche"]:
            for field in area["inhaltsfelder"]:
                for topic in field["themen"]:
                    for material in topic["materialien"]:
                        counts[material["url"]] += 1
                        found[material["url"]] = ((area["id"], field["id"], topic["id"]), material)
        for entry in assignments:
            self.assertEqual(counts[entry["url"]], 1, entry["url"])
            scope, material = found[entry["url"]]
            self.assertEqual(scope, (entry["bereich"], entry["inhaltsfeld"], entry["thema"]))
            self.assertEqual(material["typ"], entry["typ"])
        self.assertEqual((data["statistik"]["bereiche"], data["statistik"]["inhaltsfelder"], data["statistik"]["themen"]), (9, 33, 105))

    def test_invalid_or_duplicate_assignment_is_rejected(self):
        data = json.loads(katalog.MATERIAL_ASSIGNMENTS_FILE.read_text(encoding="utf-8"))
        with tempfile.TemporaryDirectory() as folder:
            file = Path(folder) / "zuordnung.json"
            invalid = json.loads(json.dumps(data))
            invalid["materialien"][0]["thema"] = "unbekannt"
            file.write_text(json.dumps(invalid), encoding="utf-8")
            with patch.object(katalog, "MATERIAL_ASSIGNMENTS_FILE", file):
                with self.assertRaises(ValueError):
                    katalog.assigned_materials_by_destination()
                file.write_text(json.dumps({"schemaVersion": 1, "materialien": [data["materialien"][0]] * 2}), encoding="utf-8")
                with self.assertRaises(ValueError):
                    katalog.assigned_materials_by_destination()

    def test_all_embedded_quizzes_match_the_downloads(self):
        lessons = sorted(COURSE.glob("[0-9][0-9]_*.html"))
        self.assertEqual(len(lessons), 12)
        for lesson in lessons:
            with self.subTest(lesson=lesson.name):
                parser = Downloads()
                parser.feed(lesson.read_text(encoding="utf-8"))
                self.assertEqual(len(parser.items), 1)
                name, href = parser.items[0]
                self.assertTrue(href.startswith("data:application/zip;base64,"))
                package = COURSE / "h5p" / name
                self.assertEqual(base64.b64decode(href.split(",", 1)[1], validate=True), package.read_bytes())
                with zipfile.ZipFile(package) as archive:
                    self.assertIsNone(archive.testzip())
                    self.assertEqual(json.loads(archive.read("h5p.json"))["mainLibrary"], "H5P.MultiChoice")
                    answers = json.loads(archive.read("content/content.json"))["answers"]
                    self.assertEqual(len(answers), 4)
                    self.assertEqual(sum(bool(answer["correct"]) for answer in answers), 1)

    def test_hypervideo_contains_local_video_and_three_interactions(self):
        with zipfile.ZipFile(MEDIA / "h5p/Quadratische_Ergaenzung_Beispielrechnung.h5p") as archive:
            self.assertIsNone(archive.testzip())
            self.assertEqual(json.loads(archive.read("h5p.json"))["mainLibrary"], "H5P.InteractiveVideo")
            content = json.loads(archive.read("content/content.json"))
            self.assertEqual(len(content["interactiveVideo"]["assets"]["interactions"]), 3)
            self.assertEqual(archive.read("content/videos/02_Beispiel_x2_4x_3.mp4"), (MEDIA / "videos/02_Beispiel_x2_4x_3.mp4").read_bytes())

    def test_teacher_materials_are_outside_published_course(self):
        site = ROOT / "_site"
        public_course = site / COURSE.relative_to(ROOT)
        self.assertTrue((public_course / "index.html").is_file())
        self.assertFalse((site / ".local").exists())
        for file in ["Lehrkraft_Start.html", "Lehrkraft_Loesungen.html", "Reihenplanung_Lehrkraft.html", "Qualitaetspruefung.md"]:
            self.assertFalse((public_course / file).exists())


if __name__ == "__main__":
    unittest.main()
