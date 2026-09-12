#!/usr/bin/env python3
"""Erzeugt aus struktur.json und dem Dateibestand die Materialliste data.json."""
from __future__ import annotations
from pathlib import Path
from datetime import date
import json

ROOT = Path(__file__).resolve().parents[1]
STRUCT = json.loads((ROOT / "struktur.json").read_text(encoding="utf-8"))

DISPLAY_EXT = {
    ".html": "HTML", ".htm": "HTML", ".pdf": "PDF", ".pptx": "PPTX", ".ppt": "PPT",
    ".docx": "DOCX", ".doc": "DOC", ".xlsx": "XLSX", ".xls": "XLS", ".csv": "CSV",
    ".md": "MD", ".tex": "TEX", ".zip": "ZIP", ".png": "Bild", ".jpg": "Bild",
    ".jpeg": "Bild", ".svg": "Bild", ".webp": "Bild", ".mp4": "Video", ".webm": "Video",
    ".mp3": "Audio", ".m4a": "Audio", ".wav": "Audio"
}
TECHNICAL_DIRS = {"assets", "css", "js", "images", "img", "fonts", "vendor", "lib"}
HIDDEN_NAMES = {".gitkeep", "desktop.ini", "thumbs.db"}


def pretty_title(file: Path, context: str = "") -> str:
    if file.name.lower() == "wiederholung.pptx":
        return "Wiederholung"
    title = file.stem.replace("_", " ").replace("-", " ")
    return " ".join(title.split()) or context or file.name


def is_display_material(file: Path) -> bool:
    if not file.is_file() or file.name.lower() in HIDDEN_NAMES or file.name.startswith("."):
        return False
    if file.suffix.lower() not in DISPLAY_EXT:
        return False
    rel_parts = file.relative_to(ROOT).parts
    if any(part.lower() in TECHNICAL_DIRS for part in rel_parts[:-1]):
        return False
    return True


def materials_in(folder: Path, recursive: bool = False) -> list[dict]:
    if not folder.exists():
        return []
    candidates = folder.rglob("*") if recursive else folder.iterdir()
    result = []
    for file in candidates:
        if not is_display_material(file):
            continue
        result.append({
            "titel": pretty_title(file),
            "datei": file.name,
            "typ": DISPLAY_EXT[file.suffix.lower()],
            "url": file.relative_to(ROOT).as_posix(),
        })
    return sorted(result, key=lambda x: (x["typ"] != "HTML", x["titel"].lower()))


def build_catalog() -> dict:
    areas = []
    total_fields = total_topics = total_materials = 0
    for area in STRUCT["bereiche"]:
        out_area = {k: area[k] for k in ("id", "titel", "stufe")}
        out_area["kurztitel"] = (
            area["titel"].replace("Einführungsphase (EF)", "EF")
            .replace("Qualifikationsphase – Grundkurs (Q1/Q2)", "Q1/Q2 GK")
            .replace("Qualifikationsphase – Leistungskurs (Q1/Q2)", "Q1/Q2 LK")
        )
        out_area["inhaltsfelder"] = []
        for field in area["inhaltsfelder"]:
            field_dir = ROOT / area["id"] / field["id"]
            out_field = {"id": field["id"], "titel": field["titel"]}
            out_field["materialien"] = materials_in(field_dir)
            out_field["themen"] = []
            total_fields += 1
            total_materials += len(out_field["materialien"])
            for topic in field["themen"]:
                topic_dir = field_dir / topic["id"]
                mats = materials_in(topic_dir, recursive=True)
                out_field["themen"].append({"id": topic["id"], "titel": topic["titel"], "materialien": mats})
                total_topics += 1
                total_materials += len(mats)
            out_area["inhaltsfelder"].append(out_field)
        areas.append(out_area)
    return {
        "projekt": STRUCT.get("projekt", "Mathematik NRW"),
        "stand": STRUCT.get("stand", date.today().isoformat()),
        "statistik": {"bereiche": len(areas), "inhaltsfelder": total_fields, "themen": total_topics, "materialien": total_materials},
        "bereiche": areas,
    }


def write_catalog(path: Path) -> dict:
    data = build_catalog()
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return data


if __name__ == "__main__":
    data = write_catalog(ROOT / "data.json")
    s = data["statistik"]
    print(f'KATALOG OK: {s["bereiche"]} Bereiche, {s["inhaltsfelder"]} Inhaltsfelder, {s["themen"]} Themen, {s["materialien"]} Materialien.')
