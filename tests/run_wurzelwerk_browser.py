"""Prüft die Quizansichten; Wettbewerbsdurchläufe verwenden ein eigenes Test-Browserprofil."""
import argparse,json,math,re,threading
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright,expect

ROOT=Path(__file__).resolve().parents[1]
QUIZ='klasse-9/01-arithmetik-algebra/01-reelle-zahlen-und-wurzeln/quiz/wurzelwerk/'

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--url');parser.add_argument('--timeout-test',action='store_true');args=parser.parse_args()
    output=ROOT/'.local/wurzelwerk-ui';output.mkdir(parents=True,exist_ok=True)
    class Handler(SimpleHTTPRequestHandler):
        def log_message(self,*_args):pass
    server=None
    if args.url:url=args.url.rstrip('/')+'/'
    else:
        server=ThreadingHTTPServer(('127.0.0.1',8000),partial(Handler,directory=str(ROOT/'_site')))
        threading.Thread(target=server.serve_forever,daemon=True).start();url='http://127.0.0.1:8000/'+QUIZ
    errors=[];attempts=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='msedge',headless=True)
        context=browser.new_context(viewport={'width':1024,'height':1100},reduced_motion='reduce')
        page=context.new_page();page.set_default_timeout(20000);page.on('pageerror',lambda error:errors.append(str(error)))
        def capture(response):
            if '/quizzes/wurzelwerk' in response.url and response.ok:
                try:
                    data=response.json();attempt=data.get('attempt') or data.get('current')
                    if attempt:attempts.append(attempt)
                except Exception:pass
        page.on('response',capture)
        page.goto(url,wait_until='networkidle');expect(page.get_by_role('heading',name='Was möchtest du heute machen?')).to_be_visible()
        page.screenshot(path=str(output/'start.png'),full_page=True)
        def visit(route):
            page.evaluate('(route)=>location.hash="/"+route',route)
        def type_digits(selector,value):
            field=page.locator(selector);field.fill('99');field.press('ControlOrMeta+A')
            for digit in str(value).replace('.',','):page.locator('[data-key="'+digit+'"]').click()
            expect(field).to_have_value(str(value).replace('.',','))
        def solve():
            expression=page.locator('.expression annotation').text_content();values=[int(n) for n in re.findall(r'\d+',expression)]
            if page.locator('#factor').count():
                n=values[0];a=math.isqrt(n)
                while n%(a*a):a-=1
                type_digits('#factor',a);page.locator('#nextInput').click();type_digits('#radicand',n//(a*a))
                return '#radicand'
            if page.locator('#numberRange').count():answer=round(math.sqrt(values[0]),2)
            else:answer=round(math.sqrt(values[0]/values[1] if '\\frac' in expression else values[0]*values[1] if '\\cdot' in expression else values[0]))
            type_digits('#answer',answer);return '#answer'
        for topic in ['roots','laws','line']:
            for level in [1,2,3]:
                visit('training/thema');page.locator('[data-topic="'+topic+'"]').click();page.locator('[data-level="'+str(level)+'"]').click();page.locator('[data-play="training"]').click()
                expect(page.locator('.task-card')).to_be_visible();assert page.locator('table').count()==0;assert page.locator('#remaining').count()==0
                field=solve();page.locator(field).press('Enter');expect(page.locator('#feedback')).to_have_class(re.compile('good'));expect(page.locator('#nextTask')).to_be_enabled()
        print('PASS: neun Trainingskombinationen, Zifferntastatur, Enter und getrennte Ansichten',flush=True)
        visit('wettbewerb');expect(page.locator('#connectionStatus')).to_have_class(re.compile('online'));assert page.locator('input[type=password]').count()==0
        page.locator('#competitionAlias').fill('UI-Zeitwertung');page.locator('[data-play="competition"]').click();expect(page.locator('.task-card')).to_be_visible()
        first_bonus=None
        for index in range(12):
            if index:page.locator('#nextTask').click()
            expect(page.locator('#checkAnswer')).to_be_visible();expect(page.locator('#checkAnswer')).to_be_enabled();assert page.locator('table').count()==0
            active=attempts[-1];assert active['maxPoints']==1800;assert active['deadline']-active['openedAt']==60000
            assert active['question']['level']==2;assert 'answer' not in active['question'];field=solve()
            if index==0:
                before=page.locator(field).input_value();deadline=active['deadline'];qid=active['question']['id']
                page.wait_for_timeout(11000);expect(page.locator(field)).to_have_value(before)
                page.reload(wait_until='networkidle');expect(page.locator('#checkAnswer')).to_be_visible();expect(page.locator(field)).to_have_value(before)
                assert attempts[-1]['question']['id']==qid and attempts[-1]['deadline']==deadline
                for width in [320,390,768,1024]:
                    page.set_viewport_size({'width':width,'height':1100});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
                page.set_viewport_size({'width':390,'height':1000});page.screenshot(path=str(output/'aufgabe-mobil.png'),full_page=True)
                page.set_viewport_size({'width':768,'height':1024});page.screenshot(path=str(output/'aufgabe-tablet.png'),full_page=True)
            if index==1:
                value=page.locator(field).input_value();context.set_offline(True);expect(page.locator('#checkAnswer')).to_be_disabled();context.set_offline(False)
                expect(page.locator('#checkAnswer')).to_be_enabled();expect(page.locator(field)).to_have_value(value)
            page.locator('#checkAnswer').click();expect(page.locator('#feedback')).to_have_class(re.compile('good'));expect(page.locator('#nextTask')).to_be_enabled()
            feedback=attempts[-1]['feedback'];assert feedback['basePoints']==100 and 0<=feedback['timeBonus']<=50
            if index==0:first_bonus=feedback['timeBonus']
        final=attempts[-1];assert final['basePoints']==1200 and final['score']==1200+final['timeBonus'] and final['score']>1200
        page.locator('#nextTask').click();expect(page.get_by_role('heading',name='Stark gemacht!')).to_be_visible();assert page.locator('table').count()==0
        page.screenshot(path=str(output/'ergebnis.png'),full_page=True);page.locator('a[href="#/rangliste"]').click()
        expect(page.locator('.board-table')).to_contain_text('UI-Zeitwertung');page.screenshot(path=str(output/'rangliste.png'),full_page=True)
        print(json.dumps({'result':'PASS','questions':12,'score':final['score'],'base':1200,'bonus':final['timeBonus'],'firstBonusAfterWaiting':first_bonus,'errors':errors}),flush=True)
        if args.timeout_test:
            visit('wettbewerb');page.locator('[data-play="competition"]').click();expect(page.locator('#remaining')).to_contain_text('s')
            print('Prüfe den echten Zeitablauf einer Aufgabe (60 Sekunden).',flush=True)
            expect(page.locator('#feedback')).to_contain_text('Die Zeit ist abgelaufen.',timeout=75000)
            assert attempts[-1]['feedback']['timedOut'] and attempts[-1]['feedback']['points']==0
            print('PASS: echter Zeitablauf, null Punkte und Fortsetzung möglich',flush=True)
        assert not errors,errors;browser.close()
    if server:server.shutdown()

if __name__=='__main__':main()
