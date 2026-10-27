import {linePoints} from './wurzelwerk-rules.mjs';

export const QUESTION_MS=60000, MAX_POINTS=1800;
const choose=values=>values[Math.floor(Math.random()*values.length)];
const integer=(min,max)=>min+Math.floor(Math.random()*(max-min+1));
export function competitionTask(type,ordinal=0){
  const task={id:crypto.randomUUID(),type,level:2};
  if(type==='roots'){
    const a=integer(5,20);
    return {...task,answer:a,expression:`\\sqrt{${a*a}}`,title:'Ziehe die Quadratwurzel.',help:'Welche positive Zahl ergibt beim Quadrieren den Wert unter der Wurzel?',explanation:`\\sqrt{${a*a}}=${a}`};
  }
  if(type==='line'){
    const n=choose(Array.from({length:56},(_,i)=>i+5).filter(n=>!Number.isInteger(Math.sqrt(n))));
    return {...task,n,max:8,answer:Math.sqrt(n),expression:`\\sqrt{${n}}`,title:'Schätze den Wert der Wurzel.',help:'Gib eine Zahl ein oder verschiebe den Regler. Zwei Nachkommastellen reichen.'};
  }
  const kind=['extract','product','extract','quotient'][ordinal%4];
  if(kind==='extract'){
    const a=integer(2,6),b=choose([2,3,5,7]);
    return {...task,kind,a,b,expression:`\\sqrt{${a*a*b}}`,title:'Vereinfache die Wurzel.',help:'Trage den Faktor und den Rest unter der Wurzel ein.',explanation:`\\sqrt{${a*a*b}}=${a}\\sqrt{${b}}`};
  }
  const d=choose([2,3,5]);
  if(kind==='product'){
    const x=integer(1,3),y=integer(2,4),a=d*x*x,b=d*y*y;
    return {...task,kind,answer:d*x*y,expression:`\\sqrt{${a}}\\cdot\\sqrt{${b}}`,title:'Multipliziere die Wurzeln.',help:'Fasse die Wurzeln zusammen. Das Ergebnis ist eine ganze Zahl.',explanation:`\\sqrt{${a}}\\cdot\\sqrt{${b}}=${d*x*y}`};
  }
  const k=integer(2,6);
  return {...task,kind,answer:k,expression:`\\frac{\\sqrt{${d*k*k}}}{\\sqrt{${d}}}`,title:'Teile die Wurzeln.',help:'Teile zuerst die Zahlen unter der Wurzel.',explanation:`\\sqrt{\\frac{${d*k*k}}{${d}}}=${k}`};
}
export function timedPoints(basePoints,openedAt,now){
  const remaining=Math.max(0,Math.min(QUESTION_MS,openedAt+QUESTION_MS-now));
  const timedOut=remaining===0;
  const timeBonus=!timedOut&&basePoints===100?Math.floor(50*remaining/QUESTION_MS):0;
  return {basePoints:timedOut?0:basePoints,timeBonus,points:timedOut?0:basePoints+timeBonus,timedOut};
}
export const lineGrade=error=>linePoints(error,0.25);
