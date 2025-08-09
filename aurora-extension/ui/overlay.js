// ui/overlay.js
// Very small UI bundle without React to avoid a build step

(function(){
  function el(tag, cls, txt){ const n = document.createElement(tag); if(cls) n.className = cls; if(txt) n.textContent = txt; return n; }

  window.__AURORA_MOUNT__ = function(mount, { shadowRoot }){
    const hud = el('div', 'hud');
    const left = el('div');
    const right = el('div');

    // Log area
    const log = el('div');
    log.style.cssText = 'font: 12px/1.4 system-ui, sans-serif; color: rgba(255,255,255,.9); padding:12px; overflow:auto;';
    log.textContent = 'Aurora ready. Press Alt+A to toggle, Alt+Space to talk.';
    left.appendChild(log);

    // Buttons
    const row = el('div');
    row.style.cssText = 'display:flex; gap:8px; align-items:center; padding:12px;';
    const btnRead = el('button', '', 'Read page');
    const btnPTT = el('button', '', 'Push-To-Talk');
    const btnHide = el('button', '', 'Hide');
    for (const b of [btnRead, btnPTT, btnHide]){
      b.style.cssText = 'background: rgba(255,255,255,.12); color:#fff; border:1px solid rgba(255,255,255,.2); border-radius:10px; padding:8px 10px; cursor:pointer;';
    }
    row.append(btnRead, btnPTT, btnHide);
    right.appendChild(row);

    hud.append(left, right);
    mount.appendChild(hud);

    // Bubble
    const bubble = el('div', 'bubble');
    bubble.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22"></path><path d="M5 8h14"></path><path d="M5 16h14"></path></svg>';
    mount.appendChild(bubble);

    function logLine(s){ log.textContent += '\n' + s; log.scrollTop = log.scrollHeight; }

    window.__AURORA_TOGGLE__ = () => {
      const hide = hud.classList.toggle('hidden');
      bubble.classList.toggle('hidden', !hide);
    };
    window.__AURORA_PTT__ = () => {
      if (!window.__AURORA_VOICE__) return logLine('Voice unavailable');
      const stop = window.__AURORA_VOICE__.startPTT((text) => logLine('You: ' + text));
      setTimeout(() => stop?.(), 5000);
    };

    btnHide.onclick = () => window.__AURORA_TOGGLE__();
    bubble.onclick = () => window.__AURORA_TOGGLE__();

    btnRead.onclick = () => {
      const res = window.__AURORA_TOOLS__?.read();
      if (res?.ok) logLine('Read: ' + res.text.slice(0,120) + '…');
      else logLine('Read failed');
    };
    btnPTT.onclick = () => window.__AURORA_PTT__();
  }
})();
