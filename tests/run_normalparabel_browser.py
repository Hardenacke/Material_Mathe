"""Prüft selbst gebaute Terme, einzelne Rechnungen und beide Parabel-Modi."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
from threading import Thread

ROOT = Path(__file__).resolve().parents[1]
LESSON = Path('klasse-9/02-funktionen/01-quadratische-funktionen/lernpfad-quadratische-funktionen/02_Normalparabel_Entdecken.html')
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', str(ROOT / '.local/playwright-browsers'))
from playwright.sync_api import expect, sync_playwright


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def build_term(page, selector, tokens):
    builder = page.locator(selector)
    if builder.locator('.term-piece').count():
        builder.locator('[data-term-clear]').click()
    for token in tokens:
        builder.locator(f'.term-tile[data-token="{token}"]').click()
    builder.locator('[data-term-check]').click()
    return builder.locator('[data-term-feedback]')


def fill_workshop(page, selector, a, xs, samples):
    workshop = page.locator(selector)
    expect(workshop.locator('.table-answer')).to_have_count(len(xs))
    for x in xs:
        field = workshop.locator(f'.table-answer[data-x="{x}"]')
        expect(field).to_have_value('')
        field.fill(str(a * x * x))
        workshop.locator(f'[data-check-x="{x}"]').click()
        expect(field).to_have_class('number-input table-answer valid')
    for x in samples:
        card = workshop.locator(f'[data-sample-x="{x}"]')
        # Ein korrektes Endergebnis allein ersetzt keinen Rechenweg.
        card.locator('[data-part="result"]').fill(str(a * x * x))
        card.locator('[data-sample-check]').click()
        expect(card.locator('.value-status')).to_contain_text('allein genügt')
        for name, value in [('left', x), ('right', x), ('result', a * x * x)]:
            card.locator(f'[data-part="{name}"]').fill(str(value))
        if a != 1:
            card.locator('[data-part="factor"]').fill(str(a))
        card.locator('[data-sample-check]').click()
        expect(card.locator('.value-status')).to_contain_text('Einsetzen und Ergebnis stimmen')


def graph_click(page, selector, x, y, advanced=False):
    button = page.locator(selector)
    box = button.bounding_box()
    assert box
    gx = 44 + ((x + 3) / 6 if advanced else (x + 4) / 8) * 614
    gy = 18 + (10 - y) / 20 * 336 if advanced else 354 - y / 16 * 336
    button.click(position={'x': gx / 680 * box['width'], 'y': gy / 390 * box['height']})


def check_layout(page, output, label):
    for width in [320, 390, 768, 1024]:
        page.set_viewport_size({'width': width, 'height': 1024})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (label, width, page.evaluate('''[...document.querySelectorAll('body *')].map(el=>({tag:el.tagName,id:el.id,cls:el.className?.baseVal??el.className,right:Math.round(el.getBoundingClientRect().right)})).filter(el=>el.right>innerWidth+1).slice(0,12)'''))
    page.set_viewport_size({'width': 768, 'height': 1024})
    page.screenshot(path=str(output / f'{label}-ipad.png'), full_page=True)


def run(page, url, output):
    page.goto(url)
    page.locator('#machineOptions [data-val="same"]').click()
    page.locator('#machineCheck').click()
    page.locator('#nextButton').click()
    expect(page.locator('#baseValueWorkshop .table-answer').first).to_be_disabled()
    expect(build_term(page, '#baseTermBuilder', ['2', '*', 'x'])).to_contain_text('noch nicht')
    expect(page.locator('#baseValueWorkshop .table-answer').first).to_be_disabled()
    expect(build_term(page, '#baseTermBuilder', ['(', 'x'])).to_contain_text('nicht vollständig')
    expect(build_term(page, '#baseTermBuilder', ['x', '*', 'x'])).to_contain_text('passt')
    page.locator('#tableCheck').click()
    expect(page.locator('#nextButton')).to_be_disabled()
    fill_workshop(page, '#baseValueWorkshop', 1, range(-3, 4), [-3, 2])
    # Eine falsche Einsetzung bleibt auch bei richtigem Endergebnis falsch.
    sample = page.locator('#baseValueWorkshop [data-sample-x="-3"]')
    sample.locator('[data-part="left"]').fill('3')
    sample.locator('[data-sample-check]').click()
    expect(sample.locator('.value-status')).to_contain_text('Vorzeichen')
    sample.locator('[data-part="left"]').fill('-3')
    sample.locator('[data-sample-check]').click()
    page.locator('#signParen').fill('9')
    page.locator('#signUnparen').fill('-9')
    page.locator('#tableCheck').click()
    expect(page.locator('#nextButton')).to_be_enabled()
    # Jede Änderung öffnet die Prüfung wieder; gleiche Terme werden anerkannt.
    page.locator('#baseValueWorkshop .table-answer[data-x="0"]').fill('1')
    expect(page.locator('#nextButton')).to_be_disabled()
    page.locator('#baseValueWorkshop .table-answer[data-x="0"]').fill('0')
    page.locator('#baseValueWorkshop [data-check-x="0"]').click()
    expect(build_term(page, '#baseTermBuilder', ['x', '^2'])).to_contain_text('passt')
    page.locator('#tableCheck').click()
    page.reload()
    expect(page.locator('#nextButton')).to_be_enabled()
    expect(page.locator('#baseValueWorkshop .value-status.good')).to_have_count(9)
    check_layout(page, output, 'termbaukasten')
    page.locator('#nextButton').click()
    expect(page.locator('#graphClick')).to_be_disabled()
    for n, x in enumerate(range(-3, 4)):
        expect(page.locator('#plotY')).to_have_value('')
        expect(page.locator('#plotSelectHeight')).to_be_disabled()
        if n == 0:
            page.locator('#plotY').fill('7')
            page.locator('#plotValueCheck').click()
            expect(page.locator('#graphClick')).to_be_disabled()
        page.locator('#plotY').fill(str(x * x))
        page.locator('#plotValueCheck').click()
        if n == 0:
            graph_click(page, '#graphClick', x, x * x - 1)
            page.locator('#plotCheck').click()
            expect(page.locator('#fb2')).to_contain_text('genau auf diese Höhe')
            graph_click(page, '#graphClick', x, x * x)
        else:
            page.locator('#plotSelectHeight').click()
        page.locator('#plotCheck').click()
    expect(page.locator('#nextButton')).to_be_enabled()
    check_layout(page, output, 'graphenwerkstatt')
    page.locator('#nextButton').click()
    page.locator('#symOptions [data-val="vertical"]').click()
    page.locator('#vertexOptions [data-val="b"]').click()
    page.locator('#propertyCheck').click()
    page.locator('#nextButton').click()
    page.locator('#transferValue').fill('6,25')
    page.locator('#rootA').fill('-3')
    page.locator('#rootB').fill('3')
    page.locator('#transferOptions [data-val="equal"]').click()
    page.locator('#transferCheck').click()
    page.locator('#nextButton').click()
    expect(page.locator('#h5')).to_be_visible()

    page.locator('#modeAdvanced').click()
    page.locator('#advancedPassword').fill('normale parabel')
    page.locator('#advancedUnlockForm button').click()
    for i, a, tokens in [(0, 2, ['2', 'x', '^2']), (1, -1, ['-', 'x', '^2'])]:
        expect(page.locator(f'#advHeight{i}')).to_be_disabled()
        expect(build_term(page, f'#advTermBuilder{i}', tokens)).to_contain_text('passt')
        fill_workshop(page, f'#advValueWorkshop{i}', a, range(-2, 3), [-2, 2])
        expect(page.locator(f'#advHeight{i}')).to_be_enabled()
        check_layout(page, output, f'vorfaktor-{i}')
        for n, x in enumerate(range(-2, 3)):
            expect(page.locator(f'#advHeight{i}')).to_have_value('')
            expect(page.locator(f'#advKeyboardSet{i}')).to_be_disabled()
            page.locator(f'#advHeight{i}').fill(str(a * x * x))
            page.locator(f'#advHeightSet{i}').click()
            if n == 0:
                graph_click(page, f'#advGraphClick{i}', x, a * x * x, advanced=True)
            else:
                page.locator(f'#advKeyboardSet{i}').click()
            page.locator(f'#advCheck{i}').click()
        expect(page.locator('#advNext')).to_be_disabled()
        if i == 0:
            drawing = page.locator('#advDrawing0')
            drawing.scroll_into_view_if_needed()
            box = drawing.bounding_box()
            points = []
            for n in range(61):
                x = -2 + n / 15
                points.append((box['x'] + (44 + (x + 3) / 6 * 614) / 680 * box['width'],
                               box['y'] + (18 + (10 - a * x * x) / 20 * 336) / 390 * box['height']))
            page.mouse.move(*points[0])
            page.mouse.down()
            for point in points[1:]:
                page.mouse.move(*point)
            page.mouse.up()
            page.locator('#advCompare0').click()
        else:
            page.get_by_role('button', name='Auf Papier gezeichnet', exact=True).last.click()
            selfcheck = page.locator('[data-adv-step="1"] .paper-selfcheck')
            expect(selfcheck.locator('button')).to_be_disabled()
            for checkbox in selfcheck.locator('input').all():
                checkbox.check()
            selfcheck.locator('button').click()
        expect(page.locator('#advNext')).to_be_enabled()
        page.locator('#advNext').click()
    # GeoGebra bleibt optional; die lokale Grafik und der weitere Lernweg funktionieren offline.
    expect(page.locator('#geogebraOffline')).to_be_visible()
    page.locator('#advPredictDown [data-val="down"]').click()
    page.locator('#advPredictWidth [data-val="wide"]').click()
    page.locator('#advPredictionSave').click()
    for a in [2, 0.5, -1, 0]:
        page.locator('#advASlider').evaluate('(el,v)=>{el.value=v;el.dispatchEvent(new Event("input"));}', a)
    page.locator('#advExplanation').fill('Bei negativem Vorfaktor öffnet sich die Parabel nach unten. Der Betrag bestimmt die Breite.')
    page.locator('#advExploreDone').click()
    page.locator('#advNext').click()
    for i, value in enumerate(['down', 'narrow', 'wide', 'line', 'narrow']):
        page.locator(f'#advQA{i} [data-val="{value}"]').click()
    page.locator('#advParameterInput').fill('1,5')
    page.locator('#advAnswersCheck').click()
    page.locator('#advNext').click()
    expect(page.locator('#a4')).to_be_visible()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--engine', choices=['edge', 'webkit'], default='edge')
    parser.add_argument('--source', action='store_true')
    args = parser.parse_args()
    directory = ROOT if args.source else ROOT / '_site'
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(directory)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}/'
    output = ROOT / '.local/normalparabel-tests' / args.engine
    output.mkdir(parents=True, exist_ok=True)
    errors, remote = [], []
    try:
        with sync_playwright() as p:
            browser = p.webkit.launch(headless=True) if args.engine == 'webkit' else p.chromium.launch(channel='msedge', headless=True)
            context = browser.new_context(viewport={'width': 1024, 'height': 1366}, reduced_motion='reduce')
            def route_request(route):
                if route.request.url.startswith(('http:', 'https:')) and not route.request.url.startswith(base):
                    remote.append(route.request.url)
                    route.abort()
                else:
                    route.continue_()
            context.route('**/*', route_request)
            page = context.new_page()
            page.set_default_timeout(10000)
            page.on('pageerror', lambda error: errors.append(str(error)))
            try:
                run(page, base + LESSON.as_posix(), output)
            except Exception:
                print(json.dumps({'javascript_errors': errors, 'url': page.url}, ensure_ascii=False))
                page.screenshot(path=str(output / 'failure.png'), full_page=True)
                raise
            assert not errors, errors
            assert page.locator('[data-tex]').evaluate_all("nodes => nodes.every(node => node.textContent !== 'Darstellungsfehler')")
            assert all(url == 'https://www.geogebra.org/apps/deployggb.js' for url in remote), remote
            # Auch der direkte Aufruf als einzelne HTML-Datei braucht keine lokalen Assets.
            offline = browser.new_page()
            offline.on('pageerror', lambda error: errors.append(str(error)))
            offline.goto((ROOT / LESSON).as_uri())
            expect(offline.locator('#h0')).to_be_visible()
            expect(offline.locator('.term-tile')).to_have_count(33)
            assert not errors, errors
            assert page.locator('.katex-error').count() == 0
            browser.close()
        print(json.dumps({'result': 'PASS', 'engine': args.engine, 'base_values': 7, 'advanced_values': 10,
                          'sample_calculations': 6, 'graph_calculations': 17, 'viewports': [320, 390, 768, 1024],
                          'javascript_errors': errors, 'optional_remote_requests': remote}, ensure_ascii=False))
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
