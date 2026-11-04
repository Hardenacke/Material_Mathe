"""Touch- und Layoutprüfung der schwebenden Lernbegleitung ohne KI-Aufrufe."""
import argparse
from functools import partial
from http.server import ThreadingHTTPServer
import os
from pathlib import Path
from threading import Thread

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", str(ROOT / ".local/playwright-browsers"))
from playwright.sync_api import expect, sync_playwright
from run_formenwechsel_browser import Handler, TRAINER, no_overflow, state

SIZES = ((320, 568), (390, 844), (768, 1024), (1024, 768),
         (834, 1194), (1194, 834), (507, 768), (844, 390))


def visible_box(page, selector):
    box = page.locator(selector).bounding_box()
    viewport = page.evaluate("({width:visualViewport.width,height:visualViewport.height})")
    assert box and box["width"] > 0 and box["height"] > 0, selector
    assert box["x"] >= -1 and box["y"] >= -1, (selector, box, viewport)
    assert box["x"] + box["width"] <= viewport["width"] + 1, (selector, box, viewport)
    assert box["y"] + box["height"] <= viewport["height"] + 1, (selector, box, viewport)
    return box


def check(browser, engine, base):
    context = browser.new_context(viewport={"width": 768, "height": 1024},
                                  has_touch=True, is_mobile=True, device_scale_factor=2,
                                  reduced_motion="reduce")
    page = context.new_page()
    page.set_default_timeout(10000)
    errors, remote = [], []
    page.on("pageerror", lambda error: errors.append(error.stack))
    page.on("request", lambda request: remote.append(request.url)
            if request.url.startswith(("http:", "https:")) and not request.url.startswith(base) else None)
    output = ROOT / ".local/formenwechsel/mobile"
    output.mkdir(parents=True, exist_ok=True)
    try:
        page.goto(base + TRAINER)
        expect(page.locator("#autoCoachCard")).to_be_visible()
        assert page.locator("#practice #coachDock").count() == 0
        original = state(page)
        before = visible_box(page, "#autoCoachCard")
        page.evaluate("scrollTo(0,document.documentElement.scrollHeight)")
        page.wait_for_timeout(50)
        after = visible_box(page, "#autoCoachCard")
        assert abs(before["y"] - after["y"]) <= 1, (before, after)

        page.locator("#coachCollapse").tap()
        expect(page.locator("#autoCoachCard")).to_be_hidden()
        expect(page.locator("#coachLauncher")).to_have_attribute("aria-expanded", "false")
        point = visible_box(page, "#coachLauncher")
        assert point["width"] >= 44 and point["height"] >= 44
        assert page.locator(".coachLauncherDot").bounding_box()["width"] <= 30
        assert state(page) == original
        page.reload()
        expect(page.locator("#autoCoachCard")).to_be_hidden()
        expect(page.locator("#coachLauncher")).to_be_visible()
        page.locator("#coachLauncher").focus()
        page.keyboard.press("Enter")
        expect(page.locator("#autoCoachCard")).to_be_visible()
        page.keyboard.press("Escape")
        expect(page.locator("#autoCoachCard")).to_be_hidden()

        for width, height in SIZES:
            page.set_viewport_size({"width": width, "height": height})
            page.wait_for_timeout(40)
            page.locator("#coachLauncher").tap()
            expect(page.locator("#autoCoachCard")).to_be_visible()
            no_overflow(page)
            positions = []
            for fraction in (0, 0.5, 1):
                page.evaluate("fraction => scrollTo(0,fraction*(document.documentElement.scrollHeight-innerHeight))", fraction)
                page.wait_for_timeout(40)
                positions.append(visible_box(page, "#autoCoachCard"))
            assert max(p["y"] for p in positions) - min(p["y"] for p in positions) <= 1
            page.screenshot(path=str(output / f"{engine}-{width}x{height}-offen.png"))
            page.locator("#coachCollapse").tap()
            point = visible_box(page, "#coachLauncher")
            assert point["width"] >= 44
            no_overflow(page)

        # Neue lokale und später eintreffende KI-Texte dürfen den eingeklappten
        # Bereich nicht aufdrängen, müssen aber am Punkt angezeigt werden.
        page.set_viewport_size({"width": 390, "height": 844})
        page.locator("#navPractice").tap()
        page.locator("#v0").fill("999")
        page.locator("#v1").fill("999")
        page.locator("#check").tap()
        expect(page.locator("#coachDock")).to_have_attribute("data-unread", "true")
        expect(page.locator("#coachLauncher")).to_have_attribute("aria-label", "Neue Rückmeldung – Charles öffnen")
        expect(page.locator("#autoCoachCard")).to_be_hidden()
        page.screenshot(path=str(output / f"{engine}-neue-rueckmeldung.png"))
        page.locator("#coachLauncher").tap()
        expect(page.locator("#coachDock")).to_have_attribute("data-unread", "false")
        expect(page.locator("#autoCoachText")).not_to_be_empty()
        page.locator("#coachCollapse").tap()
        learning = state(page)
        page.evaluate("""() => {
          document.querySelector('#autoCoachText').textContent='Achte auf das Vorzeichen beim Halbieren.';
          document.querySelector('#autoCoachCard').dataset.state='workers-ai';
          document.querySelector('#autoCoachCard').dataset.tone='incorrect';
        }""")
        expect(page.locator("#coachDock")).to_have_attribute("data-unread", "true")
        expect(page.locator("#autoCoachCard")).to_be_hidden()
        assert state(page) == learning
        page.locator("#coachLauncher").tap()
        expect(page.locator("#autoCoachText")).to_contain_text("Halbieren")

        # Wenig sichtbare Höhe entspricht z. B. einem quer gehaltenen Handy.
        page.set_viewport_size({"width": 390, "height": 360})
        page.wait_for_timeout(50)
        visible_box(page, "#autoCoachCard")
        page.locator("#v1").focus()
        page.wait_for_function("""() => {
          const input=document.querySelector('#v1').getBoundingClientRect();
          const panel=document.querySelector('#autoCoachCard').getBoundingClientRect();
          return input.bottom<=panel.top || input.right<=panel.left;
        }""", timeout=2000)
        input_box = page.locator("#v1").bounding_box()
        panel = visible_box(page, "#autoCoachCard")
        assert input_box["y"] + input_box["height"] <= panel["y"] + 1 or input_box["x"] + input_box["width"] <= panel["x"], (input_box, panel)
        # Safari kann bei eingeblendeter Bildschirmtastatur nur die sichtbare
        # VisualViewport-Höhe verkleinern, während die Layout-Höhe bestehen bleibt.
        for width, height in ((768, 1024), (1024, 768)):
            page.set_viewport_size({"width": width, "height": height})
            page.evaluate("""() => {
              Object.defineProperty(visualViewport,'height',{configurable:true,value:360});
              visualViewport.dispatchEvent(new Event('resize'));
            }""")
            page.wait_for_timeout(70)
            visible_box(page, "#autoCoachCard")
            page.evaluate("""() => {
              delete visualViewport.height;
              visualViewport.dispatchEvent(new Event('resize'));
            }""")
            page.wait_for_timeout(50)
        page.set_viewport_size({"width": 768, "height": 1024})
        page.wait_for_timeout(50)
        visible_box(page, "#autoCoachCard")
        page.locator("#coachCollapse").tap()
        page.reload()
        expect(page.locator("#autoCoachCard")).to_be_hidden()
        assert state(page)["current"]["values"] == learning["current"]["values"]
        assert not errors, errors
        assert not remote, remote
        print(f"PASS {engine}: 8 Touch-Ansichten, Hoch-/Querformat, Split View, feste Box beim Scrollen, Punkt, Tastatur, neue Rückmeldungen und gespeicherte Ansicht.", flush=True)
    finally:
        context.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--engine", choices=("chromium", "webkit", "all"), default="all")
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(Handler, directory=str(ROOT / "_site")))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}/"
    try:
        with sync_playwright() as playwright:
            for engine in (["chromium", "webkit"] if args.engine == "all" else [args.engine]):
                options = {"channel": "msedge"} if engine == "chromium" else {}
                browser = getattr(playwright, engine).launch(headless=True, **options)
                try:
                    check(browser, engine, base)
                finally:
                    browser.close()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
