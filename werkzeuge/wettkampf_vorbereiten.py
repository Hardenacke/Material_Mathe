#!/usr/bin/env python3
"""Mathematik-Paket lokal für ein separates privates Worker-Repository vorbereiten."""
from __future__ import annotations

import argparse
import re
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / ".local/wettkaempfe/Material_Mathe_Wettkampf_API"
PREFIX = "Wettkampf_Architekturen_Mathe_Physik/Mathematik/"


def package_backend() -> Path:
    output = TARGET.parent / "Mathematik_Wettkampf_Backend.zip"
    directories = {"src", "scripts", "schemas", "datenmodell", "fragenpools", "wettkaempfe",
                   "test", "integration", "vorlage", "dokumentation", "public"}
    files = {"package.json", "package-lock.json", "wrangler.jsonc", ".gitignore", "README.md"}
    excluded = {"node_modules", "verwaltung", ".git", ".wrangler", ".deploy-check", "generated", "__pycache__"}
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for source in sorted(TARGET.rglob("*")):
            if not source.is_file():
                continue
            relative = source.relative_to(TARGET)
            if any(part in excluded for part in relative.parts):
                continue
            if relative.parts[0] not in directories and relative.as_posix() not in files:
                continue
            if source.name.startswith(".env") or source.name == ".dev.vars" or source.suffix in {".log", ".zip"}:
                continue
            archive.write(source, "Material_Mathe_Wettkampf_API/" + relative.as_posix())
    print(f"Privates Backend-Paket: {output}")
    return output


def prepare(archive: Path) -> Path:
    TARGET.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive) as source:
        for entry in source.infolist():
            if entry.is_dir() or not entry.filename.startswith(PREFIX):
                continue
            relative = Path(entry.filename.removeprefix(PREFIX))
            if relative.parts[0] == "backend":
                relative = Path(*relative.parts[1:])
            else:
                relative = Path("vorlage") / relative
            destination = (TARGET / relative).resolve()
            if not destination.is_relative_to(TARGET.resolve()):
                raise ValueError("Unzulässiger Pfad im ZIP")
            # Eigene Fragen, Konfigurationen und bearbeitete Vorlagen erhalten.
            if destination.exists():
                continue
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(source.read(entry))
    shutil.copytree(ROOT / "werkzeuge/wettkampf_backend", TARGET, dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns("__pycache__", "node_modules", ".wrangler"))
    # Nur öffentliche Portaldateien als Worker-Assets übernehmen, niemals Backend oder Codes.
    portal = TARGET / "public"
    portal.mkdir(exist_ok=True)
    for name in ["index.html", "app.js", "style.css", "config.js"]:
        shutil.copy2(ROOT / "wettkaempfe" / name, portal / name)
    for name in ["assets", "vendor"]:
        shutil.copytree(ROOT / "wettkaempfe" / name, portal / name, dirs_exist_ok=True)
    shutil.copy2(ROOT / "favicon.svg", portal / "favicon.svg")
    config, replacements = re.subn(r"apiBaseUrl:\s*'[^']*'", "apiBaseUrl: globalThis.location.origin",
                                   (portal / "config.js").read_text(encoding="utf-8"), count=1)
    if replacements != 1:
        raise ValueError("API-Adresse im Portal nicht gefunden")
    (portal / "config.js").write_text(config, encoding="utf-8")
    page = (portal / "index.html").read_text(encoding="utf-8")
    (portal / "index.html").write_text(page.replace('href="../index.html"',
        'href="https://hardenacke.github.io/Material_Mathe/"'), encoding="utf-8")
    quiz = Path("klasse-9/01-arithmetik-algebra/01-reelle-zahlen-und-wurzeln/quiz/wurzelwerk")
    if (ROOT / quiz).exists():
        shutil.copytree(ROOT / quiz, portal / quiz, dirs_exist_ok=True)
        shutil.copytree(ROOT / "wettkaempfe/vendor", portal / "wettkaempfe/vendor", dirs_exist_ok=True)
        quiz_page = portal / quiz / "index.html"
        quiz_page.write_text(quiz_page.read_text(encoding="utf-8").replace(
            'href="../../../../../index.html#/klasse-9/01-arithmetik-algebra/quiz"',
            'href="https://hardenacke.github.io/Material_Mathe/index.html#/klasse-9/kursmaterial/quiz"'), encoding="utf-8")
    for name in ["WETTBEWERBE.md", "WETTBEWERBE_PRUEFUNG.md"]:
        document = ROOT / "dokumentation" / name
        if document.is_file():
            (TARGET / "dokumentation").mkdir(exist_ok=True)
            shutil.copy2(document, TARGET / "dokumentation" / name)
    print(f"Privates Backend vorbereitet: {TARGET}")
    print("Im Backend: npm install, npm run check, npm test, npm run test:integration")
    return TARGET


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("zip", type=Path)
    parser.add_argument("--paket", action="store_true", help="Backend-ZIP ohne Zugänge und Laufzeitdaten erzeugen")
    arguments = parser.parse_args()
    prepare(arguments.zip)
    if arguments.paket:
        package_backend()
