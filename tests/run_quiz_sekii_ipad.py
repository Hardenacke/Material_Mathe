"""Touch-, Scroll- und Tastaturprüfung der Sek-II-Raster in Chromium und WebKit.

Benötigt Playwright, Edge und `python -m playwright install webkit`.
Spielt ausschließlich Training; auch mit --url werden keine Ergebnisse übertragen.
"""
import argparse
import json
import re
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
QUIZZES = json.loads((ROOT / 'dokumentation/QUIZ_SEKII_ZUORDNUNG.json').read_text(encoding='utf-8'))['quizze']
CONSTRUCTIONS = [q for q in QUIZZES if q['phase'] in ['ef', 'q1'] and 'stochastik' not in q['quizId']]
OUTPUT = ROOT / '.local/sekii-quiz/ipad'


def open_construction(page, base, quiz):
    page.goto(base + '/' + quiz['url'], wait_until='networkidle')
    page.locator('#trainStart').tap()
    page.locator('#roundFocus').select_option('4')
    page.locator('[data-level="aufbau"]').tap()
    expect(page.locator('#grid')).to_be_visible()
    return page.evaluate('state.currentQuestion')


def screen_point(page, x, y):
    return page.evaluate('''([x,y])=>{
      const svg=document.querySelector('#grid'),p=svg.createSVGPoint();
      p.x=150+24*x;p.y=150-24*y;const a=p.matrixTransform(svg.getScreenCTM());return {x:a.x,y:a.y};
    }''', [x, y])


def tap_point(page, x, y):
    page.locator('#gridViewport').scroll_into_view_if_needed()
    # Bring the intended point into both the inner viewport and the page viewport.
    p = screen_point(page, x, y)
    page.evaluate('''p=>{const v=document.querySelector('#gridViewport'),r=v.getBoundingClientRect();
      v.scrollLeft+=p.x-(r.left+v.clientWidth/2);v.scrollTop+=p.y-(r.top+v.clientHeight/2);
    }''', p)
    p = screen_point(page, x, y)
    page.evaluate('p=>window.scrollBy(0,p.y-innerHeight/2)', p)
    page.evaluate('''()=>new Promise(resolve=>{
      let previous='',stable=0;const frame=()=>{const v=document.querySelector('#gridViewport'),
        next=[scrollY,v.scrollTop,v.scrollLeft,v.getBoundingClientRect().top].join(',');
        stable=previous===next?stable+1:0;previous=next;
        if(stable>=5)resolve();else requestAnimationFrame(frame);
      };requestAnimationFrame(frame);
    })''')
    p = screen_point(page, x, y)
    page.touchscreen.tap(p['x'], p['y'])
    assert page.evaluate('state.cursor') == {'x': x, 'y': y}, (x, y, page.evaluate('state.cursor'))
    box = page.locator('#addPoint').bounding_box()
    assert 0 <= box['y'] and box['y'] + box['height'] <= page.viewport_size['height'], ('point confirmation outside viewport', box)


def points(page):
    return page.evaluate('state.points')


def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), page.viewport_size


def verify_layout(page):
    sizes = page.locator('.construct-wrap button').evaluate_all('nodes=>nodes.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height}))')
    assert all(s['w'] >= 48 and s['h'] >= 48 for s in sizes), sizes
    assert page.locator('#coordX').evaluate('n=>parseFloat(getComputedStyle(n).fontSize)') >= 16
    assert page.locator('#grid').evaluate('n=>getComputedStyle(n).touchAction') == 'manipulation'
    assert page.locator('.katex-error').count() == 0
    no_overflow(page)


