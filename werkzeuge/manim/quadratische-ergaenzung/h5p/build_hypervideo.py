#!/usr/bin/env python3
"""Build the importable H5P Interactive Video package for the worked example."""

from __future__ import annotations

import json
import uuid
import zipfile
from pathlib import Path


PROJECT_DIR = Path(__file__).resolve().parents[1]
H5P_DIR = Path(__file__).resolve().parent
VIDEO_NAME = "02_Beispiel_x2_4x_3.mp4"
PUBLIC_DIR = PROJECT_DIR.parents[2] / "klasse-9/02-funktionen/01-quadratische-funktionen/assets/quadratische-ergaenzung"
VIDEO_FILE = PUBLIC_DIR / "videos" / VIDEO_NAME
OUTPUT_FILE = PUBLIC_DIR / "h5p" / "Quadratische_Ergaenzung_Beispielrechnung.h5p"
SOURCE_DIR = H5P_DIR / "source"


def stable_id(label: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_OID, f"quadratische-ergaenzung:{label}"))


def metadata(content_type: str, title: str) -> dict:
    return {
        "contentType": content_type,
        "license": "U",
        "title": title,
        "authors": [],
        "changes": [],
        "extraTitle": title,
    }


def blanks_action(number: int, title: str, question: str, feedback: str) -> dict:
    action_id = stable_id(f"blanks-{number}")
    return {
        "library": "H5P.Blanks 1.14",
        "params": {
            "text": "Setze den fehlenden Zahlenwert ein und prüfe deine Eingabe.",
            "questions": [f"<p>{question}</p>"],
            "overallFeedback": [
                {"from": 0, "to": 0, "feedback": "Noch nicht richtig. Rechne den Schritt noch einmal."},
                {"from": 100, "to": 100, "feedback": feedback},
            ],
            "showSolutions": "Lösung anzeigen",
            "tryAgain": "Noch einmal",
            "checkAnswer": "Antwort prüfen",
            "submitAnswer": "Antwort absenden",
            "notFilledOut": "Bitte setze zuerst den Zahlenwert ein.",
            "answerIsCorrect": "„:ans“ ist richtig.",
            "answerIsWrong": "„:ans“ ist noch nicht richtig.",
            "answeredCorrectly": "Richtig beantwortet",
            "answeredIncorrectly": "Noch nicht richtig",
            "solutionLabel": "Lösung:",
            "inputLabel": "Eingabefeld @num von @total",
            "inputHasTipLabel": "Hinweis verfügbar",
            "tipLabel": "Hinweis",
            "behaviour": {
                "enableRetry": True,
                "allowRetryIfCorrect": True,
                "enableSolutionsButton": True,
                "enableCheckButton": True,
                "autoCheck": False,
                "caseSensitive": True,
                "showSolutionsRequiresInput": True,
                "separateLines": False,
                "confirmCheckDialog": False,
                "confirmRetryDialog": False,
                "acceptSpellingErrors": False,
            },
            "confirmCheck": {
                "header": "Antwort prüfen?",
                "body": "Möchtest du deine Eingabe prüfen?",
                "cancelLabel": "Zurück",
                "confirmLabel": "Prüfen",
            },
            "confirmRetry": {
                "header": "Noch einmal versuchen?",
                "body": "Deine Eingabe wird zurückgesetzt.",
                "cancelLabel": "Abbrechen",
                "confirmLabel": "Wiederholen",
            },
            "scoreBarLabel": "Du hast :num von :total Punkten erreicht.",
            "a11yCheck": "Antwort prüfen. Die Eingabe wird als richtig oder falsch markiert.",
            "a11yShowSolution": "Die richtige Eingabe anzeigen.",
            "a11yRetry": "Eingabe zurücksetzen und erneut versuchen.",
            "a11yCheckingModeHeader": "Antwort prüfen",
        },
        "subContentId": action_id,
        "metadata": metadata("Fill in the Blanks", title),
    }


def make_interaction(
    number: int,
    title: str,
    question: str,
    feedback: str,
    start: float,
    end: float,
) -> dict:
    return {
        "duration": {"from": start, "to": end},
        "pause": True,
        "displayType": "poster",
        "buttonOnMobile": True,
        "adaptivity": {
            "correct": {"allowOptOut": False, "message": "Richtig! Schau dir den nächsten Rechenschritt an."},
            "wrong": {"allowOptOut": True, "message": "Prüfe deine Rechnung. Du kannst die Video-Erklärung fortsetzen."},
            "requireCompletion": True,
        },
        "label": f"<p>Kontrollfrage {number}: {title}</p>",
        "x": 10,
        "y": 10,
        "width": 80,
        "height": 80,
        "libraryTitle": "Fill in the Blanks",
        "visuals": {"backgroundColor": "rgb(255, 255, 255)", "boxShadow": True},
        "action": blanks_action(number, title, question, feedback),
    }


