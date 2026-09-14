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
LEARNING_GAMES_DIR = ROOT / "lernspiele"
SUPPORT_DIR_NAME = "unterstuetzung"

SI_DOMAIN_FIELDS = {
    "arithmetik-algebra": "01-arithmetik-algebra",
    "funktionen": "02-funktionen",
    "geometrie": "03-geometrie",
    "stochastik": "04-stochastik",
}

UPPER_DOMAIN_FIELDS = {
    "analysis": "01-funktionen-und-analysis",
    "analytische-geometrie": "02-analytische-geometrie-und-lineare-algebra",
    "stochastik": "03-stochastik",
}

LEARNING_GAME_TOPIC_BY_PATH = {
    "klasse-5/arithmetik-algebra/rechenstrategien.html": "02-grundrechenarten-und-rechengesetze",
    "klasse-5/arithmetik-algebra/messen.html": "03-groessen-und-einheiten",
    "klasse-5/arithmetik-algebra/bruchbild.html": "04-brueche-als-anteile",
    "klasse-5/funktionen/muster.html": "01-tabellen-diagramme-und-zuordnungen",
    "klasse-5/geometrie/figuren.html": "01-grundfiguren-koordinatensystem-und-symmetrie",
    "klasse-5/geometrie/spiegel.html": "01-grundfiguren-koordinatensystem-und-symmetrie",
    "klasse-5/geometrie/wuerfel.html": "03-umfang-und-flaecheninhalt",
    "klasse-5/stochastik/daten5.html": "01-daten-erheben-haeufigkeiten-und-diagramme",
    "klasse-6/arithmetik-algebra/teiler.html": "01-teilbarkeit-primzahlen-und-primfaktorzerlegung",
    "klasse-6/arithmetik-algebra/bruchrechnen.html": "03-rechnen-mit-bruechen-und-dezimalzahlen",
    "klasse-6/arithmetik-algebra/komma.html": "02-positive-rationale-zahlen",
    "klasse-6/funktionen/dreisatz.html": "02-proportionale-grundideen-und-dreisatz",
    "klasse-6/geometrie/abbildung.html": "03-symmetrie-und-abbildungen",
    "klasse-6/geometrie/flaechen.html": "01-quader-oberflaeche-und-volumen",
    "klasse-6/stochastik/statistik6.html": "01-relative-haeufigkeiten",
    "klasse-7/arithmetik-algebra/vorzeichen.html": "01-rationale-zahlen-und-vorzeichenregeln",
    "klasse-7/arithmetik-algebra/terme.html": "02-terme-variablen-und-termumformungen",
    "klasse-7/arithmetik-algebra/terme-legen.html": "02-terme-variablen-und-termumformungen",
    "klasse-7/arithmetik-algebra/gleichung.html": "03-lineare-gleichungen",
    "klasse-7/arithmetik-algebra/gleichungen-legen.html": "03-lineare-gleichungen",
    "klasse-7/funktionen/zuordnung.html": "01-proportionale-und-antiproportionale-zuordnungen",
    "klasse-7/funktionen/prozent.html": "02-prozent-und-zinsrechnung",
    "klasse-7/geometrie/winkel.html": "01-winkelbeziehungen",
    "klasse-7/stochastik/zufall7.html": "01-laplace-wahrscheinlichkeit",
    "klasse-8/arithmetik-algebra/binomisch.html": "01-termumformungen-und-binomische-formeln",
    "klasse-8/arithmetik-algebra/quadratische-legen.html": "01-termumformungen-und-binomische-formeln",
    "klasse-8/arithmetik-algebra/lgs.html": "02-lineare-gleichungssysteme",
    "klasse-8/arithmetik-algebra/bruchterm.html": "03-bruchterme-und-elementare-bruchgleichungen",
    "klasse-8/funktionen/linear.html": "01-lineare-funktionen",
    "klasse-8/geometrie/thales.html": "02-geometrisches-argumentieren-und-konstruieren",
    "klasse-8/stochastik/baum.html": "01-mehrstufige-zufallsexperimente-und-pfadregeln",
    "klasse-9/arithmetik-algebra/potenz.html": "02-potenzen-und-potenzgesetze",
    "klasse-9/arithmetik-algebra/quadratisch.html": "03-quadratische-gleichungen",
    "klasse-9/funktionen/parabel.html": "01-quadratische-funktionen",
    "klasse-9/geometrie/pythagoras.html": "01-satz-des-pythagoras",
    "klasse-9/stochastik/kritik.html": "02-statistische-darstellungen-kritisch-bewerten",
    "klasse-10/arithmetik-algebra/logarithmus.html": "02-exponentielle-gleichungen-und-logarithmus-einstieg",
    "klasse-10/funktionen/wachstum.html": "01-exponentielle-funktionen-und-wachstum",
    "klasse-10/funktionen/sinus.html": "02-sinus-und-kosinusfunktionen",
    "klasse-10/geometrie/trigo.html": "01-trigonometrie-im-rechtwinkligen-dreieck",
    "klasse-10/geometrie/koerper.html": "04-koerper-oberflaeche-und-volumen",
    "klasse-10/stochastik/vierfelder.html": "01-bedingte-wahrscheinlichkeit-und-vierfeldertafel",
    "ef/analysis/transform.html": "02-funktionseigenschaften-und-transformationen",
    "ef/analysis/ableitung.html": "03-mittlere-und-lokale-aenderungsraten",
    "ef/analysis/kurven.html": "05-differentialrechnung-ganzrationaler-funktionen",
    "ef/analytische-geometrie/vektor.html": "02-vektoroperationen-und-eigenschaften",
    "ef/analytische-geometrie/geraden.html": "04-lagebeziehungen-und-schnittpunkte-von-geraden",
    "ef/stochastik/bruecke.html": "01-mehrstufige-zufallsexperimente",
    "q1/grundkurs/analysis/produkt.html": "02-produktregel-und-zusammengesetzte-funktionen",
    "q1/grundkurs/analysis/exp.html": "04-exponentialfunktionen-wachstum-und-zerfall",
    "q1/grundkurs/analysis/integral.html": "05-integralbegriff-produktsumme-und-orientierte-flaeche",
    "q1/grundkurs/analytische-geometrie/skalar.html": "01-skalarprodukt-und-winkel",
    "q1/grundkurs/analytische-geometrie/ebenen.html": "02-ebenen-parameter-und-koordinatenform",
    "q1/grundkurs/stochastik/binomial.html": "03-binomialverteilung",
    "q1/grundkurs/stochastik/erwartung.html": "02-zufallsgroessen-und-kenngroessen",
    "q2/grundkurs/analysis/abi_analysis.html": "05-integralbegriff-produktsumme-und-orientierte-flaeche",
    "q2/grundkurs/analysis/steckbrief.html": "03-extremwertprobleme-und-steckbriefaufgaben",
    "q2/grundkurs/analytische-geometrie/abi_raum.html": "03-schnittwinkel-und-schnittpunkte",
    "q2/grundkurs/stochastik/abi_sto.html": "01-mehrstufige-zufallsexperimente-wiederholung-und-vertiefung",
    "q1/leistungskurs/analysis/produkt.html": "02-produktregel-kettenregel-und-funktionenscharen",
    "q1/leistungskurs/analysis/exp.html": "02-produktregel-kettenregel-und-funktionenscharen",
    "q1/leistungskurs/analysis/integral.html": "05-integralbegriff-und-integralfunktion",
    "q1/leistungskurs/analytische-geometrie/skalar.html": "01-skalarprodukt-und-winkel",
    "q1/leistungskurs/analytische-geometrie/ebenen.html": "02-ebenen-parameter-koordinaten-und-normalenform",
    "q1/leistungskurs/stochastik/binomial.html": "03-binomialverteilung-und-sigma-regeln",
    "q1/leistungskurs/stochastik/erwartung.html": "02-zufallsgroessen-und-kenngroessen",
    "q2/leistungskurs/analysis/abi_analysis.html": "05-integralbegriff-und-integralfunktion",
    "q2/leistungskurs/analysis/steckbrief.html": "03-extremwertprobleme-und-steckbriefaufgaben",
    "q2/leistungskurs/analytische-geometrie/abi_raum.html": "03-schnittwinkel-und-schnittpunkte",
    "q2/leistungskurs/analytische-geometrie/abstand.html": "04-lagebeziehungen-und-abstaende",
    "q2/leistungskurs/stochastik/abi_sto.html": "01-mehrstufige-zufallsexperimente",
    "q2/leistungskurs/stochastik/normal.html": "05-normalverteilung",
    "q2/leistungskurs/stochastik/konfidenz.html": "04-beurteilende-statistik",
}


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


