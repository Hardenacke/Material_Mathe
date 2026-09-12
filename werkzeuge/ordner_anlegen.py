#!/usr/bin/env python3
from pathlib import Path
import argparse, json, sys
ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'struktur.json').read_text(encoding='utf-8'))
parser = argparse.ArgumentParser()
parser.add_argument('--check', action='store_true', help='Nur prüfen, nichts anlegen.')
args = parser.parse_args()
missing = []
for bereich in DATA['bereiche']:
    for feld in bereich['inhaltsfelder']:
        for thema in feld['themen']:
            d = ROOT / bereich['id'] / feld['id'] / thema['id']
            if not d.is_dir():
                missing.append(d)
                if not args.check:
                    d.mkdir(parents=True, exist_ok=True)
            keep = d / '.gitkeep'
            if not keep.exists():
                if args.check:
                    missing.append(keep)
                else:
                    keep.write_text('', encoding='utf-8')
if missing:
    print(f'{len(missing)} fehlende Einträge gefunden.')
    for p in missing[:30]: print('-', p.relative_to(ROOT))
    if args.check: sys.exit(1)
    print('Fehlende Ordner/Platzhalter wurden angelegt.')
else:
    print('Struktur vollständig.')
