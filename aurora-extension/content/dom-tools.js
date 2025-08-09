// content/dom-tools.js
// Minimal DOM tools exposed on window for agent or overlay usage

(function(){
  const tools = {
    click: (selector) => {
      try {
        const el = document.querySelector(selector);
        if(!el) return { ok:false, error:'not found' };
        el.click();
        if (el.focus) el.focus();
        return { ok:true };
      } catch (e) { return { ok:false, error: String(e) }; }
    },
    type: (selector, text, submit) => {
      try {
        const el = document.querySelector(selector);
        if(!el) return { ok:false, error:'not found' };
        if ('value' in el) el.value = text;
        el.dispatchEvent(new Event('input', { bubbles:true }));
        if (submit && el.form) el.form.submit();
        return { ok:true };
      } catch (e) { return { ok:false, error: String(e) }; }
    },
    read: (selector) => {
      const root = selector ? document.querySelector(selector) : document.body;
      if(!root) return { ok:false, error:'not found' };
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let s = '', n;
      while(n = tw.nextNode()) s += (n.textContent || '').trim() + ' ';
      return { ok:true, text: s.slice(0, 4000) };
    },
    scroll: (y) => { window.scrollBy({ top: y, behavior:'smooth' }); return { ok:true }; }
  };
  window.__AURORA_TOOLS__ = tools;
})();
