"""Übernimmt die Wurzelwerk-Vorlage und ergänzt die servergebundene Wettbewerbsrunde."""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUIZ = Path('klasse-9/01-arithmetik-algebra/01-reelle-zahlen-und-wurzeln/quiz/wurzelwerk')


def import_quiz(source):
    html = source.read_text(encoding='utf-8')
    script = html.split('<script>')[1].split('</script>')[0]
    functions = []
    for name in ['choose', 'rand', 'rootTask', 'extractTask', 'productTask', 'quotientTask',
                 'lawTask', 'lineTask', 'makeTask', 'shuffle', 'build', 'linePoints']:
        match = re.search(r'^function ' + name + r'\(.*?(?=\r?\nfunction |\r?\nid\(|\r?\nloadRecords|$)', script, re.M | re.S)
        if not match:
            raise ValueError('Vorlagenfunktion fehlt: ' + name)
        functions.append(match[0].strip())
    rules = 'const TYPES=["roots","laws","line"];\n' + '\n'.join(functions) + '\nexport {makeTask,build,linePoints};\n'
    (ROOT / 'werkzeuge/wettkampf_backend/src/wurzelwerk-rules.mjs').write_text(rules, encoding='utf-8')
    target = ROOT / QUIZ
    (target / 'assets').mkdir(parents=True, exist_ok=True)
    (target / 'assets/wurzelwerk.js').write_text((ROOT / 'werkzeuge/wurzelwerk_app.mjs').read_text(encoding='utf-8'), encoding='utf-8')
    (target / 'assets/rules.mjs').write_text(rules, encoding='utf-8')
    (target / 'assets/style.css').write_text((ROOT / 'werkzeuge/wurzelwerk_ui.css').read_text(encoding='utf-8'), encoding='utf-8')
    html = (ROOT / 'werkzeuge/wurzelwerk_vorlage.html').read_text(encoding='utf-8')
    (target / 'index.html').write_text(html.rstrip() + '\n', encoding='utf-8')
    assignment = ROOT / 'dokumentation/MATERIAL_ZUORDNUNG.json'
    data = json.loads(assignment.read_text(encoding='utf-8'))
    url = (QUIZ / 'index.html').as_posix()
    data['materialien'] = [entry for entry in data['materialien'] if entry['url'] != url] + [{
        'bereich': 'klasse-9', 'inhaltsfeld': '01-arithmetik-algebra', 'thema': '01-reelle-zahlen-und-wurzeln',
        'url': url, 'titel': 'Wurzelwerk – Reelle Zahlen und Wurzeln', 'typ': 'Quiz',
        'beschreibung': 'Wurzeln auf drei Stufen üben oder mit mittelschweren Aufgaben, Timer und Zeitbonus im Cloudflare-Wettbewerb antreten.'}]
    assignment.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('WURZELWERK IMPORTIERT:', target)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('datei', type=Path)
    import_quiz(parser.parse_args().datei)