def verify_gestures(page, context, engine):
    tap_point(page, 2, 2)
    before = page.evaluate('state.cursor')
    p = screen_point(page, 0, 0)
    # A moved pointer, cancelled pointer and second contact must never select a point.
    page.evaluate('''p=>{
      const s=document.querySelector('#grid'),send=(type,id,x,y)=>s.dispatchEvent(new PointerEvent(type,
        {pointerId:id,pointerType:'touch',isPrimary:id===1,button:0,bubbles:true,clientX:x,clientY:y}));
      send('pointerdown',1,p.x,p.y);send('pointermove',1,p.x,p.y-80);send('pointerup',1,p.x,p.y-80);
      send('pointerdown',1,p.x,p.y);send('pointercancel',1,p.x,p.y);send('pointerup',1,p.x,p.y);
      send('pointerdown',1,p.x,p.y);send('pointerdown',2,p.x+20,p.y);
      send('pointerup',2,p.x+20,p.y);send('pointerup',1,p.x,p.y);
    }''', p)
    assert page.evaluate('state.cursor') == before and points(page) == []
    if engine == 'chromium':
        # Trusted native touch sequence verifies browser scrolling and pointercancel.
        session = context.new_cdp_session(page)
        start_scroll = page.evaluate('scrollY')
        page.evaluate("window.gridCancelled=false;document.querySelector('#grid').addEventListener('pointercancel',()=>window.gridCancelled=true,{once:true})")
        session.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [dict(p, id=1)]})
        for dy in [20, 45, 75, 110]:
            session.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': p['x'], 'y': p['y'] - dy, 'id': 1}]})
        session.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        page.wait_for_function('window.gridCancelled && scrollY !== '+str(start_scroll))
        assert page.evaluate('state.cursor') == before and points(page) == []
        session.detach()


def verify_editor(page, context, engine):
    verify_layout(page)
    verify_gestures(page, context, engine)
    tap_point(page, -4, 3)
    assert points(page) == []
    expect(page.locator('#coordX')).to_have_value('-4')
    expect(page.locator('#coordY')).to_have_value('3')
    page.locator('#addPoint').tap()
    assert points(page) == [[-4, 3]]
    assert page.evaluate('!["coordX","coordY"].includes(document.activeElement.id)')
    expect(page.locator('#addPoint')).to_be_disabled()  # No duplicate point.
    page.locator('[data-edit-point="0"]').tap()
    page.locator('[data-step-axis="x"][data-step="-1"]').tap()
    expect(page.locator('#coordX')).to_have_value('-5')
    page.locator('[data-step-axis="y"][data-step="-1"]').tap()
    expect(page.locator('#addPoint')).to_have_text('Änderung übernehmen')
    page.locator('#addPoint').tap()
    assert points(page) == [[-5, 2]]
    for x, y in [(-5, -5), (5, 5), (-5, 5), (5, -5), (0, 0)]:
        tap_point(page, x, y)
    assert points(page) == [[-5, 2]]
    page.locator('#addPoint').tap()
    assert points(page) == [[-5, 2], [0, 0]]
    tap_point(page, 1, 1)
    expect(page.locator('#addPoint')).to_be_disabled()  # Required point count is respected.
    page.locator('#undo').tap()
    assert points(page) == [[-5, 2]]
    page.locator('#clearPoints').tap()
    assert points(page) == []
    page.locator('#coordX').fill('-6')
    expect(page.locator('#addPoint')).to_be_disabled()
    page.locator('#coordX').fill('1.5')
    expect(page.locator('#addPoint')).to_be_disabled()
    page.locator('#coordX').fill('-3')
    page.locator('#coordX').press('Enter')
    expect(page.locator('#coordY')).to_be_focused()
    page.locator('#coordY').fill('2')
    page.locator('#coordY').press('Enter')
    assert points(page) == [[-3, 2]]
    page.locator('#clearPoints').tap()
    page.locator('#grid').focus()
    page.keyboard.press('ArrowLeft')
    page.keyboard.press('ArrowDown')
    page.keyboard.press('Enter')
    assert points(page) == [[-1, -1]]
    page.locator('#gridZoom').tap()
    expect(page.locator('#gridZoom')).to_have_attribute('aria-pressed', 'true')
    if engine == 'chromium':
        page.locator('#gridViewport').scroll_into_view_if_needed()
        page.evaluate("document.querySelector('#gridViewport').scrollLeft=0")
        p = screen_point(page, 0, 0)
        page.evaluate('p=>window.scrollBy(0,p.y-innerHeight/2)', p)
        p = screen_point(page, 0, 0)
        session = context.new_cdp_session(page)
        session.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [dict(p, id=1)]})
        for dx in [20, 45, 75, 110]:
            session.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': p['x'] - dx, 'y': p['y'], 'id': 1}]})
        session.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        page.wait_for_function("document.querySelector('#gridViewport').scrollLeft>0")
        assert points(page) == [[-1, -1]]
        session.detach()
    for width, height in [(1024, 768), (820, 1180), (1180, 820), (480, 1024), (320, 900), (768, 1024)]:
        page.set_viewport_size({'width': width, 'height': height})
        page.evaluate('applyTextScale(1.3,false)')
        verify_layout(page)
        tap_point(page, -3, 4)
        assert points(page) == [[-1, -1]]
        page.locator('#gridZoom').tap()
        tap_point(page, 4, -3)
        no_overflow(page)
        page.locator('#gridZoom').tap()
    page.screenshot(path=str(OUTPUT / (engine + '-portrait.png')), full_page=True)
    page.locator('#clearPoints').tap()


