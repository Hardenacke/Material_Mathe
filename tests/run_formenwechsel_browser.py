"""Prüft den Scheitelpunkt-Trainer in Edge und WebKit ohne externe Dienste."""
import argparse
from fractions import Fraction
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path
from threading import Thread

ROOT = Path(__file__).resolve().parents[1]
if (ROOT / ".local/playwright-browsers").exists():
    os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", str(ROOT / ".local/playwright-browsers"))
from playwright.sync_api import expect, sync_playwright

TRAINER = "klasse-9/02-funktionen/01-quadratische-funktionen/scheitelpunkt-trainer.html"
CATALOG = "index.html#/klasse-9/02-funktionen/lernpfade"


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        self.path = self.path.removeprefix("/material-mathe")
        super().do_GET()

    def log_message(self, *_args):
        pass


def state(page):
    return page.evaluate("Formenwechsel.getState()")


def learning_state(page):
    saved = state(page)
    if saved["current"]:
        # Flüchtige Erfolgstexte werden beim Wiederherstellen absichtlich entfernt.
        saved["current"].pop("milestone", None)
        saved["current"].setdefault("aiAssisted", False)
    return saved


def expected_values(task):
    # Die Eingaben aus den Polynomkoeffizienten berechnen, unabhängig vom UI-Helfer.
    a, b, c = (Fraction(task[key]) for key in ("a", "b", "c"))
    if task["guided"] and task["stage"] == 0:
        return b / a, b / (2 * a)
    if task["guided"] and task["stage"] == 1:
        return (b / (2 * a)) ** 2, -(b * b) / (4 * a)
    if task["skill"] == "expand":
        # Drei Funktionswerte bestimmen die Koeffizienten der Normalform.
        f = lambda x: a * (x + Fraction(task["p"])) ** 2 + Fraction(task["k"])
        return (f(1) - f(-1)) / 2, f(0)
    return -b / (2 * a), c - b * b / (4 * a)


def fill(page, values, fractions=False):
    for index, value in enumerate(values):
        text = str(value) if fractions else str(float(value)).replace(".", ",")
        page.locator(f"#v{index}").fill(text)


def no_overflow(page):
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), "Seitlicher Überlauf"
    assert page.locator(".katex-error").count() == 0


