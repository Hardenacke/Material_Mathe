#!/usr/bin/env python3
"""Baut die veröffentlichbare GitHub-Pages-Ausgabe nach _site/."""
from __future__ import annotations
from pathlib import Path
import json, os, re, shutil, stat, sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_site"
sys.path.insert(0, str(ROOT / "werkzeuge"))
from katalog import write_catalog  # noqa: E402

STRUCT = json.loads((ROOT / "struktur.json").read_text(encoding="utf-8"))
EXCLUDE_DIRS = {"privat", "entwuerfe", ".git", ".github", "_site", "__pycache__", "tests", "werkzeuge"}


def ignore(_dir: str, names: list[str]) -> set[str]:
    return {n for n in names if n in EXCLUDE_DIRS or n == ".DS_Store"}


def copy_dir(name: str):
    src = ROOT / name
    if src.exists():
        shutil.copytree(src, OUT / name, dirs_exist_ok=True, ignore=ignore)


def remove_readonly(func, path: str, _exc_info):
    os.chmod(path, stat.S_IWRITE)
    func(path)


def add_material_navigation():
    """Ergänzt Rückwege nur in erzeugten HTML-Dateien, nie in Materialquellen."""
    # Übersichten und Folgeseiten brauchen ebenfalls den Rückweg.
    for page in sorted(OUT.rglob("*")):
        if page == OUT / "index.html" or page.suffix.lower() not in {".html", ".htm"} or not page.is_file():
            continue
        relative_script = os.path.relpath(OUT / "material-navigation.js", page.parent).replace(os.sep, "/")
        script = f'<script src="{relative_script}" defer data-sammlung-navigation></script>'
        content = page.read_text(encoding="utf-8")
        if "data-sammlung-navigation" in content:
            continue
        closing_body = list(re.finditer(r"</body\s*>", content, flags=re.IGNORECASE))
        position = closing_body[-1].start() if closing_body else len(content)
        page.write_text(content[:position] + script + "\n" + content[position:], encoding="utf-8")


def main():
    if OUT.exists():
        shutil.rmtree(OUT, onerror=remove_readonly)
    OUT.mkdir(parents=True)

    for name in ["index.html", "style.css", "script.js", "material-navigation.js", "favicon.svg"]:
        shutil.copy2(ROOT / name, OUT / name)

    for area in STRUCT["bereiche"]:
        copy_dir(area["id"])
    copy_dir("methoden")
    copy_dir("lernspiele")
    copy_dir("gemeinsam")
    copy_dir("dokumentation")

    data = write_catalog(ROOT / "data.json")
    add_material_navigation()
    shutil.copy2(ROOT / "data.json", OUT / "data.json")
    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    s = data["statistik"]
    print(f'SITE BUILD OK: _site mit {s["materialien"]} sichtbaren Materialien.')


if __name__ == "__main__":
    main()
