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
    script = re.sub(r'^function loadRecords\(.*?(?=^function sorted)', 'function loadRecords(){records=[]}\n', script, flags=re.M | re.S)
    for old, new in [('start', 'startLocal'), ('showTask', 'renderTask'), ('submit', 'trainingSubmit'), ('next', 'trainingNext')]:
        script = script.replace('function ' + old + '(', 'function ' + new + '(', 1)
    script = script.replace('task=makeTask(session.types[session.index],session.level);session.answered=false;',
        'task=session.mode==="competition"?session.remote.question:makeTask(session.types[session.index],session.level);session.answered=session.mode==="competition"?session.remote.answered:false;')
    script = re.sub(r'^function results\(.*?(?=^function home)', '', script, flags=re.M | re.S)
    script = script.replace('ntex(i+1);td1', 'ntex(r.rank||i+1);td1')
    adapter = (ROOT / 'werkzeuge/wurzelwerk_cloudflare.js').read_text(encoding='utf-8')
    script = script.replace('loadRecords();drawBoard();', adapter + '\nloadRecords();drawBoard();')
    target = ROOT / QUIZ
    (target / 'assets').mkdir(parents=True, exist_ok=True)
    (target / 'assets/wurzelwerk.js').write_text(script, encoding='utf-8')
    html = re.sub(r'<script>.*?</script>', '<script src="assets/wurzelwerk.js" defer></script>', html, flags=re.S)
    html = re.sub(r'<link rel="stylesheet" href="https://cdn[^>]+>', '<link rel="stylesheet" href="../../../../../wettkaempfe/vendor/katex/katex.min.css">', html)
    html = re.sub(r'<script src="https://cdn[^>]+></script>', '<script src="../../../../../wettkaempfe/vendor/katex/katex.min.js" defer></script>', html)
    html = html.replace('<header class="header">', '<a href="../../../../../index.html#/klasse-9/01-arithmetik-algebra/quiz">← Zur Quiz-Auswahl</a><header class="header">')
    html = html.replace('Bitte öffne die Datei mit einer Internetverbindung und lade die Seite erneut.', 'Bitte lade die Seite erneut.')
    html = html.replace('<div class="callout"><div class="callout-icon">✦</div>',
        '<div class="block"><label for="competitionCode">Persönlicher Wettbewerbscode</label><input id="competitionCode" type="password" maxlength="128" autocomplete="off" spellcheck="false" class="name-input"><button id="connectCompetition" class="secondary" type="button">Mit Cloudflare verbinden</button><p id="connectionStatus" role="status" aria-live="polite">Verbindung wird geprüft …</p></div><div class="callout"><div class="callout-icon">✦</div>')
    html = html.replace('id="startCompetition" type="button"', 'id="startCompetition" type="button" disabled')
    html = html.replace('Ohne Zeitlimit. Am Ende kannst du dein Ergebnis in die Rangliste eintragen.', 'Ohne Zeitlimit. Cloudflare bewertet und speichert deinen Bestwert automatisch.')
    html = html.replace('<th>Name</th>', '<th>Pseudonym</th>').replace('Die zehn stärksten gespeicherten Ergebnisse', 'Die zehn stärksten Bestwerte deiner Wettbewerbsgruppe')
    html = html.replace('Einträge werden auf diesem Gerät in diesem Browser gespeichert.', 'Gemeinsame Rangliste auf Cloudflare. Zur Anzeige im Wettbewerbsmodus verbinden.')
    html = html.replace('Dieser Browser erlaubt keine lokale Speicherung. Einträge bleiben nur bis zum Schließen der Seite verfügbar.', 'Die gemeinsame Rangliste benötigt eine Verbindung zu Cloudflare.')
    (target / 'index.html').write_text(html.rstrip() + '\n', encoding='utf-8')
    assignment = ROOT / 'dokumentation/MATERIAL_ZUORDNUNG.json'
    data = json.loads(assignment.read_text(encoding='utf-8'))
    url = (QUIZ / 'index.html').as_posix()
    data['materialien'] = [entry for entry in data['materialien'] if entry['url'] != url] + [{
        'bereich': 'klasse-9', 'inhaltsfeld': '01-arithmetik-algebra', 'thema': '01-reelle-zahlen-und-wurzeln',
        'url': url, 'titel': 'Wurzelwerk – Reelle Zahlen und Wurzeln', 'typ': 'Quiz',
        'beschreibung': 'Quadratwurzeln, Wurzelgesetze und Zahlenstrahl: Training auf drei Stufen und Cloudflare-Wettbewerb mit gemeinsamer Rangliste.'}]
    assignment.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('WURZELWERK IMPORTIERT:', target)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('datei', type=Path)
    import_quiz(parser.parse_args().datei)
