import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '30s', target: 100 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  console.log(`Starting load test against base URL: ${BASE_URL}`);

  const res1 = http.get(`${BASE_URL}/api/health`);
  check(res1, { 'status is 200': (r) => r.status === 200 });

  const res2 = http.get(`${BASE_URL}/api/market/all-crops`);
  check(res2, { 'status is 200': (r) => r.status === 200 });

  const res3 = http.get(`${BASE_URL}/api/crop/all`);
  check(res3, { 'status is 200': (r) => r.status === 200 });

  sleep(1);
}
