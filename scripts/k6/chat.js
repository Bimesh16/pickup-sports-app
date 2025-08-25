import http from 'k6/http';
import { check, sleep } from 'k6';

// Placeholder HTTP-based chat check; replace with WS client if needed
export let options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 5,
  duration: __ENV.DURATION || '1m',
};

export default function () {
  const base = __ENV.BASE_URL || 'http://localhost:8080';
  const gameId = __ENV.GAME_ID || 1;
  const res = http.get(`${base}/games/${gameId}/chat/latest?limit=5`);
  check(res, { 'status is 200 or 401': (r) => r.status === 200 || r.status === 401 });
  sleep(1);
}