def make_package() -> tuple[dict, dict]:
    title = "Quadratische Ergänzung – Beispielrechnung mit Kontrollfragen"
    dependencies = [
        ("H5P.InteractiveVideo", 1, 28),
        ("H5P.Blanks", 1, 14),
        ("H5P.Summary", 1, 10),
        ("H5P.Video", 1, 6),
        ("H5P.DragNBar", 1, 5),
        ("H5P.Components", 1, 0),
        ("H5P.FontIcons", 1, 0),
        ("H5P.Transition", 1, 0),
        ("FontAwesome", 4, 5),
        ("jQuery.ui", 1, 10),
        ("H5P.Question", 1, 5),
        ("H5P.JoubelUI", 1, 3),
        ("H5P.TextUtilities", 1, 3),
    ]
    manifest = {
        "title": title,
        "language": "de",
        "mainLibrary": "H5P.InteractiveVideo",
        "embedTypes": ["iframe"],
        "license": "U",
        "preloadedDependencies": [
            {"machineName": name, "majorVersion": major, "minorVersion": minor}
            for name, major, minor in dependencies
        ],
    }

    interactions = [
        make_interaction(
            1,
            "Hälfte bestimmen",
            "Berechne die Hälfte des x-Koeffizienten: 4 : 2 = *2*.",
            "Die Hälfte des Koeffizienten vor x ist 2.",
            3.35,
            6.20,
        ),
        make_interaction(
            2,
            "Hälfte quadrieren",
            "Quadriere die Hälfte: 2² = *4*.",
            "2² = 4. Diese Zahl ergänzt das vollständige Quadrat.",
            8.55,
            10.90,
        ),
        make_interaction(
            3,
            "Konstante berechnen",
            "Berechne den verbleibenden konstanten Term: -4 + 3 = *-1*.",
            "-4 + 3 = -1. Der Restterm außerhalb des Quadrats ist -1.",
            14.00,
            15.55,
        ),
    ]

    summary_id = stable_id("summary-group")
    summary_task_id = stable_id("summary-task")
    final_summary = {
        "library": "H5P.Summary 1.10",
        "params": {
            "intro": "<p>Wähle die fachlich richtige Zusammenfassung.</p>",
            "summaries": [
                {
                    "subContentId": summary_id,
                    "tip": "Halbiere den Koeffizienten vor x, quadriere die Hälfte und gleiche aus.",
                    "summary": [
                        "<p>Ich halbiere 4 zu 2, quadriere zu 4 und gleiche mit -4 aus.</p>\n",
                        "<p>Ich addiere nur 4; der Termwert bleibt auch ohne Ausgleich gleich.</p>\n",
                    ],
                }
            ],
            "overallFeedback": [
                {"from": 0, "to": 100, "feedback": "Merksatz: halbieren, quadrieren, ausgleichen."}
            ],
            "solvedLabel": "Richtig gelöst:",
            "scoreLabel": "Falsche Auswahl:",
            "resultLabel": "Dein Ergebnis",
            "labelCorrect": "Richtig.",
            "labelIncorrect": "Noch nicht richtig. Versuche es erneut.",
            "alternativeIncorrectLabel": "Falsch",
            "labelCorrectAnswers": "Richtige Aussagen:",
            "tipButtonLabel": "Hinweis anzeigen",
            "scoreBarLabel": "Du hast :num von :total Punkten erreicht.",
            "progressText": "Fortschritt: :num von :total",
        },
        "subContentId": summary_task_id,
        "metadata": metadata("Summary", "Merksatz zur quadratischen Ergänzung"),
    }

    content = {
        "interactiveVideo": {
            "video": {
                "files": [
                    {
                        "path": f"videos/{VIDEO_NAME}",
                        "mime": "video/mp4",
                        "copyright": {"license": "U"},
                    }
                ],
                "startScreenOptions": {
                    "title": "Beispielrechnung: f(x) = x² + 4x + 3",
                    "hideStartTitle": False,
                    "shortStartDescription": "Quadratisch ergänzen und den Scheitelpunkt ablesen.",
                },
                "textTracks": {"videoTrack": [], "defaultTrackLabel": ""},
            },
            "assets": {"interactions": interactions},
            "bookmarks": [],
            "endscreens": [],
            "summary": {"task": final_summary, "displayAt": 0.8},
            "override": {
                "autoplay": False,
                "loop": False,
                "showBookmarksmenuOnLoad": False,
                "showRewind10": True,
                "preventSkippingMode": "forward",
                "deactivateSound": False,
            },
        },
        "subContentId": stable_id("interactive-video"),
        "metadata": metadata("Interactive Video", title),
    }
    return manifest, content


def main() -> None:
    if not VIDEO_FILE.is_file():
        raise FileNotFoundError(f"Required Manim video not found: {VIDEO_FILE}")

    manifest, content = make_package()
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    manifest_path = SOURCE_DIR / "h5p.json"
    content_path = SOURCE_DIR / "content.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    content_path.write_text(json.dumps(content, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    with zipfile.ZipFile(OUTPUT_FILE, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as package:
        package.write(manifest_path, "h5p.json")
        package.write(content_path, "content/content.json")
        package.write(VIDEO_FILE, f"content/videos/{VIDEO_NAME}")

    print(f"Created {OUTPUT_FILE}")
    print(f"Embedded video: {VIDEO_FILE.stat().st_size:,} bytes")
    print(f"Interactions: {len(content['interactiveVideo']['assets']['interactions'])}")


if __name__ == "__main__":
    main()
