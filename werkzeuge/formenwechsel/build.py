"""Baut den eigenständigen Scheitelpunkt-Trainer mit lokalen Schriften."""
from __future__ import annotations

import argparse
import base64
from html import escape
import json
from pathlib import Path
import re
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent


def build(output: Path, worker_url: str | None = None) -> Path:
    vendor = ROOT / "vendor"
    css = (vendor / "katex.min.css").read_text(encoding="utf-8")

    def font(match: re.Match) -> str:
        path = vendor / match[1]
        mime = {".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf"}[path.suffix]
        encoded = base64.b64encode(path.read_bytes()).decode("ascii")
        return f"url(data:{mime};base64,{encoded})"

    css = re.sub(r"url\((fonts/[^)]+)\)", font, css)
    config = json.loads((ROOT / "config.public.json").read_text(encoding="utf-8"))
    if worker_url is not None:
        config["workerUrl"] = worker_url
    assistant_url = config.get("assistantUrl", "")
    assistant_card = assistant_footer = ""
    if assistant_url:
        address = urlsplit(assistant_url)
        if (address.scheme != "https" or address.netloc != "app.fobizz.com"
                or not re.fullmatch(r"/ai/chats/public_assistants/[0-9a-f-]{36}", address.path)
                or address.fragment):
            raise ValueError("assistantUrl muss auf einen freigegebenen fobizz-Assistenten zeigen")
        link = (
            f'<a href="{escape(assistant_url, quote=True)}" data-fobizz-link '
            'target="_blank" rel="noopener noreferrer" '
        )
        assistant_card = (
            '<details class="fobizzHelp"><summary>Zusätzliche Lernhilfe</summary>' + link + 'class="fobizzLink">'
            'fobizz-Lernhilfe öffnen <span aria-hidden="true">↗</span></a>'
            '<p class="small">Öffnet einen neuen Tab. Beschreibe dort deine Aufgabe '
            'und den Rechenschritt, bei dem du Hilfe brauchst.</p></details>'
        )
        assistant_footer = link + 'class="fobizzFooterLink">fobizz-Lernhilfe ↗</a>'
    replacements = {
        "/* KATEX_CSS */": css,
        "/* KATEX_JS */": (vendor / "katex.min.js").read_text(encoding="utf-8"),
        "/* DESIGN_CSS */": (ROOT / "design.css").read_text(encoding="utf-8"),
        "/* APP_JS */": (ROOT / "app.js").read_text(encoding="utf-8"),
        "/* COACH_DOCK_JS */": (ROOT / "coach-dock.js").read_text(encoding="utf-8"),
        "/* AUTO_JS */": (ROOT / "automatic.js").read_text(encoding="utf-8"),
        "/* COACH_CONFIG */": json.dumps(config, ensure_ascii=False).replace("<", "\\u003c"),
        "<!-- FOBIZZ_CARD -->": assistant_card,
        "<!-- FOBIZZ_FOOTER -->": assistant_footer,
    }
    html = (ROOT / "template.html").read_text(encoding="utf-8")
    for marker, content in replacements.items():
        if html.count(marker) != 1:
            raise ValueError(f"Vorlagenmarker fehlt oder ist mehrfach vorhanden: {marker}")
        html = html.replace(marker, content)
    notices = "\n\n".join(
        (vendor / name).read_text(encoding="utf-8")
        for name in ("LICENSE-KATEX.txt", "LICENSE-FONTS.txt")
    )
    html = html.replace(
        "</head>", '<script type="text/plain" id="third-party-notices">' + notices + "</script></head>"
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(html, encoding="utf-8")
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "dist/index.html")
    parser.add_argument("--worker-url", help="Optionale Adresse einer eingerichteten Lernbegleitung")
    args = parser.parse_args()
    print("SCHEITELPUNKT-TRAINER BUILD OK:", build(args.output.resolve(), args.worker_url))


if __name__ == "__main__":
    main()
