#!/usr/bin/env python3
from pathlib import Path
import json, sys
ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'struktur.json').read_text(encoding='utf-8'))
expected = []
for bereich in DATA['bereiche']:
    for feld in bereich['inhaltsfelder']:
        for thema in feld['themen']:
            d = ROOT / bereich['id'] / feld['id'] / thema['id']
            expected.append(d)
errors = []
for d in expected:
    if not d.is_dir(): errors.append(f'Ordner fehlt: {d.relative_to(ROOT)}')
    elif not (d / '.gitkeep').exists() and not any(x.is_file() for x in d.iterdir()): errors.append(f'.gitkeep fehlt im leeren Ordner: {d.relative_to(ROOT)}')
# Sanity checks for required top-level files
for name in ['README.md','AGENTS.md','ORDNERSTRUKTUR.md','struktur.json']:
    if not (ROOT / name).exists(): errors.append(f'Datei fehlt: {name}')
if errors:
    print('STRUKTURPRÜFUNG FEHLGESCHLAGEN')
    for e in errors: print('-', e)
    sys.exit(1)
print(f'STRUKTURPRÜFUNG OK: {len(expected)} Themenordner in {len(DATA["bereiche"])} Bereichen.')
