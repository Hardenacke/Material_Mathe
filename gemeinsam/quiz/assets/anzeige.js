/* Shared display rules. Task values, option IDs and submitted answers stay intact. */
(() => {
  function formula(source) {
    const literals = [];
    let text = String(source).replace(/\\(?:text|mathrm|operatorname)\{[^{}]*\}/g, value => {
      literals.push(value); return '\uE000' + (literals.length - 1) + '\uE001';
    });
    text = text.replace(/\+\s*-/g, '-').replace(/-\s*-/g, '+').replace(/\+\s*\+/g, '+');
    if (/(^|[^A-Za-z\\])[xyztnu](?![A-Za-z])/.test(text)) {
      // Only complete additive terms: decimal numbers, coordinates and products keep their zeros.
      text = text.replace(/(^|[=(+\-])0[xyztnu](?:\^(?:\{[1-9]\d*\}|[1-9]\d*))?(?=[+\-)=]|$)/g, (_, prefix) => prefix + '0');
      for (let i = 0; i < 3; i++) {
        text = text.replace(/([A-Za-z\d)}])([+\-])0(?=$|[+\-)=<>;])/g, '$1');
        text = text.replace(/(^|[=(])0\+/g, '$1').replace(/(^|[=(])0-/g, '$1-');
      }
      text = text.replace(/(^|[=(])\+/g, '$1');
      text = text.replace(/(^|[=(+\-*{\s])1(?=[xyztnu](?![A-Za-z])|e\^|\(|\\(?:sin|cos|tan|exp|sqrt)\b)/g, '$1');
      // Keep function arguments f(x); drop only a redundant factor bracket (x).
      text = text.replace(/(^|[=+\-*({])(\d*)\(([xyztnu])\)/g, '$1$2$3');
      text = text.replace(/\^(?:\{1\}|1)(?![\dA-Za-z])/g, '');
    }
    return text.replace(/\uE000(\d+)\uE001/g, (_, index) => literals[Number(index)]);
  }

  function mathText(value) {
    return String(value).replace(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g,
      (_, inline, display) => inline !== undefined ? '\\(' + formula(inline) + '\\)' : '\\[' + formula(display) + '\\]');
  }

  const superscripts = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻','−':'⁻','+':'⁺'};
  function mathMLText(node) {
    if (node.nodeType === 3) return node.nodeValue;
    const children = [...node.children], parts = children.map(mathMLText), tag = node.localName;
    if (tag === 'annotation' || tag === 'annotation-xml') return '';
    if (tag === 'semantics') return parts[0] || '';
    if (tag === 'mfrac') return '(' + parts[0] + ')/(' + parts[1] + ')';
    if (tag === 'msqrt') return '√(' + parts.join('') + ')';
    if (tag === 'mroot') return 'Wurzel[' + parts[1] + '](' + parts[0] + ')';
    if (tag === 'msup') return parts[0] + (/^[\d+−-]+$/.test(parts[1]) ? [...parts[1]].map(n => superscripts[n]).join('') : '^(' + parts[1] + ')');
    if (tag === 'msub') return parts[0] + '_(' + parts[1] + ')';
    if (tag === 'msubsup') return parts[0] + '_(' + parts[1] + ')^(' + parts[2] + ')';
    if (tag === 'mspace') return ' ';
    if (tag === 'mtable') return '(' + parts.join('; ') + ')';
    if (tag === 'mtr') return parts.join(' | ');
    return children.length ? parts.join('') : node.textContent;
  }

  // Native iPad select menus cannot contain KaTeX HTML. Keep their mathematics readable.
  function plainText(value) {
    return mathText(value).replace(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g, (_, inline, display) => {
      const tex = inline ?? display;
      if (!globalThis.katex || !globalThis.DOMParser) return tex;
      try {
        const doc = new DOMParser().parseFromString(katex.renderToString(tex, {output: 'mathml', throwOnError: true, trust: false}), 'text/html');
        return mathMLText(doc.querySelector('math')).replace(/[\u2061\u2062]/g, '').replace(/\u00a0/g, ' ');
      } catch { return tex; }
    });
  }

  function prepare(root) {
    const doc = root.ownerDocument || root;
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.parentElement?.closest('script,style,textarea,pre,code,option,.katex,.no-math')) nodes.push(node);
    }
    for (const node of nodes) if (/\\[([]/.test(node.nodeValue)) node.nodeValue = mathText(node.nodeValue);
    root.querySelectorAll?.('option').forEach(option => {
      if (/\\[([]/.test(option.textContent)) option.textContent = plainText(option.textContent);
    });
    root.querySelectorAll?.('[aria-label]').forEach(node => {
      const label = node.getAttribute('aria-label');
      if (/\\[([]/.test(label)) node.setAttribute('aria-label', plainText(label));
    });
  }
  function previewSelection(select, options, renderMath) {
    const row = select.closest('.match-row');
    let preview = row.querySelector('.match-preview');
    if (!preview) {
      preview = document.createElement('div'); preview.className = 'match-preview';
      preview.setAttribute('aria-live', 'polite'); row.append(preview);
    }
    const value = select.value === '' ? null : options[Number(select.value)];
    preview.hidden = value === null || value === undefined;
    preview.textContent = preview.hidden ? '' : 'Deine Auswahl: ' + value;
    if (!preview.hidden) renderMath(preview);
  }
  globalThis.MatheQuizAnzeige = Object.freeze({formula, mathText, plainText, prepare, previewSelection});
})();