def run_flow(browser, engine, base, output):
    errors, remote = [], []
    context = browser.new_context(viewport={"width": 1024, "height": 1366}, has_touch=True, reduced_motion="reduce")
    page = context.new_page()
    page.on("pageerror", lambda error: errors.append(error.stack))
    page.on("request", lambda request: remote.append(request.url)
            if request.url.startswith(("http:", "https:")) and not request.url.startswith(base) else None)
    try:
        page.goto(base + CATALOG)
        link = page.locator(f'.file-link[href*="{TRAINER}"]')
        expect(link).to_have_count(1)
        link.click()
        expect(page.locator("#intro")).to_be_visible()
        expect(page.locator("#sammlung-navigation a").first).to_have_attribute("href", base + CATALOG)
        assert page.locator(".katex").count() > 20
        no_overflow(page)
        page.screenshot(path=str(output / f"{engine}-entdecken.png"), full_page=True)

        # Bedienung mit Tastatur und Schritttasten bis zu den Reglergrenzen.
        page.locator("#pSlider").focus()
        page.keyboard.press("Home")
        expect(page.locator("#pDecrease")).to_be_disabled()
        expect(page.locator("#pSlider")).to_have_value("-4")
        page.locator("#pIncrease").click()
        expect(page.locator("#pSlider")).to_have_value("-3")
        page.locator("#qSlider").focus()
        page.keyboard.press("End")
        expect(page.locator("#qIncrease")).to_be_disabled()
        assert state(page)["q"] == 5
        page.locator("#tabComplete").focus()
        page.keyboard.press("ArrowRight")
        expect(page.locator("#tabExpand")).to_have_attribute("aria-selected", "true")
        while page.locator("#lessonNext").is_enabled():
            page.locator("#lessonNext").click()

        page.locator("#resume").click()
        expect(page.locator("#practice")).to_be_visible()
        page.locator("#check").click()
        assert state(page)["current"]["attempts"] == 0
        expect(page.locator("#v0")).to_have_attribute("data-verdict", "invalid")
        values = expected_values(state(page)["current"])
        fill(page, [values[0], values[1] + 100])
        page.locator("#check").click()
        expect(page.locator("#v0")).to_have_attribute("data-verdict", "correct")
        expect(page.locator("#v1")).to_have_attribute("data-verdict", "incorrect")
        page.locator("#hint").click()
        expect(page.locator("#hintBox")).to_be_visible()
        page.screenshot(path=str(output / f"{engine}-rueckmeldung.png"), full_page=True)

        # Ungelöste Aufgabe, Eingaben und Hilfen überstehen einen echten Reload.
        before = learning_state(page)
        page.reload()
        assert learning_state(page) == before
        expect(page.locator("#v1")).to_have_value(str(float(values[1] + 100)).replace(".", ","))
        page.locator('[data-sign="1"]').click()
        expect(page.locator("#v1")).to_have_attribute("data-verdict", "")
        assert state(page)["current"]["failures"] == 1
        page.locator("#navIntro").click()
        before = learning_state(page)
        page.reload()
        assert learning_state(page) == before
        expect(page.locator("#intro")).to_be_visible()
        page.locator("#resume").click()

        # Beide Richtungen, Zwischenfelder, Abschlusscheck und Auswertung bedienen.
        reloaded_step = False
        while state(page)["page"] != "summary":
            current = state(page)["current"]
            if current["solved"]:
                page.locator("#nextTask").click()
                continue
            fill(page, expected_values(current), fractions=len(state(page)["records"]) % 2 == 0)
            page.locator("#check").click()
            if current["guided"] and current["stage"] == 0 and not reloaded_step:
                before = learning_state(page)
                page.reload()
                assert learning_state(page) == before
                assert state(page)["current"]["stage"] == 1
                reloaded_step = True
        records = state(page)["records"]
        assert len(records) == 12
        assert sum(record["skill"] == "expand" for record in records) == 6
        assert sum(record["skill"] == "complete" for record in records) == 6
        assert sum(record["exit"] for record in records) == 2
        assert records[0]["independent"] is False
        assert all(record["independent"] for record in records if record["exit"])
        expect(page.locator("#summary")).to_be_visible()
        page.reload()
        expect(page.locator("#summary")).to_be_visible()
        no_overflow(page)
        page.screenshot(path=str(output / f"{engine}-auswertung.png"), full_page=True)
        page.locator("#morePractice").click()
        while not state(page)["current"]["solved"]:
            fill(page, expected_values(state(page)["current"]))
            page.locator("#check").click()
        page.locator("#nextTask").click()
        expect(page.locator("#summary")).to_be_visible()

        page.locator("#reset").click()
        expect(page.locator("#resetDialog")).to_be_visible()
        page.locator("#cancelReset").click()
        assert len(state(page)["records"]) == 13
        page.locator("#reset").click()
        page.locator("#confirmReset").click()
        assert state(page)["records"] == []
        for width, height in ((390, 844), (768, 1024), (1024, 768)):
            page.set_viewport_size({"width": width, "height": height})
            no_overflow(page)
            page.locator("#navPractice").click()
            no_overflow(page)
            assert page.locator("#v0").bounding_box()["width"] > 80
            assert page.locator('[data-sign="0"]').bounding_box()["height"] >= 44
            page.screenshot(path=str(output / f"{engine}-training-{width}.png"), full_page=True)
            page.locator("#navIntro").click()
        page.locator("#sammlung-navigation a").first.click()
        expect(page.locator(f'.file-link[href*="{TRAINER}"]')).to_have_count(1)
        assert not errors, errors
        assert not remote, remote
        print(f"PASS {engine}: Katalog, Regler, Hilfen, 12 Aufgaben, Reload, Extrarunde, Reset und 390/768/1024 px; keine externen Aufrufe.")
    finally:
        context.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--engine", choices=("chromium", "webkit", "all"), default="all")
    args = parser.parse_args()
    output = ROOT / ".local/formenwechsel/browser"
    output.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(Handler, directory=str(ROOT / "_site")))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}/material-mathe/"
    try:
        with sync_playwright() as playwright:
            for engine in (["chromium", "webkit"] if args.engine == "all" else [args.engine]):
                options = {"channel": "msedge"} if engine == "chromium" else {}
                browser = getattr(playwright, engine).launch(headless=True, **options)
                try:
                    run_flow(browser, engine, base, output)
                finally:
                    browser.close()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