def material_sort_key(material: dict) -> tuple:
    type_order = {"Unterstützung": 0, "Lernspiel": 1, "HTML": 2, "PPTX": 3}
    return (type_order.get(material.get("typ"), 50), material.get("titel", "").lower())


def sort_materials(materials: list[dict]) -> list[dict]:
    return sorted(materials, key=material_sort_key)


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
            "kategorie": DISPLAY_EXT[file.suffix.lower()],
            "url": file.relative_to(ROOT).as_posix(),
        })
    return sort_materials(result)


def support_title(file: Path) -> str:
    label = file.stem.replace("question_shells_", "").replace("_", " ")
    if label.startswith("klasse-"):
        label = label.replace("klasse-", "Klasse ")
    elif label in {"ef", "q1", "q2"}:
        label = label.upper()
    return f"Question Shells {label}".strip()


def support_materials_in(area_dir: Path) -> list[dict]:
    support_dir = area_dir / SUPPORT_DIR_NAME
    materials = materials_in(support_dir)
    for material in materials:
        material["titel"] = support_title(support_dir / material["datei"])
        material["typ"] = "Unterstützung"
        material["kategorie"] = "Unterstützung"
        material["beschreibung"] = "Jahrgangsbezogene Question Shells zum Erstellen passender Aufgabenformate."
    return sort_materials(materials)


