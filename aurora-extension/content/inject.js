// content/inject.js
// Inject a Shadow DOM root and mount the overlay bundle

(() => {
  if (window.__AURORA_INJECTED__) return; // idempotent
  window.__AURORA_INJECTED__ = true;

  const host = document.createElement('div');
  host.id = '__aurora_root';
  const shadow = host.attachShadow({ mode: 'open' });
  document.documentElement.appendChild(host);

  const mount = document.createElement('div');
  shadow.appendChild(mount);

  const style = document.createElement('style');
  style.textContent = `
    :host{ all: initial; }
    .hud { position: fixed; inset: auto 16px 16px 16px; height: 112px; display: grid; grid-template-columns: 1fr auto; gap: 12px; border-radius: 16px; backdrop-filter: blur(14px) saturate(120%); -webkit-backdrop-filter: blur(14px) saturate(120%); background: rgba(10,12,18,.72); color: #fff; z-index: 2147483647; box-shadow: 0 10px 40px rgba(0,0,0,.35); }
    .bubble { position: fixed; right: 16px; bottom: 140px; width: 54px; height:54px; border-radius: 50%; background: linear-gradient(135deg,#7b61ff,#9b6bff); display:grid;place-items:center; cursor:pointer; box-shadow: 0 10px 30px rgba(0,0,0,.35); z-index: 2147483647; }
    .hidden { display:none !important; }
  `;
  shadow.appendChild(style);

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('ui/overlay.js');
  shadow.appendChild(script);
  script.onload = () => {
    if (typeof window.__AURORA_MOUNT__ === 'function') {
      window.__AURORA_MOUNT__(mount, { shadowRoot: shadow });
    }
  };

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'AURORA_TOGGLE_OVERLAY') {
      window.__AURORA_TOGGLE__?.();
    }
    if (msg?.type === 'AURORA_PTT') {
      window.__AURORA_PTT__?.();
    }
  });
})();
