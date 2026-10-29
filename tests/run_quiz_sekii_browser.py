"""Prüft alle 15 Sek-II-Quizoberflächen gegen den lokalen Cloudflare-Worker."""
import argparse
import json
import math
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
QUIZZES = json.loads((ROOT / 'dokumentation/QUIZ_SEKII_ZUORDNUNG.json').read_text(encoding='utf-8'))['quizze']


from run_quiz_seki_browser import fill_answer as fill_training_answer


def fill_answer(page, question, training=True):
    if question['kind'] == 'vector':
        vectors = [list(map(int, values)) for values in re.findall(r'\((-?\d+)\|(-?\d+)\|(-?\d+)\)', question['prompt'])]
        expected = question['answer'] if training else [sum(pair) for pair in zip(*vectors)]
        for i, value in enumerate(expected):
            page.locator('#vector' + str(i)).fill(str(value).replace('.', ','))
        return
    if training:
        return fill_training_answer(page, question)
    # Solve the local competition from its public values; no server answer keys are read.
    question = dict(question)
    kind = question['kind']
    geometry = page.evaluate('QUIZ.fieldId') == 'geometrie'
    extrema = page.evaluate('QUIZ.id') == 'q1-analysis-lk'
    def derivative_at(source, value):
        assert re.fullmatch(r'[x\d+\-().^]+', source)
        expr = re.sub(r'(\d)(x|\()', r'\1*\2', source.replace('^', '**')).replace(')(', ')*(')
        def f(x): return eval(expr, {'__builtins__': {}}, {'x': x})
        h = 0.00001
        return (f(value + h) - f(value - h)) / (2 * h)
    if kind == 'number':
        if extrema:
            scale, offset, power, decay = map(int, re.search(r'f\(x\)=(\d+)\(x([+-]\d+)\)\^\{(\d+)\}e\^\{-(\d+)', question['prompt']).groups())
            question['answer'] = -offset + power / decay
        else:
            source = re.search(r'f\(x\)=(.*?)\\\)', question['prompt'])[1]
            x = int(re.search(r"f'\((-?\d+)\)", question['prompt'])[1])
            question['answer'] = derivative_at(source, x)
    elif kind == 'choice':
        needle = 'Produkt- und Kettenregel' if extrema else 'skalares' if geometry else 'steigt'
        question['correct'] = next(i for i, option in enumerate(question['options']) if needle in option)
    elif kind == 'slider':
        if extrema:
            scale, offset, power, decay = map(int, re.search(r'f\(x\)=(\d+)\(x([+-]\d+)\)\^\{(\d+)\}e\^\{-(\d+)', question['prompt']).groups())
            question['answer'] = -offset + power / decay
        elif geometry:
            p, d, target = [list(map(int, values)) for values in re.findall(r'\((-?\d+)\|(-?\d+)\|(-?\d+)\)', question['prompt'])]
            question['answer'] = (target[0] - p[0]) / d[0]
        else:
            source = re.search(r'f\(x\)=(.*?)\\\)', question['prompt'])[1]
            x = int(re.search(r'bei \\\(x=(-?\d+)', question['prompt'])[1])
            question['answer'] = round(derivative_at(source, x), 5)
    elif kind == 'order':
        question['items'] = (['Parameter zunächst festhalten', 'Nach der Variablen x ableiten', 'Kritische Stellen in Abhängigkeit vom Parameter bestimmen', 'Lage und Art der Extrempunkte deuten'] if extrema else
                            ['Geradengleichungen gleichsetzen', 'Koordinatengleichungen aufstellen', 'Gleichungssystem lösen', 'Lösung prüfen']
                             if geometry else ['Ableitungsfunktion bilden', 'Kritische Stellen bestimmen', 'Vorzeichen von f′ prüfen', 'Monotonie beschreiben'])
    elif kind == 'construct':
        if extrema:
            scale, offset, height = map(int, re.search(r'f\(x\)=(\d+)\(\(x([+-]\d+)\)\^3-3\(x[+-]\d+\)\)([+-]\d+)', question['prompt']).groups())
            question['points'] = [[-offset - 1, height + 2 * scale], [-offset + 1, height - 2 * scale]]
        elif geometry:
            point = list(map(int, re.search(r'\((-?\d+)\|(-?\d+)\|(-?\d+)\)', question['prompt']).groups()))
            question['points'] = [point[:2]]
        else:
            a, b = map(int, re.search(r'\(x-(\d+)\)\(x\+(\d+)\)', question['prompt']).groups())
            question['points'] = [[a, 0], [-b, 0]]
    else:
        raise AssertionError(kind)
    fill_training_answer(page, question)


