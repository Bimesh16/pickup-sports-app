import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 10,
  duration: __ENV.DURATION || '1m',
};

export default function () {
  const base = __ENV.BASE_URL || 'http://localhost:8080';
  const res = http.get(`${base}/games/nearby?lat=37.7749&lon=-122.4194&radiusKm=2&limit=10`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
