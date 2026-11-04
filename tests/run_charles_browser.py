"""Prüft Charles' Gespräch, Kontextwechsel, Fehler und Touch-Layout; optional echte KI."""
import argparse
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", str(ROOT / ".local/playwright-browsers"))
from playwright.sync_api import expect, sync_playwright
from run_formenwechsel_ai_browser import SITE, WORKER, local_pages
from run_formenwechsel_browser import TRAINER, no_overflow, state
from run_formenwechsel_mobile_browser import visible_box


def run(browser, engine, live):
    context = browser.new_context(viewport={"width": 768, "height": 1024}, has_touch=True, is_mobile=True, reduced_motion="reduce")
    context.route(SITE + "**", local_pages)
    page = context.new_page()
    page.set_default_timeout(20000)
    errors, packets, sessions = [], [], []
    page.on("pageerror", lambda error: errors.append(error.stack))
    mode = {"value": "ok"}

    def backend(route):
        if route.request.method == "OPTIONS":
            route.fulfill(status=204, headers={"access-control-allow-origin": "https://hardenacke.github.io", "access-control-allow-headers": "Content-Type, Authorization"})
            return
        url = route.request.url
        if url.endswith("/session"):
            sessions.append(url)
            response = {"token": "browser-test-session", "expiresAt": 9999999999999}
        else:
            p = route.request.post_data_json
            if url.endswith("/automatic"):
                response = {"schemaVersion": 3, "requestId": p["requestId"], "sequence": p["sequence"], "revision": p["revision"], "source": "workers-ai", "feedback": "Los geht’s! Probiere den ersten Schritt.", "feedbackKind": "encouragement", "taskPlan": {"skill": "complete", "level": 1, "a": 1, "p": -3, "k": 5, "promptStyle": "standard"}}
            else:
                packets.append(p)
                if mode["value"] == "error":
                    route.fulfill(status=502, json={"error": "AI_UNAVAILABLE"}, headers={"access-control-allow-origin": "https://hardenacke.github.io"})
                    return
                if mode["value"] == "stale":
                    page.evaluate("document.querySelector('#navIntro').click()")
                if mode["value"] == "unread":
                    page.evaluate("document.querySelector('#coachCollapse').click()")
                response = {"schemaVersion": 1, "requestId": p["requestId"], "sequence": p["sequence"], "revision": p["revision"], "source": "workers-ai", "answer": "Halbiere zuerst den linearen Koeffizienten. Achte dabei auf sein Vorzeichen.\nDu kannst das Schritt für Schritt schaffen!"}
        route.fulfill(json=response, headers={"access-control-allow-origin": "https://hardenacke.github.io"})

    if not live:
        context.route(WORKER + "/api/**", backend)
    output = ROOT / ".local/formenwechsel/charles"
    output.mkdir(parents=True, exist_ok=True)

    def ask(text):
        page.locator("#charlesQuestion").fill(text)
        with page.expect_response(lambda r: r.url.endswith("/api/coach/question") and r.request.method == "POST") as pending:
            page.locator("#charlesSend").click()
        response = pending.value
        assert response.ok, (response.status, response.text())
        data = response.json()
        assert data["source"] == "workers-ai" and data["answer"]
        expect(page.locator("#charlesMessages .assistant").last).to_contain_text(data["answer"])
        if live:
            print(f"{engine}: Charles antwortet: {data['answer']}", flush=True)
        return data

    try:
        page.goto(SITE + TRAINER)
        expect(page.locator("#autoCoachTitle")).to_have_text("Charles")
        expect(page.locator("#charlesQuestion")).to_be_enabled()
        first = ask("Warum wird beim quadratischen Ergänzen die Hälfte quadriert? Erkläre es an meinem sichtbaren Beispiel.")
        if live:
            assert "binomische Formel" in first["answer"]
        assert state(page)["current"] is None
        if not live:
            assert packets[-1]["context"]["lesson"]["p"] == 3
        page.locator("#pIncrease").click()
        expect(page.locator("#charlesMessages")).to_be_empty()
        page.locator("#resume").click()
        expect(page.locator("#autoCoachCard")).to_have_attribute("data-state", "workers-ai", timeout=15000)
        before = state(page)["current"]
        answer = ask("Hilf mir beim ersten Schritt meiner aktuellen Aufgabe. Wie gehe ich vor?")
        after = state(page)["current"]
        assert after["id"] == before["id"] and after["a"] == before["a"] and after["p"] == before["p"]
        assert after["aiAssisted"] is True
        if not live:
            assert packets[-1]["context"]["task"]["id"] == before["id"]
            assert packets[-1]["history"] == []
        ask("Was bedeutet hier das Vorzeichen?")
        if live:
            ask("Was unterscheidet Normalform und Scheitelpunktform, und wofür sind beide gut?")
        if not live:
            assert len(packets[-1]["history"]) == 2
            mode["value"] = "unread"
            ask("Noch ein Tipp bitte")
            expect(page.locator("#autoCoachCard")).to_be_hidden()
            expect(page.locator("#coachDock")).to_have_attribute("data-unread", "true")
            page.locator("#coachLauncher").click()
            expect(page.locator("#coachDock")).to_have_attribute("data-unread", "false")
            mode["value"] = "error"
            page.locator("#charlesQuestion").fill("Bitte noch einmal erklären")
            page.locator("#charlesSend").click()
            expect(page.locator("#charlesStatus")).to_contain_text("konnte gerade nicht antworten")
            expect(page.locator("#charlesQuestion")).to_have_value("Bitte noch einmal erklären")
            mode["value"] = "stale"
            page.locator("#charlesSend").click()
            expect(page.locator("#intro")).to_be_visible()
            expect(page.locator("#charlesMessages")).to_be_empty()
            mode["value"] = "ok"
            page.locator("#resume").click()
            expect(page.locator("#charlesMessages")).to_be_empty()
            page.locator("#charlesQuestion").fill("Erkläre das bitte <img src=x onerror=alert(1)>")
            page.locator("#charlesQuestion").press("Enter")
            expect(page.locator("#charlesMessages .assistant")).to_have_count(1)
            assert page.locator("#charlesMessages img").count() == 0
            assert len(sessions) == 1
        for width, height in ((320, 568), (390, 844), (768, 1024), (1024, 768), (844, 390)):
            page.set_viewport_size({"width": width, "height": height})
            page.wait_for_timeout(60)
            no_overflow(page)
            visible_box(page, "#autoCoachCard")
            visible_box(page, "#charlesQuestion")
            visible_box(page, "#charlesSend")
            page.screenshot(path=str(output / f"{engine}-{'live' if live else 'test'}-{width}.png"))
        page.set_viewport_size({"width": 768, "height": 1024})
        page.evaluate("Object.defineProperty(visualViewport,'height',{configurable:true,value:360});visualViewport.dispatchEvent(new Event('resize'))")
        page.wait_for_timeout(100)
        visible_box(page, "#charlesQuestion")
        page.evaluate("delete visualViewport.height;visualViewport.dispatchEvent(new Event('resize'))")
        page.wait_for_timeout(80)
        page.locator("#coachCollapse").click()
        expect(page.locator("#autoCoachCard")).to_be_hidden()
        page.locator("#coachLauncher").click()
        expect(page.locator("#charlesQuestion")).to_be_visible()
        page.reload()
        expect(page.locator("#charlesMessages")).to_be_empty()
        if not live:
            page.locator("#navIntro").click()
            page.locator("#pDecrease").click()  # Wieder das unveränderte Startbeispiel.
            ask("Kannst du das noch einmal zeigen?")
            page.locator("#reset").click()
            page.locator("#confirmReset").click()
            expect(page.locator("#charlesMessages")).to_be_empty()
        assert not errors, errors
        print(f"PASS {engine}: Charles {'mit echten KI-Antworten' if live else 'mit Kontext-, Fehler- und Sicherheitstests'}, Fragen zur Aufgabe, Verlauf und 5 Touch-Ansichten.", flush=True)
    except Exception:
        page.screenshot(path=str(output / f"{engine}-fehler.png"), full_page=True)
        raise
    finally:
        context.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--engine", choices=("chromium", "webkit", "all"), default="all")
    parser.add_argument("--live", action="store_true", help="Vier echte Fragen und eine Aufgabenwahl je Browser")
    args = parser.parse_args()
    with sync_playwright() as playwright:
        for engine in (["chromium", "webkit"] if args.engine == "all" else [args.engine]):
            browser = getattr(playwright, engine).launch(headless=True, **({"channel": "msedge"} if engine == "chromium" else {}))
            try:
                run(browser, engine, args.live)
            finally:
                browser.close()


if __name__ == "__main__":
    main()
