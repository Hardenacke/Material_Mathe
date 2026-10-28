"""Prüft alle 24 Quizoberflächen gegen den lokalen Cloudflare-Worker."""
import argparse
import json
import math
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
QUIZZES = json.loads((ROOT / 'dokumentation/QUIZ_SEKI_ZUORDNUNG.json').read_text(encoding='utf-8'))['quizze']


def fill_answer(page, question, training=True):
    kind = question['kind']
    if training:
        answer = question.get('answer')
    else:
        numbers = [int(n) for n in re.findall(r'\d+', question['prompt'])]
        if kind == 'choice':
            numeric = [(i, int(match[0])) for i, option in enumerate(question['options'])
                       if (match := re.search(r'\d+', option))]
            answer = max(numeric, key=lambda item: item[1])[0]
        elif kind == 'slider':
            answer = numbers[0]
        elif 'Runde' in question['prompt']:
            answer = math.floor(numbers[0] / 10 + 0.5) * 10
        else:
            answer = sum(numbers)
    if kind == 'number':
        page.locator('#answer').fill(str(answer).replace('.', ','))
    elif kind == 'fraction':
        page.locator('#fractionNum').fill(str(answer['num']))
        page.locator('#fractionDen').fill(str(answer['den']))
    elif kind == 'choice':
        page.locator(f'.answer-btn[data-i="{question["correct"] if training else answer}"]').click()
    elif kind == 'slider':
        page.locator('#rangeNumber').fill(str(answer).replace('.', ','))
    elif kind == 'match':
        for i, pair in enumerate(question['pairs']):
            page.locator(f'[data-match="{i}"]').select_option(str(pair['correct']))
    elif kind == 'order':
        for i, item in enumerate(question['items']):
            position = page.evaluate('(item)=>state.order.indexOf(item)', item)
            while position > i:
                page.locator(f'[data-move="-1"][data-i="{position}"]').click()
                position -= 1
    elif kind == 'construct':
        for x, y in question['points']:
            page.locator('#coordX').fill(str(x))
            page.locator('#coordY').fill(str(y))
            page.locator('#addPoint').click()
    else:
        raise AssertionError(kind)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='http://127.0.0.1:8788')
    parser.add_argument('--smoke', action='store_true', help='Nur Verbindungen und Startseiten prüfen; keine Wettbewerbsrunde spielen.')
    parser.add_argument('--flows-only', action='store_true', help='Nur die vollständigen lokalen Trainings- und Wettbewerbsabläufe prüfen.')
    args = parser.parse_args()
    base = args.url.rstrip('/')
    if not args.smoke and not base.startswith(('http://127.0.0.1:', 'http://localhost:')):
        parser.error('Vollständige Testläufe verwenden ausschließlich einen lokalen Worker. Für Onlineprüfungen --smoke wählen.')
    output = ROOT / '.local/seki-quiz/screenshots'
    output.mkdir(parents=True, exist_ok=True)
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        context = browser.new_context(viewport={'width': 768, 'height': 1024}, reduced_motion='reduce')
        page = context.new_page()
        page.set_default_timeout(15000)
        page.on('pageerror', lambda error: errors.append(str(error)))
        kinds = set()
        for item in ([] if args.flows_only else QUIZZES):
            url = base + '/' + item['url']
            page.goto(url, wait_until='networkidle')
            expect(page.locator('#contestStart')).to_be_enabled()
            expect(page.locator('#workerStatus')).to_have_text('Cloudflare verbunden')
            for width in [320, 768]:
                page.set_viewport_size({'width': width, 'height': 1024})
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (item['quizId'], width, 'home')
            page.set_viewport_size({'width': 768, 'height': 1024})
            if item['klasse'] == 5:
                page.screenshot(path=str(output / (item['quizId'] + '-start.png')), full_page=True)
            if args.smoke:
                page.goto(base + '/' + item['rangliste'], wait_until='networkidle')
                expect(page.locator('#status')).not_to_contain_text('nicht aktiviert')
                continue
            for level in ['einstieg', 'aufbau', 'challenge']:
                page.locator('#trainStart').click()
                page.locator(f'[data-level="{level}"]').click()
                expect(page.locator('#check')).to_be_visible()
                question = page.evaluate('state.currentQuestion')
                kinds.add(question['kind'])
                fill_answer(page, question)
                page.locator('#check').click()
                expect(page.locator('#feedback')).to_have_class(re.compile(r'good'))
                for width in [320, 768]:
                    page.set_viewport_size({'width': width, 'height': 1024})
                    if not page.evaluate('document.documentElement.scrollWidth <= innerWidth'):
                        page.screenshot(path=str(output / 'overflow.png'), full_page=True)
                        print(page.evaluate('Array.from(document.querySelectorAll("body *")).filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,id:e.id,cls:e.className,width:e.getBoundingClientRect().width})).slice(-12)'), flush=True)
                        raise AssertionError((item['quizId'], width, level))
                page.set_viewport_size({'width': 768, 'height': 1024})
                page.locator('#quit').click()
                expect(page.locator('#contestStart')).to_be_enabled()
        if not args.flows_only:
            print('PASS: 24 Quizverbindungen, getrennte Ranglisten, 320/768 Pixel' + ('' if args.smoke else ', 72 Trainingskombinationen: ' + ', '.join(sorted(kinds))), flush=True)
        if not args.smoke:
            item = QUIZZES[0]
            url = base + '/' + item['url']
            page.goto(url, wait_until='networkidle')
            page.locator('#trainStart').click()
            page.locator('[data-level="einstieg"]').click()
            for i in range(10):
                fill_answer(page, page.evaluate('state.currentQuestion'))
                page.locator('#check').click()
                expect(page.locator('#feedback')).to_have_class(re.compile(r'good'))
                page.locator('#next').click()
            expect(page.get_by_role('heading', name='Dein Ergebnis')).to_be_visible()
            page.locator('#resultRank').click()
            expect(page.locator('#localRanking')).to_contain_text('Lernprofil')
            page.goto(base + '/gemeinsam/quiz-seki/assets/lernstand.html', wait_until='networkidle')
            assert page.evaluate('document.querySelectorAll("tbody tr").length > 0')
            page.goto(url, wait_until='networkidle')
            page.evaluate('navigator.serviceWorker.ready')
            context.set_offline(True)
            page.reload(wait_until='domcontentloaded')
            page.locator('#trainStart').click()
            page.locator('[data-level="einstieg"]').click()
            fill_answer(page, page.evaluate('state.currentQuestion'))
            page.locator('#check').click()
            expect(page.locator('#feedback')).to_have_class(re.compile(r'good'))
            context.set_offline(False)
            page.goto(url, wait_until='networkidle')
            expect(page.locator('#contestStart')).to_be_enabled()
            page.locator('#contestStart').click()
            page.locator('input[name="name"]').fill('Lokale Browserprüfung')
            page.locator('#contestForm button[type="submit"]').click()
            expect(page.locator('#check')).to_be_visible()
            first = page.evaluate('state.currentQuestion')
            page.reload(wait_until='networkidle')
            expect(page.locator('#check')).to_be_visible()
            assert page.evaluate('state.currentQuestion.id') == first['id']
            assert page.evaluate('state.currentQuestion.expiresAt') == first['expiresAt']
            for i in range(12):
                expect(page.locator('#check')).to_be_visible()
                expect(page.locator('#check')).to_be_enabled()
                question = page.evaluate('state.currentQuestion')
                assert 'answer' not in question and 'correct' not in question
                fill_answer(page, question, training=False)
                page.locator('#check').click()
                expect(page.locator('#feedback')).to_have_class(re.compile(r'good'))
                page.locator('#next').click()
            expect(page.get_by_role('heading', name='Dein Ergebnis')).to_be_visible()
            assert page.evaluate('state.score') >= 1200
            page.screenshot(path=str(output / 'wettbewerb-ergebnis.png'), full_page=True)
            page.locator('#resultRank').click()
            expect(page.locator('#ranking')).to_contain_text('Lokale Browserprüfung')
            print('PASS: Trainingsrunde, lokale Rangliste, Lernstand, Offline-Training, Wettbewerbsrunde mit Wiederaufnahme und Cloud-Rangliste', flush=True)
        assert not errors, errors
        context.close()
        browser.close()


if __name__ == '__main__':
    main()
