import json
import re
import sys
import unittest
from html.parser import HTMLParser
from html import unescape
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
FERMI_FOLDERS = [ROOT / f"klasse-{grade}/zusatzaufgaben/fermi-aufgaben" for grade in range(5, 11)] + [
    ROOT / "ef/zusatzaufgaben/fermi-aufgaben",
    ROOT / "gemeinsam/zusatzaufgaben/fermi-aufgaben/q1-q2",
]
sys.path.insert(0, str(ROOT / "werkzeuge"))
from katalog import build_catalog


class PageLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in {"href", "src"} and value:
                self.links.append(value)


class FermiIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = build_catalog()

    def test_tasks_are_in_their_year_and_category(self):
        self.assertIn("Zusatzaufgaben", self.catalog["kategorien"])
        self.assertEqual(self.catalog["statistik"]["zusatzaufgaben"], 187)
        self.assertEqual(self.catalog["statistik"]["fermi_aufgaben"], 160)
        for area in self.catalog["bereiche"]:
            with self.subTest(area=area["id"]):
                tasks = area["zusatzaufgaben"]
                expected_count = 8 if area["id"] == "ef" else 27 if area["id"].startswith("q1-q2-") else 20 if area["id"] == "klasse-10" else 21
                self.assertEqual(len(tasks), expected_count)
                for task in tasks:
                    self.assertEqual(task["typ"], "Fermi-Aufgabe")
                    self.assertEqual(task["kategorie"], "Zusatzaufgaben")
                    prefix = "gemeinsam/zusatzaufgaben/fermi-aufgaben/q1-q2/" if area["id"].startswith("q1-q2-") else f'{area["id"]}/zusatzaufgaben/fermi-aufgaben/'
                    self.assertTrue(task["url"].startswith(prefix))
                    self.assertTrue(task["titel"].strip())
                    self.assertNotRegex(task["titel"], r"^(?:\d+|EF|Q[12])\.\d+[a-z]?\b")
                    self.assertNotIn(".html", task["titel"])
                    self.assertTrue(task["inhaltsfelder"])
                    self.assertTrue(set(task["inhaltsfelder"]).issubset({field["id"] for field in area["inhaltsfelder"]}))
                    if area["id"].startswith("klasse-"):
                        self.assertIn(area["titel"], task["beschreibung"])
                    elif area["id"] == "ef":
                        self.assertIn("EF", task["beschreibung"])
                    else:
                        self.assertRegex(task["beschreibung"], r"^Q[12] · ")
                files = {task["datei"] for task in tasks}
                self.assertNotIn("index.html", files)
                self.assertNotIn("README.md", files)

    def test_structure_and_material_totals_remain_consistent(self):
        statistics = self.catalog["statistik"]
        self.assertEqual([statistics[key] for key in ("bereiche", "inhaltsfelder", "themen")], [9, 33, 105])
        urls = []
        for area in self.catalog["bereiche"]:
            urls.extend(material["url"] for material in area["unterstuetzung"] + area["zusatzaufgaben"])
            for field in area["inhaltsfelder"]:
                urls.extend(material["url"] for material in field["materialien"])
                for topic in field["themen"]:
                    urls.extend(material["url"] for material in topic["materialien"])
        self.assertEqual(len(urls), statistics["materialien"])
        shared = {url: count for url, count in Counter(urls).items() if count > 1}
        self.assertEqual(len(shared), 27)
        self.assertTrue(all(url.startswith("gemeinsam/zusatzaufgaben/fermi-aufgaben/q1-q2/") and count == 2 for url, count in shared.items()))
        generated = json.loads((ROOT / "data.json").read_text(encoding="utf-8"))
        self.assertEqual(generated, self.catalog)

    def test_overview_and_task_links_survive_distribution(self):
        pages = sorted(page for folder in FERMI_FOLDERS for page in folder.glob("*.html"))
        self.assertEqual(len(pages), 64)
        for page in pages:
            with self.subTest(page=page.relative_to(ROOT)):
                parser = PageLinks()
                parser.feed(page.read_text(encoding="utf-8"))
                for link in parser.links:
                    parts = urlsplit(link)
                    self.assertFalse(parts.scheme or parts.netloc, f"Externe Abhängigkeit: {link}")
                    target = (page.parent / unquote(parts.path)).resolve()
                    self.assertTrue(target.is_relative_to(ROOT), link)
                    self.assertTrue(target.is_file(), f"Defekter Link: {page.name} → {link}")

    def test_updated_questions_match_browser_titles_and_navigation(self):
        tasks = {task["url"]: task for area in self.catalog["bereiche"] for task in area["zusatzaufgaben"]}
        pages = sorted(ROOT / url for url in tasks)
        self.assertEqual(len(pages), 160)
        self.assertEqual(len({task["titel"].casefold() for task in tasks.values()}), 160)
        headings = {}
        for page in pages:
            html = page.read_text(encoding="utf-8")
            heading = unescape(re.search(r"<h1>(.*?)</h1>", html)[1])
            headings[page.resolve()] = heading
            self.assertEqual(heading, tasks[page.relative_to(ROOT).as_posix()]["titel"])
            title = unescape(re.search(r"<title>(.*?)</title>", html)[1])
            self.assertEqual(title, f"{heading} · Fermi-Aufgaben Mathe")
            if not tasks[page.relative_to(ROOT).as_posix()].get("bildimpuls"):
                self.assertIn(f'data-task="{page.stem}"', html)

        for page in pages:
            html = page.read_text(encoding="utf-8")
            navigation_match = re.search(r'<nav class="navrow".*?</nav>', html)
            if not navigation_match:
                continue
            navigation = navigation_match[0]
            for link, label in re.findall(r'<a href="([^"]+)">([^<]+)</a>', navigation):
                target = (page.parent / link).resolve()
                if target in headings:
                    self.assertEqual(unescape(label).removeprefix("← ").removesuffix(" →"), headings[target])

    def test_shared_courses_and_prompting_references(self):
        courses = [area for area in self.catalog["bereiche"] if area["id"].startswith("q1-q2-")]
        self.assertEqual(len(courses), 2)
        self.assertEqual({task["url"] for task in courses[0]["zusatzaufgaben"]}, {task["url"] for task in courses[1]["zusatzaufgaben"]})
        reference = ROOT / "gemeinsam/vorlagen/fermi-aufgaben/Fermi-Aufgaben_Mathematik.md"
        self.assertEqual(len(re.findall(r"^#### \d+\.", reference.read_text(encoding="utf-8"), re.M)), 30)
        prompt = (ROOT / "gemeinsam/vorlagen/Prompt_Fermi-Aufgaben_Mathematik.md").read_text(encoding="utf-8")
        self.assertIn("fermi-aufgaben/Fermi-Aufgaben_Mathematik.md", prompt)
        self.assertIn("untere und obere Schranke", prompt)
        self.assertIn("Ausgabe als HTML", prompt)
        self.assertFalse(any("vorlagen/" in task["url"] for area in self.catalog["bereiche"] for task in area["zusatzaufgaben"]))


if __name__ == "__main__":
    unittest.main()