def learning_game_destination(game_path: Path) -> tuple[str, str, str] | None:
    parts = game_path.parts
    if len(parts) < 3:
        return None

    area_id = ""
    field_id = ""
    if parts[0].startswith("klasse-"):
        area_id = parts[0]
        field_id = SI_DOMAIN_FIELDS.get(parts[1], "")
    elif parts[0] == "ef":
        area_id = "ef"
        field_id = UPPER_DOMAIN_FIELDS.get(parts[1], "")
    elif parts[0] in {"q1", "q2"} and len(parts) >= 4:
        area_id = "q1-q2-grundkurs" if parts[1] == "grundkurs" else "q1-q2-leistungskurs"
        field_id = UPPER_DOMAIN_FIELDS.get(parts[2], "")

    if not area_id or not field_id:
        return None

    topic_id = LEARNING_GAME_TOPIC_BY_PATH.get(game_path.as_posix(), "")
    return area_id, field_id, topic_id


def learning_game_material(game: dict, game_path: Path) -> dict:
    skills = game.get("skills", [])
    if isinstance(skills, str):
        skills = [skills]
    elif not isinstance(skills, list):
        skills = []
    return {
        "titel": game.get("title") or pretty_title(game_path),
        "datei": game_path.name,
        "typ": "Lernspiel",
        "kategorie": "Lernspiel",
        "url": f"{LEARNING_GAMES_DIR.name}/{game_path.as_posix()}",
        "beschreibung": game.get("topic", ""),
        "kompetenzen": skills,
    }


def learning_games_by_destination() -> dict[tuple[str, str, str], list[dict]]:
    source = LEARNING_GAMES_DIR / "data.json"
    if not source.exists():
        return {}

    catalog = json.loads(source.read_text(encoding="utf-8"))
    by_destination: dict[tuple[str, str, str], list[dict]] = {}
    for game in catalog.get("games", []):
        raw_path = str(game.get("path", "")).strip()
        if not raw_path:
            continue
        game_path = Path(raw_path)
        destination = learning_game_destination(game_path)
        if destination is None:
            continue
        by_destination.setdefault(destination, []).append(learning_game_material(game, game_path))
    return {key: sort_materials(value) for key, value in by_destination.items()}


def catalog_categories(areas: list[dict]) -> list[str]:
    categories = set()
    for area in areas:
        categories.update(material["kategorie"] for material in area.get("unterstuetzung", []))
        for field in area["inhaltsfelder"]:
            categories.update(material["kategorie"] for material in field["materialien"])
            for topic in field["themen"]:
                categories.update(material["kategorie"] for material in topic["materialien"])
    return sorted(categories, key=lambda value: (value != "Lernspiel", value.lower()))


def build_catalog() -> dict:
    areas = []
    games_by_destination = learning_games_by_destination()
    total_fields = total_topics = total_materials = total_learning_games = total_support = 0
    for area in STRUCT["bereiche"]:
        out_area = {k: area[k] for k in ("id", "titel", "stufe")}
        out_area["kurztitel"] = (
            area["titel"].replace("Einführungsphase (EF)", "EF")
            .replace("Qualifikationsphase – Grundkurs (Q1/Q2)", "Q1/Q2 GK")
            .replace("Qualifikationsphase – Leistungskurs (Q1/Q2)", "Q1/Q2 LK")
        )
        out_area["unterstuetzung"] = support_materials_in(ROOT / area["id"])
        out_area["inhaltsfelder"] = []
        total_support += len(out_area["unterstuetzung"])
        total_materials += len(out_area["unterstuetzung"])
        for field in area["inhaltsfelder"]:
            field_dir = ROOT / area["id"] / field["id"]
            out_field = {"id": field["id"], "titel": field["titel"]}
            out_field["materialien"] = materials_in(field_dir)
            out_field["materialien"].extend(games_by_destination.get((area["id"], field["id"], ""), []))
            out_field["materialien"] = sort_materials(out_field["materialien"])
            out_field["themen"] = []
            total_fields += 1
            total_materials += len(out_field["materialien"])
            total_learning_games += sum(1 for material in out_field["materialien"] if material["typ"] == "Lernspiel")
            for topic in field["themen"]:
                topic_dir = field_dir / topic["id"]
                mats = materials_in(topic_dir, recursive=True)
                mats.extend(games_by_destination.get((area["id"], field["id"], topic["id"]), []))
                mats = sort_materials(mats)
                out_field["themen"].append({"id": topic["id"], "titel": topic["titel"], "materialien": mats})
                total_topics += 1
                total_materials += len(mats)
                total_learning_games += sum(1 for material in mats if material["typ"] == "Lernspiel")
            out_area["inhaltsfelder"].append(out_field)
        areas.append(out_area)
    return {
        "projekt": STRUCT.get("projekt", "Mathematik NRW"),
        "stand": STRUCT.get("stand", date.today().isoformat()),
        "statistik": {
            "bereiche": len(areas),
            "inhaltsfelder": total_fields,
            "themen": total_topics,
            "materialien": total_materials,
            "lernspiele": total_learning_games,
            "unterstuetzung": total_support,
        },
        "kategorien": catalog_categories(areas),
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
