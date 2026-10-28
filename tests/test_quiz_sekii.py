"""Prüft Ablage, Materialzuordnung und lokale Ressourcen der 15 Sek-II-Quizze."""
import json
import re
import unittest
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
QUIZZES = json.loads((ROOT / 'dokumentation/QUIZ_SEKII_ZUORDNUNG.json').read_text(encoding='utf-8'))['quizze']


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name in {'src', 'href'} and value:
                self.urls.append(value)


class QuizSekIITests(unittest.TestCase):
    def test_fifteen_unique_quizzes_in_their_phase_course_and_field(self):
        self.assertEqual(len(QUIZZES), 15)
        self.assertEqual(len({item['quizId'] for item in QUIZZES}), 15)
        self.assertEqual(Counter(item['phase'] for item in QUIZZES), {'ef': 3, 'q1': 6, 'q2': 6})
        assignments = json.loads((ROOT / 'dokumentation/MATERIAL_ZUORDNUNG.json').read_text(encoding='utf-8'))['materialien']
        for item in QUIZZES:
            with self.subTest(quiz=item['quizId']):
                self.assertTrue(item['url'].startswith(item['bereich'] + '/' + item['inhaltsfeld'] + '/'))
                assigned = [entry for entry in assignments if entry['url'] == item['url']]
                self.assertEqual(len(assigned), 1)
                self.assertEqual(assigned[0]['typ'], 'Quiz')
                text = (ROOT / item['url']).read_text(encoding='utf-8')
                config = json.loads(re.search(r'^const QUIZ=(.*);$', text, re.M)[1])
                self.assertEqual(config['id'], item['quizId'])
                self.assertEqual(config['className'], item['klasse'])
                self.assertEqual(config['phase'], item['phase'])
                self.assertEqual(config['course'], item['kurs'])

    def test_every_ranking_queries_only_its_own_quiz_and_grade(self):
        for item in QUIZZES:
            with self.subTest(quiz=item['quizId']):
                page = (ROOT / item['rangliste']).read_text(encoding='utf-8')
                match = re.search(r'const quizId=("[^"]+"),className=("[^"]+")[,;]', page)
                self.assertIsNotNone(match)
                self.assertEqual(json.loads(match[1]), item['quizId'])
                self.assertEqual(json.loads(match[2]), item['klasse'])
                self.assertIn("/api/v1/leaderboard?quizId='+encodeURIComponent(quizId)+'&class='+encodeURIComponent(className)", page)
                self.assertIn("key='matheQuizLocalLeaderboard:'+quizId", page)

    def test_quiz_and_ranking_links_exist_with_shared_local_formula_renderer(self):
        pages = [ROOT / item[key] for item in QUIZZES for key in ['url', 'rangliste']]
        pages += list((ROOT / 'gemeinsam/quiz-sekii/assets').glob('*.html'))
        for page in pages:
            parser = Links()
            parser.feed(page.read_text(encoding='utf-8'))
            for raw in parser.urls:
                url = urlsplit(raw)
                if url.scheme or url.netloc or not url.path:
                    continue
                path = (page.parent / unquote(url.path)).resolve()
                with self.subTest(page=page.relative_to(ROOT), link=raw):
                    self.assertTrue(path.is_relative_to(ROOT))
                    self.assertTrue(path.exists(), str(path))

    def test_rankings_are_followup_pages_and_not_extra_material_cards(self):
        catalog = json.loads((ROOT / 'data.json').read_text(encoding='utf-8'))
        urls = []
        for area in catalog['bereiche']:
            for field in area['inhaltsfelder']:
                urls.extend(material['url'] for material in field['materialien'])
                for topic in field['themen']:
                    urls.extend(material['url'] for material in topic['materialien'])
        for item in QUIZZES:
            self.assertEqual(urls.count(item['url']), 1)
            self.assertNotIn(item['rangliste'], urls)

    def test_build_contains_quizzes_but_no_backend(self):
        site = ROOT / '_site'
        for item in QUIZZES:
            self.assertTrue((site / item['url']).is_file())
            self.assertTrue((site / item['rangliste']).is_file())
        self.assertFalse((site / 'werkzeuge/sekii_quiz_backend').exists())
        self.assertTrue((site / 'gemeinsam/quiz-sekii/assets/vendor/katex/katex.min.js').is_file())
