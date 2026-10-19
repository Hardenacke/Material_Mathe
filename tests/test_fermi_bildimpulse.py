import base64
import hashlib
import json
import sys
import unittest
from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "werkzeuge"))
from katalog import build_catalog


class TaskPage(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
        self.external_links = []
        self.task_text = []
        self.in_task = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "img":
            self.images.append(attrs)
        if tag == "p" and attrs.get("class") == "task":
            self.in_task = True
        for key in ("href", "src"):
            url = attrs.get(key, "")
            if url.startswith(("http:", "https:", "//")):
                self.external_links.append(url)

    def handle_endtag(self, tag):
        if tag == "p":
            self.in_task = False

    def handle_data(self, data):
        if self.in_task:
            self.task_text.append(data)


class FermiImageTasksTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = build_catalog()
        cls.assignments = json.loads((ROOT / "dokumentation/FERMI_ZUORDNUNG.json").read_text(encoding="utf-8"))["aufgaben"]

    def test_all_104_imported_tasks_have_their_image_and_self_contained_html(self):
        tasks = {url: assignment for url, assignment in self.assignments.items() if assignment.get("bildimpuls")}
        self.assertEqual(len(tasks), 104)
        expected_names = {f"{grade}.{number}{suffix}.html" for grade in range(5, 11) for number in range(1, 5) for suffix in ("", "b")}
        expected_names.update(f"{grade}.{number}c.html" for grade in range(5, 10) for number in range(5, 10))
        expected_names.update(f"10.{number}c.html" for number in range(6, 10))
        expected_names.update(f"EF.{number}{suffix}.html" for number in (1, 2) for suffix in ("", "b"))
        expected_names.update({"EF.3c.html", "EF.4c.html"})
        expected_names.update(f"{grade}.{number}{suffix}.html" for grade in ("Q1", "Q2") for number in range(1, 4) for suffix in ("", "b"))
        expected_names.update(f"Q1.{number}c.html" for number in range(4, 9))
        expected_names.update(f"Q2.{number}c.html" for number in range(4, 8))
        self.assertEqual({task["originaldatei"] for task in tasks.values()}, expected_names)
        for url, assignment in tasks.items():
            with self.subTest(url=url):
                page = ROOT / url
                parser = TaskPage()
                parser.feed(page.read_text(encoding="utf-8"))
                self.assertGreater(len("".join(parser.task_text)), 100)
                self.assertEqual(len(parser.images), 1)
                self.assertTrue(parser.images[0].get("alt"))
                prefix, image = parser.images[0]["src"].split(",", 1)
                decoded = base64.b64decode(image, validate=True)
                if assignment["bildtyp"] == "JPEG":
                    self.assertEqual(prefix, "data:image/jpeg;base64")
                    self.assertTrue(decoded.startswith(b"\xff\xd8") and decoded.endswith(b"\xff\xd9"))
                else:
                    self.assertEqual(prefix, "data:image/svg+xml;base64")
                    self.assertEqual(ET.fromstring(decoded).tag, "{http://www.w3.org/2000/svg}svg")
                self.assertEqual(parser.external_links, [])
                self.assertEqual(page.name, assignment["originaldatei"])
                self.assertEqual(page.parent.name, assignment["inhaltsfelder"][0])
                year = page.name.split(".")[0]
                overview_folder = page.parent.parent
                if year.startswith("Q"):
                    self.assertEqual(overview_folder.name, year.lower())
                    overview_folder = overview_folder.parent
                overview = overview_folder / "index.html"
                relative = page.relative_to(overview_folder).as_posix()
                self.assertIn(f'href="{relative}"', overview.read_text(encoding="utf-8"))
                digest = hashlib.sha256(page.read_text(encoding="utf-8").encode("utf-8")).hexdigest()
                self.assertEqual(digest, assignment["sha256_html"])
        self.assertEqual(sum(task["bildtyp"] == "JPEG" for task in tasks.values()), 72)
        self.assertEqual(sum(task["bildtyp"] == "SVG" for task in tasks.values()), 32)

    def test_assignments_cover_all_tasks_and_match_archive_subjects(self):
        catalog_urls = {task["url"] for area in self.catalog["bereiche"] for task in area["zusatzaufgaben"]}
        self.assertEqual(set(self.assignments), catalog_urls)
        lower = {"Arithmetik/Algebra": "01-arithmetik-algebra", "Funktionen": "02-funktionen", "Geometrie": "03-geometrie", "Stochastik": "04-stochastik", "Daten und Häufigkeiten": "04-stochastik"}
        upper = {"Funktionen und Analysis": "01-funktionen-und-analysis", "Analysis": "01-funktionen-und-analysis", "Analytische Geometrie/Lineare Algebra": "02-analytische-geometrie-und-lineare-algebra", "Analytische Geometrie": "02-analytische-geometrie-und-lineare-algebra", "Stochastik": "03-stochastik"}
        for area in self.catalog["bereiche"]:
            pictured = [task for task in area["zusatzaufgaben"] if task.get("bildimpuls")]
            expected_count = 6 if area["id"] == "ef" else 21 if area["id"].startswith("q1-q2-") else 12 if area["id"] == "klasse-10" else 13
            self.assertEqual(len(pictured), expected_count)
            for task in pictured:
                with self.subTest(url=task["url"]):
                    domain = self.assignments[task["url"]]["originaltitel"].split(" – ")[1]
                    expected = (lower if area["id"].startswith("klasse-") else upper)[domain]
                    self.assertEqual(task["inhaltsfelder"], [expected])
                    self.assertIn("Bildimpuls", task["beschreibung"])


if __name__ == "__main__":
    unittest.main()
