// scripts/baseline.js
// Baseline performance test with minimal load
// Purpose: Establish performance baseline, quick smoke test
// Load: 10 concurrent users for 30 seconds

import { check } from 'k6';
import { ApiClient } from './shared/api-client.js';
import { assertStatus, assertResponseTime } from './shared/utils.js';
import { baseOptions, scenarios } from '../config/options.js';
import { urls } from '../config/urls.js';

export const options = {
  ...baseOptions,
  scenarios: {
    baseline: scenarios.baseline,
  },
};

const client = new ApiClient(urls.base, 100);

export function setup() {
  if (!urls.health) {
    throw new Error('Missing urls.health. Check config/urls.js and environment configuration.');
  }

  // Pre-test setup: verify target is reachable
  const res = client.get(urls.health);
  check(res, {
    'target is reachable': (r) => r.status === 200 || r.status === 404,
  });
}

export default function () {
  // Test 1: Health check (usually fast)
  const healthRes = client.get('/health');
  assertStatus(healthRes, 200, 'Health check OK');

  // Test 2: List users endpoint
  const usersRes = client.get('/users', { limit: 10 });
  assertStatus(usersRes, 200, 'List users OK');
  assertResponseTime(usersRes, 500, 'Users endpoint < 500ms');

  check(usersRes, {
    'response contains users': (r) => r.body.includes('users') || r.body.includes('[]') || r.body.includes('['),
  });

  // Test 3: Get specific user (if users exist)
  const userId = Math.floor(Math.random() * 100) + 1;
  const userDetailRes = client.get(`/users/${userId}`);
  check(userDetailRes, {
    'single user request succeeds': (r) => r.status === 200 || r.status === 404,
  });

  // Test 4: List posts
  const postsRes = client.get('/posts', { limit: 10 });
  assertStatus(postsRes, 200, 'List posts OK');
  assertResponseTime(postsRes, 700, 'Posts endpoint < 700ms');
}

export function teardown(data) {
  // Post-test cleanup (if needed)
  console.log('Baseline test completed');
}
