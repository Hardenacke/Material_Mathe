"""Lokale Lernpfadprüfung gegen den echten Worker; keine externen KI-Aufrufe."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
from threading import Thread
import uuid

ROOT = Path(__file__).resolve().parents[1]
if (ROOT / '.local/playwright-browsers').exists():
    os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', str(ROOT / '.local/playwright-browsers'))
from playwright.sync_api import expect, sync_playwright

COURSE = 'gemeinsam/adaptive-lernpfade/'


class Handler(SimpleHTTPRequestHandler):
    worker = 'http://127.0.0.1:8790'

    def do_GET(self):
        self.path = self.path.removeprefix('/material-mathe')
        if self.path in ('/' + COURSE + 'index.html', '/' + COURSE + 'admin.html'):
            content = (ROOT / '_site' / self.path.lstrip('/')).read_text(encoding='utf-8')
            content = content.replace('"workerBase":""', '"workerBase":' + json.dumps(self.worker))
            data = content.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        else:
            super().do_GET()

    def log_message(self, *_args):
        pass


def solve(page):
    expect(page.locator('#check')).to_be_visible()
    expect(page.locator('#check')).to_be_enabled()
    question = page.locator('#question').inner_text()
    number = lambda x: float(x.replace('.', '').replace(',', '.'))
    speed = re.search(r'gleichförmig ([\d.,]+) m in ([\d.,]+) (min|s)', question)
    distance = re.search(r'mit ([\d.,]+) m/s.*in ([\d.,]+) s', question)
    if speed:
        value, unit = number(speed[1]) / (number(speed[2]) * (60 if speed[3] == 'min' else 1)), 'm/s'
    elif distance:
        value, unit = number(distance[1]) * number(distance[2]), 'm'
    else:
        raise AssertionError('Unerwartete Startaufgabe: ' + question)
    page.locator('#value').fill(str(value).replace('.', ','))
    page.locator('#unit').select_option(unit)
    page.locator('#check').click()
    expect(page.locator('#result')).to_contain_text('Geschafft!')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--engine', choices=['chromium', 'webkit', 'all'], default='all')
    args = parser.parse_args()
    private = ROOT / 'werkzeuge/adaptive_lernpfade/.dev.vars'
    key = re.search(r'^TEACHER_KEY="([^"]+)"', private.read_text(encoding='utf-8'), re.M)[1]
    server = ThreadingHTTPServer(('127.0.0.1', 8000), partial(Handler, directory=str(ROOT / '_site')))
    Thread(target=server.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:8000/material-mathe/'
    output = ROOT / '.local/adaptive-lernpfade/browser'
    output.mkdir(parents=True, exist_ok=True)
    errors, external = [], []
    try:
        with sync_playwright() as playwright:
            for engine in (['chromium', 'webkit'] if args.engine == 'all' else [args.engine]):
                browser = getattr(playwright, engine).launch(**({'channel': 'msedge'} if engine == 'chromium' else {}), headless=True)
                context = browser.new_context(viewport={'width': 768, 'height': 1024}, has_touch=True, reduced_motion='reduce')
                context.on('page', lambda p: p.on('pageerror', lambda e: errors.append(str(e))))
                context.on('request', lambda r: external.append(r.url) if r.url.startswith(('http:', 'https:')) and not r.url.startswith(('http://127.0.0.1:8000/', Handler.worker + '/')) else None)
                page, admin = context.new_page(), context.new_page()
                room_created = False
                try:
                    page.goto(base + 'index.html')
                    page.locator('.learning-path-entry').click()
                    expect(page.locator('#login')).to_be_visible()
                    page.locator('#demo').click()
                    solve(page)
                    expect(page.locator('#changeMode')).to_be_disabled()
                    page.locator('#logout').click()

                    admin.goto(base + COURSE + 'admin.html')
                    admin.locator('#teacherKey').fill(key)
                    admin.get_by_role('button', name='Anmelden', exact=True).click()
                    expect(admin.locator('#management')).to_be_visible()
                    name = 'Lokaler Browsertest ' + engine + ' ' + uuid.uuid4().hex[:8]
                    admin.locator('#roomName').fill(name)
                    admin.locator('#learnerCount').fill('2')
                    admin.locator('#retentionDays').fill('7')
                    admin.locator('#fobizzUrl').fill('https://app.fobizz.com/test')
                    admin.get_by_role('button', name='Lerngruppe und Codes erstellen').click()
                    expect(admin.locator('#roomTitle')).to_have_text(name)
                    room_created = True
                    expect(admin.locator('#credentialsPanel')).to_be_visible()
                    codes = admin.locator('#credentialsTable code').all_text_contents()
                    assert len(codes) == 2
                    assert admin.locator('#teacherKey').input_value() == ''

                    page.locator('#learningCode').fill(codes[0])
                    page.locator('#login').click()
                    expect(page.locator('#learningMode')).to_have_value('single_chat')
                    expect(page.locator('#coachStatus')).to_contain_text('bestätigten fobizz-Schnittstelle')
                    expect(page.locator('#chatPanel')).to_be_hidden()
                    solve(page)
                    page.locator('#next').click()
                    expect(page.locator('#check')).to_be_visible()
                    solve(page)
                    question = page.locator('#question').inner_text()
                    page.locator('#learningMode').select_option('classroom')
                    page.locator('#changeMode').click()
                    expect(page.locator('#packet')).to_be_enabled()
                    expect(page.locator('#question')).to_have_text(question)
                    expect(page.locator('#fobizz')).to_have_attribute('href', 'https://app.fobizz.com/test')
                    page.locator('#packet').click()
                    expect(page.locator('#packetArea')).to_be_visible()
                    packet = page.locator('#packetText').input_value()
                    assert all(secret not in packet for secret in [*codes, key, name])
                    packet_id = re.search(r'"packetId":"([a-f0-9-]+)"', packet)[1]
                    feedback = '<img src=x onerror=alert(1)> Übe die Einheiten.'
                    page.locator('#coachReply').fill(json.dumps({'schemaVersion': 1, 'packetId': packet_id, 'feedback': feedback, 'nextFocus': 'units', 'challenge': 'maintain'}))
                    page.locator('#apply').click()
                    expect(page.locator('#coachResult')).to_have_text(feedback)
                    assert page.locator('#coachResult img').count() == 0

                    for width, height in [(390, 844), (768, 1024), (1024, 768)]:
                        page.set_viewport_size({'width': width, 'height': height})
                        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
                        page.screenshot(path=str(output / f'{engine}-{width}.png'), full_page=True)
                    page.locator('#logout').click()
                    page.locator('#learningCode').fill(codes[0])
                    page.locator('#login').click()
                    expect(page.locator('#learningMode')).to_have_value('classroom')
                    expect(page.locator('#coachResult')).to_have_text(feedback)
                    expect(page.locator('#question')).to_have_text(question)

                    other = context.new_page()
                    other.goto(base + COURSE + 'index.html')
                    other.locator('#learningCode').fill(codes[1])
                    other.locator('#login').click()
                    expect(other.locator('#summary')).to_contain_text('Beginne mit der ersten Aufgabe')
                    expect(other.locator('#coachResult')).to_be_hidden()
                    other.close()

                    admin.locator('#roomAllowClassroom').uncheck()
                    admin.locator('#saveRoomLink').click()
                    expect(admin.locator('#message')).to_contain_text('gespeichert')
                    page.locator('#next').click()
                    expect(page.locator('#notice')).to_contain_text('geändert')
                    expect(page.locator('#learningMode')).to_have_value('single_chat')
                    assert page.evaluate('localStorage.length') == 0
                    assert page.evaluate('document.cookie') == ''
                    page.reload()
                    expect(page.locator('#loginPanel')).to_be_visible()
                    page.goto((ROOT / 'gemeinsam/adaptive-lernpfade/index.html').as_uri())
                    expect(page.locator('#login')).to_be_disabled()
                    page.locator('#demo').click()
                    solve(page)
                    print(f'{engine}: Demo, Verwaltung, zwei Lernplätze, Transfer, Moduswechsel, Wiederanmeldung und drei Bildschirmgrößen OK')
                finally:
                    if room_created:
                        admin.locator('#confirmRoomDelete').check()
                        admin.locator('#deleteRoom').click()
                        expect(admin.locator('#roomPanel')).to_be_hidden()
                    context.close()
                    browser.close()
        assert not errors, errors
        assert not external, external
        print('Keine JavaScript-Fehler und keine externen Anfragen. Lokale Testräume gelöscht.')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
