"""Prüft die zwölf Lernpfade und die Videoseite lokal mit Playwright/Edge."""
import base64
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from threading import Thread
from urllib.parse import urljoin

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
COURSE = "klasse-9/02-funktionen/01-quadratische-funktionen/lernpfad-quadratische-funktionen/"
VIDEO_PAGE = "klasse-9/02-funktionen/01-quadratische-funktionen/quadratische-ergaenzung-videos.html"


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/material-mathe/"):
            self.path = self.path.removeprefix("/material-mathe")
        super().do_GET()

    def log_message(self, *_args):
        pass


def main():
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(Handler, directory=str(ROOT / "_site")))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}/material-mathe/"
    output = ROOT / ".local/quadratische-funktionen"
    output.mkdir(parents=True, exist_ok=True)
    errors, remote = [], []
    cases = {
        "01": {"choices": {"d1": "yes", "d2": "sym", "d3": "square"}},
        "02": {"choices": {"sym": "same"}, "sliders": {"x-slider": -4}},
        "03": {"choices": {"dir": "down", "width": "narrow"}, "sliders": {"a-slider": -2}},
        "04": {"choices": {"shift": "same"}, "sliders": {"h-slider": 3, "k-slider": -2}},
        "05": {"inputs": {"answer": "0.5"}},
        "06": {"inputs": {"h": "-2", "k": "-1"}},
        "07": {"inputs": {"r1": "-1", "r2": "3"}},
        "08": {"inputs": {"r1": "-4", "r2": "4"}},
        "09": {"choices": {"f1": "v", "f2": "p", "f3": "n"}},
        "10": {"inputs": {"answer": "-0.25"}},
        "11": {"inputs": {"answer": "6"}, "sliders": {"x-slider": 6}},
        "12": {"inputs": {"vx": "1", "vy": "-8", "r1": "-1", "r2": "3"}},
    }
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(channel="msedge", headless=True)
            context = browser.new_context(viewport={"width": 1024, "height": 1366}, reduced_motion="reduce")
            page = context.new_page()
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.on("request", lambda request: remote.append(request.url) if request.url.startswith(("http://", "https://")) and not request.url.startswith(base.removesuffix("material-mathe/")) else None)

            page.goto(base + "index.html#/klasse-9/02-funktionen/lernpfade")
            expect(page.locator(".file-link")).to_have_count(12)
            assert page.get_by_role("link", name="Von der Normalform", exact=False).count() == 1
            lesson_link = page.locator('.file-link[href*="06_Normalform_in_Scheitelpunktform.html"]')
            lesson_link.click()
            page.locator("#h").wait_for()
            toolbar = page.locator("#sammlung-navigation").locator("a").first
            expect(toolbar).to_have_attribute("href", base + "index.html#/klasse-9/02-funktionen/lernpfade")

            lessons = sorted((ROOT / COURSE).glob("[0-9][0-9]_*.html"))
            for lesson in lessons:
                lesson_id = lesson.name[:2]
                page.goto(base + COURSE + lesson.name)
                page.locator("[data-action='check" + lesson_id + "']").wait_for()
                assert page.locator(".katex").count() > 0
                assert page.locator(".katex-error").count() == 0
                case = cases[lesson_id]
                for name, value in case.get("sliders", {}).items():
                    page.locator("#" + name).evaluate("(node, value) => {node.value=value; node.dispatchEvent(new Event('input', {bubbles:true}));}", value)
                for group, value in case.get("choices", {}).items():
                    page.locator(f'.choices[data-group="{group}"] .choice[data-value="{value}"]').click()
                for name, value in case.get("inputs", {}).items():
                    page.locator("#" + name).fill(value)
                page.locator(f'[data-action="check{lesson_id}"]').click()
                expect(page.locator("#feedback")).to_have_class("feedback good")
                # Die H5P-Frage muss ohne LMS direkt auf jeder Seite spielbar sein.
                quiz = page.locator(".h5p-activity")
                expect(quiz).to_have_count(1)
                quiz.locator('button[type="submit"]').click()
                expect(quiz.locator(".h5p-feedback")).to_contain_text("wähle zuerst")
                quiz.locator('input[data-correct="false"]').first.check()
                quiz.locator('button[type="submit"]').click()
                expect(quiz.locator(".h5p-feedback")).to_have_class("h5p-feedback bad")
                quiz.locator("[data-h5p-solution]").click()
                expect(quiz.locator(".h5p-feedback")).to_contain_text("Die richtige Antwort lautet")
                quiz.locator("[data-h5p-retry]").click()
                expect(quiz.locator('input:checked')).to_have_count(0)
                quiz.locator('input[data-correct="true"]').check()
                quiz.locator('button[type="submit"]').click()
                expect(quiz.locator(".h5p-feedback")).to_have_class("h5p-feedback good")
                expect(quiz.locator('input:disabled')).to_have_count(4)
                expect(quiz.locator('button[type="submit"]')).to_be_hidden()
                assert page.locator(".katex-error").count() == 0
                if lesson_id == "03":
                    page.locator("#a-slider").evaluate("node => {node.value=0; node.dispatchEvent(new Event('input'));}")
                    page.locator('.choices[data-group="dir"] .choice[data-value="flat"]').click()
                    page.locator('[data-action="check03"]').click()
                    expect(page.locator("#feedback")).to_have_class("feedback good")
                    expect(page.locator("#shape")).to_contain_text("konstante Funktion")
                if lesson_id == "06":
                    page.locator("#h").fill("2")
                    page.locator('[data-action="check06"]').click()
                    expect(page.locator("#feedback")).to_have_class("feedback bad")
                    page.locator("#mark-done").check()
                    page.reload()
                    expect(page.locator("#mark-done")).to_be_checked()
                    expect(page.locator(".video-learning video")).to_have_count(3)
                    video = page.locator("#worked-example-video")
                    panel = page.locator("#video-checkpoint-panel")
                    video.evaluate("v => {v.playbackRate=4; return v.play();}")
                    for number in range(1, 4):
                        expect(panel).to_be_visible()
                        expect(page.locator("#video-checkpoint-title")).to_contain_text(f"Kontrollfrage {number}")
                        assert video.evaluate("v => v.paused")
                        page.locator("#video-checkpoint-answer").fill("0")
                        page.locator("#video-checkpoint-check").click()
                        expect(page.locator("#video-checkpoint-status")).to_have_class("video-checkpoint-status feedback bad")
                        if number == 1:
                            page.locator("#video-checkpoint-solution").click()
                            expect(page.locator("#video-checkpoint-status")).to_contain_text("Lösung: 2")
                            page.locator("#video-checkpoint-resume").click()
                        elif number == 2:
                            page.locator("#video-checkpoint-skip").click()
                        else:
                            page.locator("#video-checkpoint-answer").fill("−1,0")
                            page.locator("#video-checkpoint-check").click()
                            expect(page.locator("#video-checkpoint-status")).to_have_class("video-checkpoint-status feedback good")
                            page.locator("#video-checkpoint-resume").click()
                        expect(panel).to_be_hidden()
                    video.evaluate("v => v.pause()")
                    # Auch die beiden weiteren eingebetteten Clips müssen laden.
                    for clip in page.locator(".video-learning video").all():
                        clip.evaluate("v => {v.preload='metadata'; v.load();}")
                        expect(clip).to_have_js_property("videoWidth", 1280)
                        expect(clip).to_have_js_property("videoHeight", 720)
                if lesson_id == "08":
                    for method, values in [("factor", ["-1", "2"]), ("pq", ["2", "3"])]:
                        page.locator(f'[data-method="{method}"]').click()
                        for field, value in zip(["r1", "r2"], values):
                            page.locator("#" + field).fill(value)
                        page.locator('[data-action="check08"]').click()
                        expect(page.locator("#feedback")).to_have_class("feedback good")
                for width in [320, 390, 768, 1024]:
                    page.set_viewport_size({"width": width, "height": 1100})
                    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), (lesson.name, width)
                for href in page.locator("a[href]").evaluate_all("nodes => nodes.map(node => node.getAttribute('href'))"):
                    if href.startswith(("#", "data:")):
                        continue
                    assert page.request.get(urljoin(page.url, href)).ok, (lesson.name, href)
                if lesson_id == "06":
                    page.set_viewport_size({"width": 768, "height": 1024})
                    page.screenshot(path=str(output / "lernpfad-06-ipad.png"), full_page=True)

            page.goto(base + COURSE + "index.html")
            expect(page.locator(".course-item")).to_have_count(12)
            expect(page.locator(".h5p-download")).to_have_count(12)
            expect(page.locator(".status.done")).to_have_count(1)
            assert not page.get_by_role("link", name="Lehrkraft", exact=False).count()
            page.screenshot(path=str(output / "lernreihe-ipad.png"), full_page=True)

            page.goto(base + "index.html#/klasse-9/01-arithmetik-algebra/lernpfade")
            expect(page.locator(".file-link")).to_have_count(1)
            expect(page.locator(".file-link")).to_have_attribute("href", __import__("re").compile("08_Quadratische_Gleichungen_loesen"))
            page.goto(base + "index.html#/klasse-9/02-funktionen/videos")
            expect(page.locator(".file-link")).to_have_count(1)
            page.locator(".file-link").click()
            expect(page.locator("video[playsinline][controls]")).to_have_count(3)
            page.wait_for_function("[...document.querySelectorAll('video')].every(v => v.readyState >= 1)")
            videos = page.locator("video").evaluate_all("nodes => nodes.map(v => ({duration:v.duration,width:v.videoWidth,height:v.videoHeight,error:v.error}))")
            assert all(v["width"] == 1280 and v["height"] == 720 and not v["error"] for v in videos), videos
            for video in page.locator("video").all():
                video.evaluate("v => v.play()")
                page.wait_for_function("[...document.querySelectorAll('video')].some(v => !v.paused && v.currentTime > 0)")
                video.evaluate("v => v.pause()")
            for width in [320, 390, 768, 1024]:
                page.set_viewport_size({"width": width, "height": 1100})
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), ("videos", width)
            for href in page.locator("a[href],source,video[poster]").evaluate_all("nodes => nodes.map(n => n.getAttribute('href') || n.getAttribute('src') || n.getAttribute('poster'))"):
                if not href.startswith("#"):
                    assert page.request.get(urljoin(page.url, href)).ok, href
            page.set_viewport_size({"width": 768, "height": 1024})
            page.screenshot(path=str(output / "videos-ipad.png"), full_page=True)

            page.goto((ROOT / COURSE / "06_Normalform_in_Scheitelpunktform.html").as_uri())
            page.locator("#h").fill("-2")
            page.locator("#k").fill("-1")
            page.locator('[data-action="check06"]').click()
            expect(page.locator("#feedback")).to_have_class("feedback good")
            quiz = page.locator(".h5p-activity")
            quiz.locator('input[data-correct="true"]').check()
            quiz.locator('button[type="submit"]').click()
            expect(quiz.locator(".h5p-feedback")).to_have_class("h5p-feedback good")
            assert not errors, errors
            assert not remote, remote
            browser.close()
        print(json.dumps({"result": "PASS", "lessons": 12, "inline_quizzes": 12, "video_checkpoints": 3, "videos": videos, "viewports": [320, 390, 768, 1024],
                          "direct_file_open": True, "javascript_errors": errors, "external_requests": remote}, ensure_ascii=False))
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