def verify_offline(page, context, engine):
    page.locator('#quit').tap()
    page.evaluate('navigator.serviceWorker.ready')
    page.wait_for_function("navigator.serviceWorker.controller?.scriptURL===new URL('sw.js',location.href).href")
    if engine == 'webkit':
        # Playwright WebKit 2359 rejects even literal SW responses with set_offline.
        # https://github.com/microsoft/playwright/issues/42775
        assert page.evaluate('''async()=>{
          const cache=await caches.open('mathe-quest-sekii-v1:'+(await navigator.serviceWorker.ready).scope);
          return (await Promise.all(['./','../../../../gemeinsam/quiz-sekii/assets/koordinatensystem.js',
            '../../../../gemeinsam/quiz-sekii/assets/quiz-layout.css'].map(path=>cache.match(new URL(path,location.href))))).every(Boolean);
        }''')
        print('PASS webkit: Offline-Ressourcen vorhanden; Offline-Emulation wegen Playwright #42775 ausgelassen.', flush=True)
        return
    context.set_offline(True)
    try:
        page.reload(wait_until='domcontentloaded')
        page.locator('#trainStart').tap()
        page.locator('#roundFocus').select_option('4')
        page.locator('[data-level="aufbau"]').tap()
        targets = page.evaluate('state.currentQuestion.points')
        for target in targets:
            tap_point(page, *target)
            page.locator('#addPoint').tap()
        page.locator('#check').tap()
        expect(page.locator('#feedback')).to_have_class(re.compile('good'))
    finally:
        context.set_offline(False)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='http://127.0.0.1:8789')
    parser.add_argument('--engine', choices=['chromium', 'webkit', 'both'], default='both')
    args = parser.parse_args()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    errors = []
    with sync_playwright() as p:
        for engine in (['chromium', 'webkit'] if args.engine == 'both' else [args.engine]):
            browser = p.chromium.launch(channel='msedge', headless=True) if engine == 'chromium' else p.webkit.launch(headless=True)
            context = browser.new_context(**p.devices['iPad (gen 7)'], reduced_motion='reduce')
            page = context.new_page()
            page.set_default_timeout(15000)
            page.on('pageerror', lambda error: errors.append(str(error)))
            try:
                for index, quiz in enumerate(CONSTRUCTIONS):
                    question = open_construction(page, args.url.rstrip('/'), quiz)
                    if index == 0:
                        verify_editor(page, context, engine)
                    for target in question['points']:
                        tap_point(page, *target)
                        page.locator('#addPoint').tap()
                    assert points(page) == question['points']
                    page.locator('#check').tap()
                    expect(page.locator('#feedback')).to_have_class(re.compile('good'))
                    expect(page.locator('#coordX')).to_be_disabled()
                    expect(page.locator('[data-edit-point="0"]')).to_be_disabled()
                    expect(page.locator('#gridZoom')).to_be_enabled()
                    saved = points(page)
                    pnt = screen_point(page, 0, 0)
                    page.dispatch_event('#grid', 'pointerup', dict(pnt, pointerId=1, pointerType='touch', isPrimary=True))
                    assert points(page) == saved
                    verify_layout(page)
                    print(f'PASS {engine}: {quiz["quizId"]} – Touch, Punktübernahme und Bewertung', flush=True)
                verify_offline(page, context, engine)
                assert not errors, errors
            except Exception:
                page.screenshot(path=str(OUTPUT / (engine + '-failure.png')), full_page=True)
                raise
            finally:
                context.close()
                browser.close()
    print('PASS: iPad-Hoch-/Querformat, Vergrößerung, Randpunkte, Korrekturen, negative Koordinaten, Gesten und Tastatur.', flush=True)


if __name__ == '__main__':
    main()
