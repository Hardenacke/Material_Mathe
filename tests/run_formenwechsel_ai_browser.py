"""Prüft vorbereitete Pages-Dateien mit echten Cloudflare-KI-Aufrufen."""
import argparse
import json
import os
from pathlib import Path
import time
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", str(ROOT / ".local/playwright-browsers"))
from playwright.sync_api import expect, sync_playwright
from run_formenwechsel_browser import TRAINER, CATALOG, expected_values, fill, no_overflow, state

ORIGIN = "https://hardenacke.github.io"
SITE = ORIGIN + "/Material_Mathe/"
CONFIG = json.loads((ROOT / "werkzeuge/formenwechsel/config.public.json").read_text(encoding="utf-8"))
WORKER = CONFIG["workerUrl"]


def local_pages(route):
    relative = unquote(urlsplit(route.request.url).path.removeprefix("/Material_Mathe/"))
    path = (ROOT / "_site" / relative).resolve()
    if not path.is_relative_to((ROOT / "_site").resolve()) or not path.is_file():
        route.fulfill(status=404, body="Nicht gefunden")
    else:
        route.fulfill(path=str(path))


def run(browser, engine, full):
    context = browser.new_context(viewport={"width": 768, "height": 1024}, has_touch=True, reduced_motion="reduce")
    context.route(SITE + "**", local_pages)
    page = context.new_page()
    page.set_default_timeout(15000)
    errors, answers = [], []
    recent = []
    page.on("pageerror", lambda error: errors.append(error.stack))
    output = ROOT / ".local/formenwechsel/ai-browser"
    output.mkdir(parents=True, exist_ok=True)

    def is_coach(response):
        return response.url == WORKER + "/api/coach/automatic" and response.request.method == "POST"

    def checked_response(response):
        assert response.ok, f"Worker meldet HTTP {response.status}"
        data = response.json()
        assert data["source"] == "workers-ai"
        assert data["feedback"]
        answers.append(data)
        print(f"{engine}: KI-Antwort {len(answers)} ({data['feedbackKind']})", flush=True)
        expect(page.locator("#autoCoachCard")).to_have_attribute("data-state", "workers-ai", timeout=15000)
        expect(page.locator("#autoCoachSource")).to_contain_text("Cloudflare")
        return data

    def submit(values):
        now = time.monotonic()
        recent[:] = [stamp for stamp in recent if now - stamp < 61]
        if len(recent) >= 15:
            delay = 61 - (now - recent[0])
            print(f"{engine}: Sitzungskontingent beachten, {delay:.0f} Sekunden Pause.", flush=True)
            page.wait_for_timeout(max(0, delay) * 1000)
            recent.clear()
        recent.append(time.monotonic())
        fill(page, values)
        with page.expect_response(is_coach, timeout=20000) as pending:
            page.locator("#check").click()
        return checked_response(pending.value)

    try:
        status = context.request.get(WORKER + "/api/status", headers={"Origin": ORIGIN}).json()
        assert status["ready"] is True and status["provider"] == "workers-ai", status
        page.goto(SITE + CATALOG)
        page.locator(f'.file-link[href*="{TRAINER}"]').click()
        recent.append(time.monotonic())
        with page.expect_response(is_coach, timeout=20000) as pending:
            page.locator("#resume").click()
        selected = checked_response(pending.value)
        current = state(page)["current"]
        assert current["source"] == "workers-ai"
        assert [current[k] for k in ("skill", "a", "p", "k")] == [selected["taskPlan"][k] for k in ("skill", "a", "p", "k")]

        values = expected_values(current)
        wrong = submit([values[0], values[1] + 100])
        assert wrong["feedbackKind"] == "hint"
        expect(page.locator("#v0")).to_have_attribute("data-verdict", "correct")
        expect(page.locator("#v1")).to_have_attribute("data-verdict", "incorrect")
        assert state(page)["current"]["aiAssisted"] is True
        no_overflow(page)
        page.screenshot(path=str(output / f"{engine}-ki-hinweis.png"), full_page=True)

        while state(page)["page"] != "summary":
            current = state(page)["current"]
            if current["solved"]:
                queued = state(page)["queue"]
                page.locator("#nextTask").click()
                if state(page)["page"] == "summary":
                    break
                current = state(page)["current"]
                assert queued and queued["source"] == "workers-ai"
                assert current["source"] == "workers-ai"
                assert [current[k] for k in ("skill", "a", "p", "k")] == [queued["plan"][k] for k in ("skill", "a", "p", "k")]
                if not full:
                    break
            result = submit(expected_values(current))
            assert result["feedbackKind"] == "praise"

        if full:
            records = state(page)["records"]
            assert len(records) == 12
            assert sum(r["skill"] == "expand" for r in records) == 6
            assert sum(r["skill"] == "complete" for r in records) == 6
            assert sum(r["exit"] for r in records) == 2
            assert all(r["source"] == "workers-ai" for r in records)
            page.reload()
            expect(page.locator("#summary")).to_be_visible()
            page.screenshot(path=str(output / f"{engine}-ki-auswertung.png"), full_page=True)
        for width, height in ((390, 844), (768, 1024), (1024, 768)):
            page.set_viewport_size({"width": width, "height": height})
            no_overflow(page)
        assert not errors, errors
        print(f"PASS {engine}: echte KI-Auswahl, Fehlerhinweis, Lob und konkrete Folgewahl; {len(answers)} KI-Antworten; "
              + ("vollständiger Durchgang mit beiden Abschlussrichtungen." if full else "Übernahme der Folgeaufgabe."), flush=True)
    except Exception:
        page.screenshot(path=str(output / f"{engine}-fehler.png"), full_page=True)
        raise
    finally:
        context.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--engine", choices=("chromium", "webkit", "all"), default="all")
    args = parser.parse_args()
    with sync_playwright() as playwright:
        for engine in (["chromium", "webkit"] if args.engine == "all" else [args.engine]):
            options = {"channel": "msedge"} if engine == "chromium" else {}
            browser = getattr(playwright, engine).launch(headless=True, **options)
            try:
                run(browser, engine, full=engine == "chromium")
            finally:
                browser.close()


if __name__ == "__main__":
    main()
