#!/usr/bin/env python3
"""Importiert das bereitgestellte Materialpaket für Klasse 9 in die Materialsammlung."""
from __future__ import annotations

import argparse
import json
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "Materialpaket_Quadratische_Funktionen/"
TOPIC = ROOT / "klasse-9/02-funktionen/01-quadratische-funktionen"
COURSE = TOPIC / "lernpfad-quadratische-funktionen"
MEDIA = TOPIC / "assets/quadratische-ergaenzung"
SOURCES = ROOT / "werkzeuge/manim/quadratische-ergaenzung"
TEACHER = ROOT / ".local/quadratische-funktionen/lehrkraftpaket"


def relative_path(name: str, prefix: str) -> Path:
    path = Path(name.removeprefix(prefix))
    if path.is_absolute() or ".." in path.parts:
        raise ValueError(f"Unzulässiger Archivpfad: {name}")
    return path


def write(target: Path, content: bytes) -> None:
    if not target.resolve().is_relative_to(ROOT):
        raise ValueError(f"Unzulässiger Zielpfad: {target}")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(content)


def import_package(path: Path) -> None:
    learner_prefix = PREFIX + "02_Lernendenpaket/Quadratische_Funktionen_Lernendenpaket/"
    teacher_prefix = PREFIX + "01_Lehrkraftpaket/Quadratische_Funktionen_HTML/"
    video_prefix = PREFIX + "03_Manim_Erklaervideos/Quadratische_Ergaenzung_Manim/"
    integration_css = (COURSE / "assets/integration.css").read_text(encoding="utf-8")
    with zipfile.ZipFile(path) as archive:
        for entry in archive.infolist():
            if entry.is_dir():
                continue
            if entry.filename.startswith(learner_prefix):
                relative = relative_path(entry.filename, learner_prefix)
                if relative.suffix not in {".html", ".h5p"}:
                    continue
                data = archive.read(entry)
                if relative.name == "06_Normalform_in_Scheitelpunktform.html":
                    content = data.decode("utf-8")
                    # Das neue Paket enthält die Videos direkt im Lernpfad. Sein
                    # Kontrollfragen-Skript erwartet eine ID, die am Video fehlt.
                    if 'id="video-checkpoint-data"' in content and 'id="worked-example-video"' not in content:
                        video = '<video controls playsinline preload="metadata" aria-label="Beispielrechnung mit drei Zahlen-Kontrollfragen">'
                        if content.count(video) != 1:
                            raise ValueError("Das Beispielvideo im sechsten Lernpfad ist nicht eindeutig.")
                        content = content.replace(video, video.replace("<video ", '<video id="worked-example-video" '))
                    marker = '<section class="callout reflection-card"'
                    addition = ('<section class="callout"><h2>Quadratische Ergänzung in drei Erklärvideos</h2>'
                                '<p>Schau dir die Flächenidee, eine Beispielrechnung und eine weitere Übung an.</p>'
                                '<a class="secondary" href="../quadratische-ergaenzung-videos.html">'
                                'Zu den Erklärvideos →</a></section>\n')
                    if content.count(marker) != 1:
                        raise ValueError("Die Einfügestelle im sechsten Lernpfad ist nicht eindeutig.")
                    data = content.replace(marker, addition + marker).encode("utf-8")
                if relative.suffix == ".html":
                    content = data.decode("utf-8")
                    if content.count("</head>") != 1:
                        raise ValueError(f"HTML-Kopf nicht eindeutig: {relative}")
                    data = content.replace("</head>", '<style data-sammlung-anpassung>\n' + integration_css + '\n</style>\n</head>').encode("utf-8")
                write(COURSE / relative, data)
            elif entry.filename.startswith(teacher_prefix):
                relative = relative_path(entry.filename, teacher_prefix)
                write(TEACHER / "Quadratische_Funktionen_HTML" / relative, archive.read(entry))
            elif entry.filename.startswith(video_prefix):
                relative = relative_path(entry.filename, video_prefix)
                if relative.suffix == ".mp4" or relative.suffix == ".h5p":
                    write(MEDIA / relative, archive.read(entry))
                elif relative.as_posix() not in {"render.sh", "README.md", "Qualitaetscheck.md"}:
                    data = archive.read(entry)
                    if relative.as_posix() == "h5p/build_hypervideo.py":
                        content = data.decode("utf-8").replace(
                            'VIDEO_FILE = PROJECT_DIR / "videos" / VIDEO_NAME',
                            'PUBLIC_DIR = PROJECT_DIR.parents[2] / "klasse-9/02-funktionen/01-quadratische-funktionen/assets/quadratische-ergaenzung"\n'
                            'VIDEO_FILE = PUBLIC_DIR / "videos" / VIDEO_NAME')
                        content = content.replace('OUTPUT_FILE = H5P_DIR /', 'OUTPUT_FILE = PUBLIC_DIR / "h5p" /')
                        data = content.encode("utf-8")
                    write(SOURCES / relative, data)
        write(COURSE / "assets/lizenzen/KaTeX_LICENSE", archive.read(teacher_prefix + "vendor/katex/LICENSE"))
        app = archive.read(teacher_prefix + "assets/app.js").decode("utf-8")
        names = json.loads(re.search(r"var names=(\[.*?\]);", app).group(1))
        goals = json.loads(re.search(r"var goals=(\[.*?\]);", app).group(1))

    entries = [{
        "bereich": "klasse-9", "inhaltsfeld": "02-funktionen", "thema": "01-quadratische-funktionen",
        "url": (COURSE / "index.html").relative_to(ROOT).as_posix(),
        "titel": "Quadratische Funktionen – zwölf interaktive Lernpfade", "typ": "Lernpfad",
        "beschreibung": "Die gesamte Lernpfadreihe: von der Normalparabel und ihren Parametern bis zu Nullstellen, Modellierung und Optimierung."
    }]
    for index, file in enumerate(sorted(COURSE.glob("[0-9][0-9]_*.html"))):
        lesson = index + 1
        field = "01-arithmetik-algebra" if lesson == 8 else "02-funktionen"
        topic = "03-quadratische-gleichungen" if lesson == 8 else "01-quadratische-funktionen" if lesson <= 6 else "02-nullstellen-und-modellierung"
        entries.append({"bereich": "klasse-9", "inhaltsfeld": field, "thema": topic,
                        "url": file.relative_to(ROOT).as_posix(), "titel": f"{lesson:02d} · {names[index]}",
                        "typ": "Lernpfad", "beschreibung": goals[index]})
    if len(entries) != 13:
        raise ValueError("Zwölf Lernpfade und ihre Übersicht erwartet.")
    entries.append({"bereich": "klasse-9", "inhaltsfeld": "02-funktionen", "thema": "01-quadratische-funktionen",
                    "url": (TOPIC / "quadratische-ergaenzung-videos.html").relative_to(ROOT).as_posix(),
                    "titel": "Quadratische Ergänzung – drei Erklärvideos", "typ": "Video",
                    "beschreibung": "Flächenidee, Beispielrechnung und Übung: von der Normalform zur Scheitelpunktform; mit H5P-Hypervideo zum Herunterladen."})
    registry = ROOT / "dokumentation/MATERIAL_ZUORDNUNG.json"
    data = json.loads(registry.read_text(encoding="utf-8")) if registry.exists() else {"schemaVersion": 1, "materialien": []}
    replacements = {entry["url"]: entry for entry in entries}
    data["materialien"] = [replacements.pop(entry["url"], entry) for entry in data["materialien"]]
    data["materialien"].extend(replacements.values())
    write(registry, (json.dumps(data, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))

    teacher_zip = TEACHER.parent / "Lehrkraftpaket_Quadratische_Funktionen.zip"
    with zipfile.ZipFile(teacher_zip, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for file in sorted(TEACHER.rglob("*")):
            if file.is_file():
                archive.write(file, file.relative_to(TEACHER).as_posix())
    print("Importiert: zwölf Lernpfade, Übersicht, zwölf H5P-Quizze, drei Videos und ein H5P-Hypervideo.")
    print(f"Lehrkraftmaterial lokal: {teacher_zip}")
    print("Anschließend Website bauen und prüfen.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("zip", type=Path)
    import_package(parser.parse_args().zip)
