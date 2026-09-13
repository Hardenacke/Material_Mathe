#!/usr/bin/env python3
"""Baut die veröffentlichbare GitHub-Pages-Ausgabe nach _site/."""
from __future__ import annotations
from pathlib import Path
import json, os, shutil, stat, sys

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


def main():
    if OUT.exists():
        shutil.rmtree(OUT, onerror=remove_readonly)
    OUT.mkdir(parents=True)

    for name in ["index.html", "kurs.html", "style.css", "script.js", "favicon.svg"]:
        shutil.copy2(ROOT / name, OUT / name)

    for area in STRUCT["bereiche"]:
        copy_dir(area["id"])
    copy_dir("gemeinsam")
    copy_dir("dokumentation")

    data = write_catalog(ROOT / "data.json")
    shutil.copy2(ROOT / "data.json", OUT / "data.json")
    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    s = data["statistik"]
    print(f'SITE BUILD OK: _site mit {s["materialien"]} sichtbaren Materialien.')


if __name__ == "__main__":
    main()
