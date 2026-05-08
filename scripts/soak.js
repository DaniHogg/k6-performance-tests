// scripts/soak.js
// Soak test - sustained load over extended period
// Purpose: Detect memory leaks, connection pool exhaustion, degradation over time
// Load: 20 concurrent users for 5 minutes

import { check, sleep } from 'k6';
import { ApiClient } from './shared/api-client.js';
import { assertStatus, assertResponseTime } from './shared/utils.js';
import { baseOptions, scenarios } from '../config/options.js';
import { urls } from '../config/urls.js';

export const options = {
  ...baseOptions,
  thresholds: {
    ...baseOptions.thresholds,
    'http_req_duration': ['p(95)<1000', 'p(99)<2000'],  // Monitor for degradation
    'http_req_failed': ['rate<0.1'],  // Tolerate up to 10% errors
  },
  scenarios: {
    soak: scenarios.soak,
  },
};

const client = new ApiClient(urls.base, 200);

export default function () {
  // Monitor memory/connection behavior over extended time
  
  // Endpoint 1: Repeated user listing
  const usersRes = client.get('/users', { limit: 100, page: Math.floor(Math.random() * 10) });
  assertStatus(usersRes, 200, 'Users endpoint OK');
  assertResponseTime(usersRes, 1000, 'Users endpoint < 1000ms (soak)');

  check(usersRes, {
    'soak: response is not too large': (r) => r.body.length < 1000000,
    'soak: response time consistent': (r) => r.timings.duration < 2000,
  });

  sleep(0.5);

  // Endpoint 2: Query posts with pagination
  const postsRes = client.get('/posts', { 
    limit: 50, 
    page: Math.floor(Math.random() * 5),
    sort: 'date',
  });
  assertStatus(postsRes, 200, 'Posts endpoint OK');

  sleep(0.5);

  // Endpoint 3: Comments — scoped to a post on the Render API
  const postIdForComments = (Math.floor(Math.random() * 5) + 1);
  const commentsRes = client.get(`/posts/${postIdForComments}/comments`);
  check(commentsRes, {
    'comments endpoint responds': (r) => r.status === 200,
  });

  sleep(1);

  // Endpoint 4: Complex query
  const searchRes = client.get('/posts', { 
    search: 'test',
    limit: 25,
  });
  check(searchRes, {
    'search endpoint responds': (r) => r.status === 200 || r.status === 404 || r.status === 400,
  });

  sleep(Math.random() * 1 + 0.5);
}
