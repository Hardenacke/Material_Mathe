#!/usr/bin/env python3
"""Baut die veröffentlichbare GitHub-Pages-Ausgabe nach _site/."""
from __future__ import annotations
from pathlib import Path
import json, os, re, shutil, stat, sys, time

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_site"
sys.path.insert(0, str(ROOT / "werkzeuge"))
from katalog import write_catalog  # noqa: E402

STRUCT = json.loads((ROOT / "struktur.json").read_text(encoding="utf-8"))
EXCLUDE_DIRS = {"privat", "entwuerfe", "ergebnisse", ".git", ".github", "_site", "__pycache__", "tests", "werkzeuge"}


def ignore(_dir: str, names: list[str]) -> set[str]:
    return {n for n in names if n in EXCLUDE_DIRS or n == ".DS_Store"}


def copy_dir(name: str):
    src = ROOT / name
    if src.exists():
        shutil.copytree(src, OUT / name, dirs_exist_ok=True, ignore=ignore)


class OutputLockedError(RuntimeError):
    """Die erzeugte Ausgabe lässt sich gerade nicht vollständig bereinigen."""


def remove_readonly(func, path: str, exc_info):
    error = exc_info[1]
    if not isinstance(error, PermissionError) or func not in {os.unlink, os.remove, os.rmdir}:
        raise error
    os.chmod(path, stat.S_IREAD | stat.S_IWRITE)
    func(path)


def remove_output_entry(path: Path):
    # Ein noch geöffneter Datei-Handle oder OneDrive kann das Löschen kurz sperren.
    delays = (0.1, 0.2, 0.4, 0.8, 1.6)
    for attempt in range(len(delays) + 1):
        try:
            if path.is_symlink():
                path.unlink()
            elif path.is_junction():
                path.rmdir()
            elif path.is_dir():
                if not path.resolve().is_relative_to(OUT.resolve()):
                    raise ValueError(f"Unzulässiger Löschpfad außerhalb von _site: {path}")
                shutil.rmtree(path, onerror=remove_readonly)
            else:
                try:
                    path.unlink()
                except PermissionError:
                    os.chmod(path, stat.S_IREAD | stat.S_IWRITE)
                    path.unlink()
            return
        except FileNotFoundError:
            if not path.exists() and not path.is_symlink():
                return
            # Verschwindet nur eine Unterdatei, muss der verbleibende Inhalt
            # trotzdem bereinigt werden, bevor der Build fortgesetzt wird.
            if attempt == len(delays):
                raise
        except OSError as exc:
            if not isinstance(exc, PermissionError) and getattr(exc, "winerror", None) not in {5, 32, 33, 145}:
                raise
            if attempt == len(delays):
                blocked = exc.filename or str(path)
                raise OutputLockedError(
                    f"Datei oder Ordner weiterhin gesperrt: {blocked}\n"
                    "Geöffnete Dateien und Explorer-Vorschauen in _site schließen; "
                    "bei laufender OneDrive-Synchronisierung kurz warten oder sie pausieren. "
                    "Danach den Build erneut starten."
                ) from exc
            time.sleep(delays[attempt])


def prepare_output():
    # Nur die ausdrücklich erzeugte Ausgabe darf rekursiv gelöscht werden.
    if OUT.is_symlink() or OUT.is_junction() or OUT.resolve() != ROOT.resolve() / "_site":
        raise ValueError(f"Unzulässiger Ausgabeordner: {OUT}")
    OUT.mkdir(parents=True, exist_ok=True)
    # Den Ordner selbst behalten: Windows sperrt aktuelle Arbeitsverzeichnisse.
    for path in list(OUT.iterdir()):
        remove_output_entry(path)


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
    prepare_output()

    for name in ["index.html", "style.css", "script.js", "material-navigation.js", "favicon.svg"]:
        shutil.copy2(ROOT / name, OUT / name)

    for area in STRUCT["bereiche"]:
        copy_dir(area["id"])
    copy_dir("methoden")
    copy_dir("lernspiele")
    copy_dir("wettkaempfe")
    copy_dir("gemeinsam")
    copy_dir("dokumentation")

    data = write_catalog(ROOT / "data.json")
    add_material_navigation()
    shutil.copy2(ROOT / "data.json", OUT / "data.json")
    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    s = data["statistik"]
    print(f'SITE BUILD OK: _site mit {s["materialien"]} sichtbaren Materialien.')


if __name__ == "__main__":
    try:
        main()
    except OutputLockedError as exc:
        print(f"SITE BUILD FEHLGESCHLAGEN: {exc}", file=sys.stderr)
        sys.exit(1)
