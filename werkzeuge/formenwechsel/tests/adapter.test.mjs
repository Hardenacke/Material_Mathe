import test from 'node:test';
import assert from 'node:assert/strict';
import {callFobizz} from '../worker/fobizz-adapter.mjs';
test('Ohne bestätigten Connector findet kein Aufruf statt',async()=>{await assert.rejects(callFobizz({},{}),{code:'FOBIZZ_NOT_CONFIGURED'});});
test('Antwortgröße wird auch ohne Content-Length begrenzt',async()=>{await assert.rejects(callFobizz({},{FOBIZZ_API_CONFIRMED:'true',FOBIZZ_CONNECTOR:{fetch:async()=>new Response('x'.repeat(5000))}}),{code:'PROVIDER_RESPONSE_TOO_LARGE'});});
test('Hängender Service wird nach dem gesetzten Zeitlimit abgebrochen',async()=>{await assert.rejects(callFobizz({},{FOBIZZ_API_CONFIRMED:'true',FOBIZZ_CONNECTOR:{fetch:()=>new Promise(()=>{})}}),{code:'FOBIZZ_TIMEOUT'});});
