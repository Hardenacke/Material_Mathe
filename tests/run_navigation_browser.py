"""Browserprüfung ohne zusätzliche Pakete: python tests/run_navigation_browser.py.

Verwendet lokal vorhandenes Edge/Chromium. Optional: --browser PFAD --screenshots.
"""
import argparse
from functools import partial
from html import unescape
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
from threading import Thread

ROOT = Path(__file__).resolve().parents[1]


class PreviewHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/navigation-test":
            content = (ROOT / "tests/navigation_browser.html").read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(content)
            return
        if self.path.startswith("/material-mathe/"):
            self.path = self.path.removeprefix("/material-mathe")
        super().do_GET()

    def log_message(self, *_args):
        pass


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--browser")
    parser.add_argument("--screenshots", action="store_true")
    args = parser.parse_args()
    browser = args.browser or shutil.which("chromium") or shutil.which("google-chrome")
    if not browser:
        edge = Path("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe")
        if edge.is_file():
            browser = str(edge)
    if not browser:
        parser.error("Kein Browser gefunden. --browser PFAD angeben.")
    handler = partial(PreviewHandler, directory=str(ROOT / "_site"))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    Thread(target=server.serve_forever, daemon=True).start()
    origin = f"http://127.0.0.1:{server.server_port}"
    try:
        with tempfile.TemporaryDirectory(prefix="mathe-navigation-") as profile:
            common = [browser, "--headless", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
                      "--disable-extensions", "--disable-background-networking", "--disable-ipc-flooding-protection",
                      f"--user-data-dir={profile}"]
            result = subprocess.run(common + ["--dump-dom", "--virtual-time-budget=60000", origin + "/navigation-test"],
                                    capture_output=True, timeout=100)
            html = result.stdout.decode("utf-8", errors="replace")
            match = re.search(r'<pre id="results">(.*?)</pre>', html, re.S)
            message = unescape(match[1]) if match else "FAIL: Browser hat kein Testergebnis geliefert."
            print(message)
            if not message.startswith("PASS:"):
                print(result.stderr.decode("utf-8", errors="replace")[-3000:])
                return 1
            if args.screenshots:
                screenshots = ROOT / ".local/navigation-preview"
                screenshots.mkdir(parents=True, exist_ok=True)
                for name, route, size in [
                    ("kurse", "#/", "1365,1000"),
                    ("themen", "#/klasse-5", "1024,1100"),
                    ("materialarten", "#/klasse-5/01-arithmetik-algebra", "1024,1100"),
                    ("materialien", "#/klasse-5/01-arithmetik-algebra/lernspiele", "1024,1100"),
                    ("mobil", "#/klasse-5/01-arithmetik-algebra", "390,1200"),
                ]:
                    path = screenshots / f"{name}.png"
                    subprocess.run(common + [f"--window-size={size}", f"--screenshot={path}", "--virtual-time-budget=1500", origin + "/material-mathe/index.html" + route],
                                   capture_output=True, timeout=30, check=True)
                print("Screenshots: " + str(screenshots))
    finally:
        server.shutdown()
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
