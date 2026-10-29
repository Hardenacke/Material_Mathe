import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../gemeinsam/quiz/assets/anzeige.js';
const {formula, mathText} = globalThis.MatheQuizAnzeige;

test('school notation omits neutral coefficients, zero summands and double signs', () => {
  for (const [source, expected] of [
    ['f(x)=1x^3+0x^2-1x+0', 'f(x)=x^3-x'],
    ['f(x)=1(x+0)^2+0', 'f(x)=x^2'],
    ['f(x)=-1x+0', 'f(x)=-x'],
    ['f(x)=0x^3+0x^2+0x+0', 'f(x)=0'],
    ['f(x)=0x^2-1x+0', 'f(x)=-x'],
    ['f(x)=2x+-3', 'f(x)=2x-3'],
    ['x=3--2', 'x=3+2'],
    ['f(x)=1x^{1}+0', 'f(x)=x'],
    ['f(x)=1(x+2)^{3}e^{-1(x+2)}', 'f(x)=(x+2)^{3}e^{-(x+2)}'],
    ['f(t)=1\\sin(t)', 'f(t)=\\sin(t)'],
  ]) assert.equal(formula(source), expected, source);
});

test('zeros, ones, decimals, exponents, coordinates and literal text keep their meaning', () => {
  for (const source of ['x=0', 'x=-1', 'x=10x+100', 'f(x)=0{,}1x+0{,}01',
    'f(x)=1{,}1(x+2)', 'f(x)=x^10+0.1', 'P=(1|0|0)', 'P(X=0)=0', '1+0=1',
    'f(x)=x+0/2', 'f(x)=x+0\\cdot2', 'f(x)=x+\\text{+0 und 1x}',
    'f(x)=x/1', 'f(x)=5/1x', 'f(x)=5/1(x)', 'f(x)=0x^0+x', 'f(x)=0x^{-1}+x',
    'h_1(x)=x', 'f(x)=1e-5']) assert.equal(formula(source), source);
  assert.equal(mathText('Stufe 10, 1x tippen; \\(f(x)=1x+0\\).'), 'Stufe 10, 1x tippen; \\(f(x)=x\\).');
});

test('displayed polynomial values equal the original values for thousands of special cases', () => {
  const value = (source, x) => {
    const expression = source.replace('f(x)=', '').replace(/x\^(\d+)/g, '(x**$1)').replace(/(\d)(x|\()/g, '$1*$2');
    return Function('x', 'return '+expression)(x);
  };
  for (let a=-2;a<=2;a++) for (let b=-2;b<=2;b++) for (let c=-2;c<=2;c++) for (let d=-2;d<=2;d++) {
    const original = `f(x)=${a}x^3+${b}x^2+${c}x+${d}`, shown = formula(original);
    for (const x of [-3, -0.5, 0, 2.5]) assert.ok(value(shown, x) === value(original, x), original+' → '+shown);
  }
});
