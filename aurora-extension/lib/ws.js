// lib/ws.js
// Placeholder WS bridge to app (device token TBD)

export function connect(token){
  try {
    const ws = new WebSocket(`wss://app.yourdomain/ws?token=${encodeURIComponent(token)}`);
    return ws;
  } catch (e) {
    console.warn('WS connect failed', e);
    return null;
  }
}
