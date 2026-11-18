import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class SiteStructureTests(unittest.TestCase):
    def test_structure_counts(self):
        data=json.loads((ROOT/'struktur.json').read_text(encoding='utf-8'))
        self.assertEqual(len(data['bereiche']), 9)
        self.assertEqual(sum(len(b['inhaltsfelder']) for b in data['bereiche']), 33)
        self.assertEqual(sum(len(f['themen']) for b in data['bereiche'] for f in b['inhaltsfelder']), 105)

    def test_repetition_presentations(self):
        data=json.loads((ROOT/'struktur.json').read_text(encoding='utf-8'))
        ppts=[]
        for b in data['bereiche']:
            for f in b['inhaltsfelder']:
                p=ROOT/b['id']/f['id']/'wiederholung.pptx'
                self.assertTrue(p.exists(), str(p))
                ppts.append(p)
        self.assertEqual(len(ppts),33)

    def test_cross_subject_tools_are_published_separately(self):
        data = json.loads((ROOT / 'data.json').read_text(encoding='utf-8'))
        tools = data['werkzeuge']['materialien']
        safari = [material for material in tools if material['titel'] == 'Ruhe-Safari']
        self.assertEqual(len(safari), 1)
        self.assertEqual(safari[0]['url'], 'tools/ruhe-safari.html')
        self.assertEqual(safari[0]['kategorie'], 'Werkzeug')
        self.assertEqual(data['statistik']['werkzeuge'], len(tools))
        self.assertIn('Werkzeug', data['kategorien'])
        self.assertTrue((ROOT / '_site' / safari[0]['url']).is_file())
        self.assertFalse((ROOT / '_site/werkzeuge').exists())
        self.assertFalse(any('assets' in Path(material['url']).parts for material in tools))

if __name__ == '__main__':
    unittest.main()
