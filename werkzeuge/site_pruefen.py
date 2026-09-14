#!/usr/bin/env python3
from pathlib import Path
import json, sys
ROOT = Path(__file__).resolve().parents[1]
errors=[]
for f in [
    "index.html", "style.css", "script.js", "data.json",
    "_site/index.html", "_site/data.json"
]:
    if not (ROOT/f).exists(): errors.append(f"Fehlt: {f}")
data = json.loads((ROOT/"data.json").read_text(encoding="utf-8")) if (ROOT/"data.json").exists() else {}
s = data.get("statistik",{})
expected={"bereiche":9,"inhaltsfelder":33,"themen":105}
for k,v in expected.items():
    if s.get(k)!=v: errors.append(f"{k}: erwartet {v}, gefunden {s.get(k)}")
if s.get("materialien",0) < 33: errors.append("Weniger als 33 sichtbare Materialien; Wiederholungs-PPTs fehlen möglicherweise.")
if (ROOT/"lernspiele").exists() and s.get("lernspiele",0) < 1: errors.append("Lernspiele vorhanden, aber nicht im Katalog sichtbar.")
if any((ROOT/area.get("id","")/"unterstuetzung").exists() for area in data.get("bereiche",[])) and s.get("unterstuetzung",0) < 1: errors.append("Unterstützungsdateien vorhanden, aber nicht im Katalog sichtbar.")
for area in data.get("bereiche",[]):
    for mat in area.get("unterstuetzung",[]):
        if not (ROOT/mat["url"]).exists(): errors.append(f"Materialpfad fehlt: {mat['url']}")
        if (ROOT/"_site").exists() and not (ROOT/"_site"/mat["url"]).exists(): errors.append(f"Materialpfad fehlt in _site: {mat['url']}")
    for field in area.get("inhaltsfelder",[]):
        for mat in field.get("materialien",[]):
            if not (ROOT/mat["url"]).exists(): errors.append(f"Materialpfad fehlt: {mat['url']}")
            if (ROOT/"_site").exists() and not (ROOT/"_site"/mat["url"]).exists(): errors.append(f"Materialpfad fehlt in _site: {mat['url']}")
        for topic in field.get("themen",[]):
            for mat in topic.get("materialien",[]):
                if not (ROOT/mat["url"]).exists(): errors.append(f"Materialpfad fehlt: {mat['url']}")
                if (ROOT/"_site").exists() and not (ROOT/"_site"/mat["url"]).exists(): errors.append(f"Materialpfad fehlt in _site: {mat['url']}")
if errors:
    print("SITE-PRÜFUNG FEHLGESCHLAGEN")
    for e in errors: print("-",e)
    sys.exit(1)
print(f"SITE-PRÜFUNG OK: {s.get('bereiche')} Bereiche, {s.get('inhaltsfelder')} Inhaltsfelder, {s.get('themen')} Themen, {s.get('materialien')} Materialien.")
