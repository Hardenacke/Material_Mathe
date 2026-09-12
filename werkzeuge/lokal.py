#!/usr/bin/env python3
"""Lokale Vorschau: baut bei Dateiänderungen neu und liefert _site auf Port 8000 aus."""
from __future__ import annotations
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
import os, subprocess, sys, time, webbrowser

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_site"
IGNORE_PARTS = {".git", "_site", "__pycache__"}


def stamp() -> float:
    newest = 0.0
    for p in ROOT.rglob("*"):
        if not p.is_file() or any(part in IGNORE_PARTS for part in p.parts):
            continue
        try: newest = max(newest, p.stat().st_mtime)
        except OSError: pass
    return newest


def build():
    subprocess.run([sys.executable, str(ROOT / "werkzeuge" / "build_site.py")], cwd=ROOT, check=True)


def watcher():
    last = stamp()
    while True:
        time.sleep(1.2)
        now = stamp()
        if now > last + 0.01:
            time.sleep(.5)
            try: build()
            except subprocess.CalledProcessError as exc: print("Build fehlgeschlagen:", exc)
            last = stamp()


def main():
    build()
    os.chdir(OUT)
    server = ThreadingHTTPServer(("127.0.0.1", 8000), SimpleHTTPRequestHandler)
    Thread(target=watcher, daemon=True).start()
    url = "http://127.0.0.1:8000/"
    print(f"Lokale Vorschau: {url}  (Beenden mit Strg+C)")
    try: webbrowser.open(url)
    except Exception: pass
    try: server.serve_forever()
    except KeyboardInterrupt: pass


if __name__ == "__main__":
    main()
