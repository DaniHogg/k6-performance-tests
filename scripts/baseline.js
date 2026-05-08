// scripts/baseline.js
// Baseline performance test with minimal load
// Purpose: Establish performance baseline, quick smoke test
// Load: 10 concurrent users for 30 seconds
// Target: https://qa-portfolio-api.onrender.com (configured in config/urls.js)

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
  // Warm up the target before load begins.
  // The Render free tier may be cold — this gives it time to start.
  const res = client.get('/health');
  check(res, {
    'target is reachable': (r) => r.status === 200,
  });

  if (res.status !== 200) {
    console.warn(`Health check returned ${res.status} — target may be cold-starting`);
  }
}

/**
 * handleSummary runs once after the test finishes.
 * Writes results/baseline-summary.json with key metrics and threshold results
 * so the CI pipeline can generate the normalized k6-results.json for the live site.
 */
export function handleSummary(data) {
  const m = data.metrics || {};

  const durP95  = m.http_req_duration?.values?.['p(95)']  ?? 0;
  const durAvg  = m.http_req_duration?.values?.avg        ?? 0;
  const failRate    = m.http_req_failed?.values?.rate     ?? 0;
  const checksRate  = m.checks?.values?.rate              ?? 1;
  const reqCount    = m.http_reqs?.values?.count          ?? 0;

  // A run passes when every declared threshold is ok.
  const thresholdsPassed = Object.values(m).every((metric) => {
    const thresholds = metric.thresholds;
    if (!thresholds) return true;
    return Object.values(thresholds).every((t) => t.ok);
  });

  const summary = {
    test_type: 'baseline',
    status: thresholdsPassed ? 'passed' : 'failed',
    target: urls.base,
    scenario: '10 VUs × 30s',
    metrics: {
      http_req_duration_p95_ms:  Math.round(durP95  * 100) / 100,
      http_req_duration_avg_ms:  Math.round(durAvg  * 100) / 100,
      http_req_failed_rate:      Math.round(failRate    * 10000) / 10000,
      checks_pass_rate:          Math.round(checksRate  * 10000) / 10000,
    },
    totals: {
      requests: Math.round(reqCount),
    },
    thresholds_passed: thresholdsPassed,
  };

  return {
    'results/baseline-summary.json': JSON.stringify(summary, null, 2),
  };
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
