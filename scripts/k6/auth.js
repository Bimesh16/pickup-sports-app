import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 10,
  duration: __ENV.DURATION || '1m',
};

export default function () {
  const url = (__ENV.BASE_URL || 'http://localhost:8080') + '/auth/login';
  const payload = JSON.stringify({ username: __ENV.USER || 'test@example.com', password: __ENV.PASS || 'secret' });
  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post(url, payload, params);
  check(res, { 'status is 200 or 401': (r) => r.status === 200 || r.status === 401 });
  sleep(1);
}
