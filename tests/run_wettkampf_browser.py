"""Portal gegen die isolierte lokale API prüfen (Playwright und Edge erforderlich)."""
import argparse
import csv
import json
from pathlib import Path
from urllib.parse import urljoin

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", required=True)
    parser.add_argument("--codes", required=True, type=Path)
    args = parser.parse_args()
    with args.codes.open(encoding="utf-8-sig", newline="") as source:
        people = list(csv.DictReader(source, delimiter=";"))
    assert len(people) >= 2
    output = ROOT / ".local/wettkaempfe"
    output.mkdir(parents=True, exist_ok=True)
    errors = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context(viewport={"width": 1024, "height": 1366}, reduced_motion="reduce")
        page = context.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        responses = []

        def capture(response):
            if "/attempts" in response.url and response.ok:
                try:
                    data = response.json()
                    if data.get("attempt"):
                        responses.append(data["attempt"])
                except Exception:
                    pass

        page.on("response", capture)

        def login(target, person):
            target.locator("#group").fill(person["Gruppe"])
            target.locator("#code").fill(person["Code"])
            target.locator("#login-button").click()
            expect(target.locator("#session")).to_be_visible()

        def select(target):
            target.locator(".competition-card").filter(has_text="Dauerwertung").click()
            expect(target.locator("#competition-panel")).to_be_visible()

        def skip_round(target):
            for _ in range(3):
                target.get_by_role("button", name="Nächste Frage öffnen").click()
                expect(target.locator(".choice")).to_have_count(4)
                target.get_by_role("button", name="Frage überspringen", exact=False).click()
            expect(target.get_by_role("heading", name="Versuch beendet")).to_be_visible()

        page.goto(args.url)
        for width in [320, 390, 768, 1024]:
            page.set_viewport_size({"width": width, "height": 1100})
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), width
        page.set_viewport_size({"width": 1024, "height": 1366})
        page.screenshot(path=str(output / "portal-ipad.png"), full_page=True)
        page.locator("#group").fill(people[0]["Gruppe"])
        page.locator("#code").fill("x" * 43)
        page.locator("#login-button").click()
        expect(page.locator("#notice")).to_contain_text("ungültig")
        login(page, people[0])
        expect(page.locator(".competition-card")).to_have_count(3)
        select(page)
        page.get_by_role("button", name="Versuch starten", exact=True).click()
        page.get_by_role("button", name="Nächste Frage öffnen").click()
        expect(page.locator(".choice")).to_have_count(4)
        expect(page.locator(".choice").first).to_be_enabled()
        first = next(a for a in reversed(responses) if a["question"])
        assert "correct" not in first["question"]
        assert "questions" not in first
        assert page.locator(".choice").evaluate_all("buttons => buttons.every(b => b.getBoundingClientRect().height >= 44)")
        page.evaluate(r"""() => {const span=document.createElement('span'); span.id='formula-check'; document.body.append(span); katex.render('\\frac{1}{2}x^2', span, {trust:false});}""")
        expect(page.locator("#formula-check .katex")).to_be_visible()
        page.locator("#formula-check").evaluate("node => node.remove()")
        for width in [320, 390, 768, 1024]:
            page.set_viewport_size({"width": width, "height": 1100})
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), (width, "question")
        page.set_viewport_size({"width": 768, "height": 1024})
        page.screenshot(path=str(output / "spiel-ipad.png"), full_page=True)
        page.set_viewport_size({"width": 390, "height": 844})
        page.screenshot(path=str(output / "spiel-mobil.png"), full_page=True)
        assert page.locator("#code").input_value() == ""
        assert people[0]["Code"] not in page.url
        assert people[0]["Code"] not in page.evaluate("JSON.stringify({...sessionStorage,...localStorage})")

        page.reload()
        expect(page.locator("#login-panel")).to_be_visible()
        login(page, people[0])
        expect(page.locator(".choice")).to_have_count(4)
        current = next(a for a in reversed(responses) if a["question"])
        assert current["id"] == first["id"]
        assert current["question"]["deadline"] == first["question"]["deadline"]
        page.get_by_role("button", name="Frage überspringen", exact=False).click()
        for _ in range(2):
            page.get_by_role("button", name="Nächste Frage öffnen").click()
            page.get_by_role("button", name="Frage überspringen", exact=False).click()
        expect(page.get_by_role("heading", name="Versuch beendet")).to_be_visible()
        expect(page.locator("#personal-best")).to_have_text("0")
        expect(page.locator("#leaderboard li")).to_have_count(1)

        other = context.new_page()
        other.on("pageerror", lambda error: errors.append(str(error)))
        other.goto(args.url)
        login(other, people[1])
        select(other)
        expect(other.locator("#leaderboard li")).to_have_count(1)
        other.get_by_role("button", name="Versuch starten", exact=True).click()
        skip_round(other)
        expect(other.locator("#leaderboard li")).to_have_count(2)
        assert other.locator(".rank").all_text_contents() == ["1.", "1."]
        page.get_by_role("button", name="Neuen Versuch starten").click()
        skip_round(page)
        expect(page.locator("#leaderboard li")).to_have_count(2)

        page.get_by_role("button", name="Neuen Versuch starten").click()
        page.get_by_role("button", name="Nächste Frage öffnen").click()
        expect(page.locator(".choice").first).to_be_enabled()
        context.set_offline(True)
        expect(page.locator("#notice")).to_contain_text("offline")
        expect(page.locator(".choice").first).to_be_disabled()
        context.set_offline(False)
        expect(page.locator(".choice").first).to_be_enabled()
        page.locator("#logout").click()
        expect(page.locator("#login-panel")).to_be_visible()
        assert page.locator("#code").input_value() == ""
        assert not errors, errors
        browser.close()
    print(json.dumps({"result": "PASS", "viewports": [320, 390, 768, 1024],
                      "checks": ["Anmeldung", "Wiederaufnahme und Frist", "Rangliste auf zwei Sitzungen", "Gleichstand", "Bestwert", "Offline", "lokale Formeln", "Abmeldung"],
                      "javascript_errors": errors}, ensure_ascii=False))


if __name__ == "__main__":
    main()
