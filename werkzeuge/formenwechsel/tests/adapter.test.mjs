import test from 'node:test';
import assert from 'node:assert/strict';
import {callFobizz,providerReady,providerProblems} from '../worker/fobizz-adapter.mjs';
const selectedAssistant='8a017c8d-602b-4736-87ab-3d777f9a87a5';
const configured={FOBIZZ_API_CONFIRMED:'true',FOBIZZ_ASSISTANT_ID:selectedAssistant};
test('Ohne bestätigten Connector findet kein Aufruf statt',async()=>{await assert.rejects(callFobizz({},{}),{code:'FOBIZZ_NOT_CONFIGURED'});});
test('Antwortgröße wird auch ohne Content-Length begrenzt',async()=>{await assert.rejects(callFobizz({},{...configured,FOBIZZ_CONNECTOR:{fetch:async()=>new Response('x'.repeat(5000))}}),{code:'PROVIDER_RESPONSE_TOO_LARGE'});});
test('Hängender Service wird nach dem gesetzten Zeitlimit abgebrochen',async()=>{await assert.rejects(callFobizz({},{...configured,FOBIZZ_CONNECTOR:{fetch:()=>new Promise(()=>{})}}),{code:'FOBIZZ_TIMEOUT'});});

test('Der serverseitig ausgewählte Assistent wird an den Connector übergeben',async()=>{
 let received;
 await callFobizz({assistantId:'client-cannot-change-this',candidates:[{id:'C2'}]},{...configured,FOBIZZ_CONNECTOR:{fetch:async request=>{received=await request.json();return Response.json({feedback:'Gut gerechnet.',nextTaskId:'C2'});}}});
 assert.equal(received.assistantId,selectedAssistant);
 assert.deepEqual(received.candidates,[{id:'C2'}]);
});

test('Ohne gültige serverseitige Assistentenkennung bleibt der Provider geschlossen',async()=>{
 const env={...configured,FOBIZZ_ASSISTANT_ID:'https://app.fobizz.com/share',FOBIZZ_CONNECTOR:{fetch(){throw Error('must not call');}}};
 assert.equal(providerReady(env),false);
 assert.deepEqual(providerProblems(env),['FOBIZZ_ASSISTANT_ID']);
 await assert.rejects(callFobizz({},env),{code:'FOBIZZ_NOT_CONFIGURED'});
});
