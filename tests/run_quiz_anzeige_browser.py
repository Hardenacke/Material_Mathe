"""Prüft Navigation und Mathematik-Anzeige in allen 39 Quizzen ohne Wettbewerbsdaten zu schreiben."""
import argparse
import json
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
AUDIT = r'''()=>{
  const errors=[], samples=[];
  function strings(value){if(typeof value==='string')return[value];if(value&&typeof value==='object')return Object.values(value).flatMap(strings);return[]}
  for(const level of ['einstieg','aufbau','challenge'])for(let slot=0;slot<5;slot++)for(const extension of [false,true])for(let n=0;n<4;n++){
    const q=question(QUIZ.fieldId,QUIZ.grade,level,slot,slot,extension),before=JSON.stringify(q);
    for(const raw of strings(q)){
      const display=MatheQuizAnzeige.mathText(raw);
      for(const match of display.matchAll(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g)){
        try{katex.renderToString(match[1]??match[2],{throwOnError:true,trust:false,strict:'error'})}
        catch(error){errors.push({type:'math',raw,error:String(error)})}
      }
      const prose=display.replace(/\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/g,'');
      if(/\\(?:sqrt|frac|cdot|sin|cos|pi|int|leq|vec)\b/.test(prose))errors.push({type:'unwrapped',raw});
    }
    for(const options of [q.options,...(q.pairs||[]).map(p=>p.options)].filter(Boolean)){
      const shown=options.map(value=>MatheQuizAnzeige.mathText(value));
      if(new Set(shown).size!==shown.length)errors.push({type:'duplicates',prompt:q.prompt,options});
    }
    if(JSON.stringify(q)!==before)errors.push({type:'modified-task'});
    if(!samples.some(s=>s.kind===q.kind))samples.push(q);
  }
  return {errors,samples};
}'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--engine', choices=['chromium', 'webkit'], default='chromium')
    parser.add_argument('--online', action='store_true', help='Nur Training und Ranglistenseiten der veröffentlichten Quizze lesen.')
    parser.add_argument('--quiz', help='Eine bestimmte Quizkennung gezielt prüfen.')
    args = parser.parse_args()
    output = ROOT / '.local/quiz-anzeige'
    output.mkdir(parents=True, exist_ok=True)
    errors = []
    count = 0
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True) if args.engine == 'chromium' else p.webkit.launch(headless=True)
        context = browser.new_context(**p.devices['iPad (gen 7)'], reduced_motion='reduce')
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_default_timeout(15000)
        try:
            for stage, port in [('seki', 8788), ('sekii', 8789)]:
                base = f'https://mathematik-{stage}-quiz.physik-wettkampf-api.workers.dev' if args.online else f'http://127.0.0.1:{port}'
                quizzes = json.loads((ROOT / f'dokumentation/QUIZ_{stage.upper()}_ZUORDNUNG.json').read_text(encoding='utf-8'))['quizze']
                if args.quiz:
                    quizzes = [quiz for quiz in quizzes if quiz['quizId'] == args.quiz]
                for quiz in quizzes:
                    page.goto(base + '/' + quiz['url'], wait_until='networkidle')
                    expect(page.locator('#contestStart')).to_be_enabled()
                    assert page.locator('footer a').count() == 0
                    assert 'Cloudflare' not in page.locator('body').inner_text()
                    for width, height in [(320, 900), (768, 1024), (1024, 768)]:
                        page.set_viewport_size({'width': width, 'height': height})
                        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), (quiz['quizId'], width, 'home')
                        assert page.locator('#rankOpen').bounding_box()['height'] >= 54
                        assert page.locator('#rankBtn').bounding_box()['height'] >= 48
                    if quiz == quizzes[0]:
                        page.screenshot(path=str(output / f'{args.engine}-{stage}-home.png'), full_page=True)
                    page.locator('#rankOpen').tap()
                    expect(page.locator('.ranking').first).to_be_attached()
                    assert 'Cloudflare' not in page.locator('body').inner_text()
                    page.locator('a[href="index.html"]').first.tap()
                    expect(page.locator('#trainStart')).to_be_visible()
                    audit = page.evaluate(AUDIT)
                    assert not audit['errors'], (quiz['quizId'], audit['errors'][:5])
                    page.evaluate("state.mode='training';state.level='aufbau';state.roundFocusLabel='Übung'")
                    for question in audit['samples']:
                        page.evaluate('q=>showQuestion(q)', question)
                        assert page.locator('.katex-error').count() == 0
                        for option in page.locator('#answerArea option').all_text_contents():
                            assert '\\' not in option, (quiz['quizId'], option)
                        if question['kind'] == 'match':
                            for index in range(len(question['pairs'])):
                                page.locator(f'[data-match="{index}"]').select_option('0')
                                expect(page.locator('.match-preview').nth(index)).to_contain_text('Deine Auswahl:')
                                assert page.evaluate('(i)=>state.match[i]', index) == '0'
                        for width, height in [(320, 900), (768, 1024), (1024, 768)]:
                            page.set_viewport_size({'width': width, 'height': height})
                            page.evaluate('applyTextScale(1.3,false)')
                            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), (quiz['quizId'], width, question['prompt'])
                    count += 1
                    print(f'PASS {args.engine}: {quiz["quizId"]} – Rangliste, Textfelder und 120 Aufgabenvarianten', flush=True)
            assert not errors, errors
        except Exception:
            page.screenshot(path=str(output / f'{args.engine}-failure.png'), full_page=True)
            print(page.evaluate('''()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
              overflow:[...document.querySelectorAll('body *')].filter(n=>n.getBoundingClientRect().right>innerWidth+1)
              .map(n=>({tag:n.tagName,id:n.id,cls:String(n.className),right:n.getBoundingClientRect().right,width:n.getBoundingClientRect().width})).slice(-15),
              innerOverflow:[...document.querySelectorAll('body *')].filter(n=>n.clientWidth>0&&n.scrollWidth>n.clientWidth+1)
              .map(n=>({tag:n.tagName,cls:String(n.className),width:n.clientWidth,scroll:n.scrollWidth})).slice(-15)})'''), flush=True)
            raise
        finally:
            context.close()
            browser.close()
    print(f'PASS: {count} Quizze, {count*120} Varianten, Textanzeige ohne Änderung der Aufgabendaten.', flush=True)


if __name__ == '__main__':
    main()
