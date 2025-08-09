// background/service.js
// Minimal MV3 background to toggle overlay and trigger push-to-talk

async function sendToActiveTab(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) chrome.tabs.sendMessage(tab.id, message).catch(() => {});
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-overlay') {
    await sendToActiveTab({ type: 'AURORA_TOGGLE_OVERLAY' });
  } else if (command === 'push-to-talk') {
    await sendToActiveTab({ type: 'AURORA_PTT' });
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'AURORA_BG_ECHO') {
    sendResponse({ ok: true });
  }
});
