const BASE_HTTP = __DEV__ ? 'http://localhost:8080' : 'https://api.pickupsports.app';
const WS_URL = BASE_HTTP.replace('http', 'ws') + '/ws';

type MessageHandler = (payload: any) => void;

// Minimal STOMP client sufficient for CONNECT + SUBSCRIBE + MESSAGE handling
export function connectNotifications(onMessage: MessageHandler) {
  let ws: WebSocket | null = null;
  let closed = false;
  let reconnectAttempts = 0;
  let reconnectTimer: any = null;

  function send(frame: string) {
    if (ws && ws.readyState === ws.OPEN) ws.send(frame + '\0');
  }

  function parseFrames(buffer: string): Array<{ command: string; headers: Record<string, string>; body: string }> {
    const frames: any[] = [];
    const chunks = buffer.split('\0');
    for (const chunk of chunks) {
      const text = chunk.trim();
      if (!text) continue;
      const [head, ...rest] = text.split('\n\n');
      const body = rest.join('\n\n');
      const lines = head.split('\n');
      const command = lines[0].trim();
      const headers: Record<string, string> = {};
      for (let i = 1; i < lines.length; i++) {
        const idx = lines[i].indexOf(':');
        if (idx > 0) headers[lines[i].slice(0, idx)] = lines[i].slice(idx + 1);
      }
      frames.push({ command, headers, body });
    }
    return frames;
  }

  function cleanup() {
    if (ws) {
      try { ws.close(); } catch {}
    }
    ws = null;
  }

  function connect() {
    try {
      ws = new WebSocket(WS_URL);
    } catch (e) {
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      reconnectAttempts = 0;
      // Basic STOMP CONNECT
      send(['CONNECT', 'accept-version:1.1,1.2', 'heart-beat:10000,10000', '', ''].join('\n'));
    };

    ws.onmessage = (ev) => {
      const data = typeof ev.data === 'string' ? ev.data : '';
      const frames = parseFrames(data);
      for (const f of frames) {
        if (f.command === 'CONNECTED') {
          // Subscribe to user notifications queue
          send(['SUBSCRIBE', 'id:sub-0', 'destination:/user/queue/notifications', '', ''].join('\n'));
        } else if (f.command === 'MESSAGE') {
          try {
            const payload = f.body ? JSON.parse(f.body) : null;
            if (payload) onMessage(payload);
          } catch (e) {
            // Ignore non-JSON payloads
          }
        }
      }
    };

    ws.onerror = () => {
      // Silent fail; retry via reconnect path
    };
    ws.onclose = () => {
      if (!closed) scheduleReconnect();
    };
  }

  function scheduleReconnect() {
    if (closed) return;
    reconnectAttempts += 1;
    const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts)); // exp backoff up to 30s
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      connect();
    }, delay);
  }

  // initial connect
  connect();

  return () => {
    closed = true;
    cleanup();
    clearTimeout(reconnectTimer);
  };
}