def verify_overview(page, base):
    page.goto(base + '/', wait_until='networkidle')
    expect(page.locator('.quiz-card')).to_have_count(15)
    for width in [320, 768, 1024]:
        page.set_viewport_size({'width': width, 'height': 1024})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), ('overview', width)
    for phase, course, count in [('q1', 'gk', 3), ('q1', 'lk', 3), ('q2', 'gk', 3), ('q2', 'lk', 3), ('ef', 'common', 3)]:
        page.locator('#phase').select_option(phase)
        page.locator('#course').select_option(course)
        expect(page.locator('.quiz-card:visible')).to_have_count(count)
    page.locator('#field').select_option('analysis')
    expect(page.locator('.quiz-card:visible')).to_have_count(1)
    page.set_viewport_size({'width': 768, 'height': 1024})


def verify_cas_hint(page):
    question = page.evaluate('state.currentQuestion')
    guidance = question['casGuidance']
    expect(page.locator('#casGuidance')).to_be_visible()
    expect(page.locator('#casGuidanceTitle')).to_have_text(guidance['title'])
    expect(page.locator('#casGuidanceText')).to_have_text(guidance['text'])
    assert guidance['mode'] in ['recommended', 'check', 'not-needed']
    return question


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='http://127.0.0.1:8789')
    parser.add_argument('--smoke', action='store_true', help='Verbindungen, CAS-Anzeige und Ranglisten prüfen; keine Wettbewerbsrunde spielen.')
    parser.add_argument('--flows-only', action='store_true', help='Nur die vollständigen lokalen Trainings- und Wettbewerbsabläufe prüfen.')
    parser.add_argument('--geometry-flow', action='store_true', help='Die lokale Wettbewerbsrunde mit EF-Vektoren und Geometrie spielen.')
    parser.add_argument('--extrema-flow', action='store_true', help='Den lokalen Fünf-Minuten-Wettbewerb für Extremwertaufgaben prüfen.')
    args = parser.parse_args()
    base = args.url.rstrip('/')
    if not args.smoke and not base.startswith(('http://127.0.0.1:', 'http://localhost:')):
        parser.error('Vollständige Testläufe verwenden ausschließlich einen lokalen Worker. Für Onlineprüfungen --smoke wählen.')
    output = ROOT / '.local/sekii-quiz/screenshots'
    output.mkdir(parents=True, exist_ok=True)
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        context = browser.new_context(viewport={'width': 768, 'height': 1024}, reduced_motion='reduce')
        page = context.new_page()
        page.set_default_timeout(15000)
        page.on('pageerror', lambda error: errors.append(str(error)))
        kinds = set()
        verify_overview(page, base)
        for item in ([] if args.flows_only else QUIZZES):
            url = base + '/' + item['url']
            page.goto(url, wait_until='networkidle')
            expect(page.locator('#contestStart')).to_be_enabled()
            assert page.evaluate('state.apiOnline') is True
            assert 'Cloudflare' not in page.locator('body').inner_text()
            for width in [320, 768]:
                page.set_viewport_size({'width': width, 'height': 1024})
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (item['quizId'], width, 'home')
            page.set_viewport_size({'width': 768, 'height': 1024})
            if item['phase'] == 'ef':
                page.screenshot(path=str(output / (item['quizId'] + '-start.png')), full_page=True)
            if args.smoke:
                page.locator('#trainStart').click()
                page.locator('[data-level="aufbau"]').click()
                verify_cas_hint(page)
                page.goto(base + '/' + item['rangliste'], wait_until='networkidle')
                expect(page.locator('#cloudStatus')).not_to_contain_text('nicht aktiviert')
                expect(page.locator('#scoreVersion')).to_have_value('sek2-v2')
                with page.expect_response(lambda response: '/api/v1/leaderboard?' in response.url and 'scoreVersion=sek2-v1' in response.url) as old_ranking:
                    page.locator('#scoreVersion').select_option('sek2-v1')
                assert old_ranking.value.status == 200
                assert old_ranking.value.json()['scoreVersion'] == 'sek2-v1'
                expect(page.locator('#cloudStatus')).not_to_contain_text('kann gerade nicht')
                continue
            variants = page.evaluate("new Set(Array.from({length:12},()=>buildQuestion(QUIZ.fieldId,QUIZ.phase,QUIZ.course,'aufbau',0,0,false).prompt)).size")
            assert variants >= 3, item['quizId']
            for level in ['einstieg', 'aufbau', 'challenge']:
                page.locator('#trainStart').click()
                page.locator(f'[data-level="{level}"]').click()
                expect(page.locator('#check')).to_be_visible()
                question = verify_cas_hint(page)
                assert page.locator('.katex-error').count() == 0, question['prompt']
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
            print('PASS: 15 Sek-II-Quizverbindungen, getrennte Ranglisten, 320/768 Pixel' + ('' if args.smoke else ', 45 Trainingskombinationen: ' + ', '.join(sorted(kinds))), flush=True)
        if not args.smoke:
            item = next(item for item in QUIZZES if item['quizId'] == ('q1-analysis-lk' if args.extrema_flow else 'ef-geometrie' if args.geometry_flow else 'ef-analysis'))
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
            expect(page.locator('#localList')).to_contain_text('Lernprofil')
            page.goto(base + '/gemeinsam/quiz-sekii/assets/lernstand.html', wait_until='networkidle')
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
            first = verify_cas_hint(page)
            assert first['timeLimitSeconds'] == (300 if args.extrema_flow else 120)
            expect(page.locator('#taskBudget')).to_have_text('Zeit: 5 Min.' if args.extrema_flow else 'Zeit: 2 Min.')
            if args.extrema_flow:
                expect(page.locator('#casGuidanceTitle')).to_have_text('CAS sinnvoll')
            page.reload(wait_until='networkidle')
            expect(page.locator('#check')).to_be_visible()
            assert page.evaluate('state.currentQuestion.id') == first['id']
            assert page.evaluate('state.currentQuestion.expiresAt') == first['expiresAt']
            for i in range(12):
                expect(page.locator('#check')).to_be_visible()
                expect(page.locator('#check')).to_be_enabled()
                question = verify_cas_hint(page)
                assert page.locator('.katex-error').count() == 0, question['prompt']
                assert 'answer' not in question and 'correct' not in question
                fill_answer(page, question, training=False)
                page.locator('#check').click()
                expect(page.locator('#feedback')).to_have_class(re.compile(r'good'))
                page.locator('#next').click()
            expect(page.get_by_role('heading', name='Dein Ergebnis')).to_be_visible()
            assert page.evaluate('state.score') >= 1200
            page.screenshot(path=str(output / 'wettbewerb-ergebnis.png'), full_page=True)
            page.locator('#resultRank').click()
            expect(page.locator('#cloudList')).to_contain_text('Lokale Browserprüfung')
            print('PASS: Trainingsrunde, lokale Rangliste, Lernstand, Offline-Training, Wettbewerbsrunde mit Wiederaufnahme und Cloud-Rangliste', flush=True)
        assert not errors, errors
        context.close()
        browser.close()


if __name__ == '__main__':
    main()
