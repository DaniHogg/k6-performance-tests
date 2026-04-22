// scripts/stress.js
// Stress test - progressive load to breaking point
// Purpose: Find maximum capacity and failure modes
// Load: Progressive increase from 0 → 50 → 100 → 200 → 300 → 400 users

import { check, sleep } from 'k6';
import { ApiClient } from './shared/api-client.js';
import { assertStatus } from './shared/utils.js';
import { baseOptions, scenarios } from '../config/options.js';
import { urls } from '../config/urls.js';

export const options = {
  ...baseOptions,
  thresholds: {
    // For stress testing, we're looking for breaking points
    // Relax thresholds as we expect some failures
    'http_req_duration': ['p(95)<5000'],
    'http_req_failed': ['rate<0.3'],  // Expect up to 30% failures under extreme load
  },
  scenarios: {
    stress: scenarios.stress,
  },
};

const client = new ApiClient(urls.base, 50);

export default function () {
  const vuCount = __VU;
  const totalVus = 400;
  const loadPercentage = (vuCount / totalVus) * 100;

  // Determine load phase for logging
  let phase = 'ramp';
  if (vuCount <= 50) phase = 'low';
  else if (vuCount <= 100) phase = 'medium';
  else if (vuCount <= 200) phase = 'high';
  else if (vuCount <= 300) phase = 'very-high';
  else phase = 'critical';

  // Track performance per load level
  const testStart = Date.now();

  try {
    // Aggressive endpoint: read-heavy
    const usersRes = client.get('/users', { limit: 100 });
    check(usersRes, {
      [`stress (${phase}): users endpoint responds`]: (r) => r.status < 500,
    });

    // Write operation (if supported)
    const postsRes = client.get('/posts', { limit: 100 });
    check(postsRes, {
      [`stress (${phase}): posts endpoint responds`]: (r) => r.status < 500,
    });

    // Complex operation
    const searchRes = client.get('/comments', { limit: 100 });
    check(searchRes, {
      [`stress (${phase}): comments endpoint responds`]: (r) => r.status < 500,
    });

    const duration = Date.now() - testStart;
    if (duration > 5000) {
      console.warn(`Stress phase ${phase} (VU:${vuCount}): slow response ${duration}ms`);
    }
  } catch (e) {
    console.error(`Stress phase ${phase} (VU:${vuCount}): error - ${e}`);
  }

  sleep(0.5);
}

// Custom summary for stress test
export function handleSummary(data) {
  console.log('\n========== Stress Test Analysis ==========');
  
  const metrics = data.metrics;
  
  if (metrics && metrics.http_req_duration) {
    const duration = metrics.http_req_duration.values;
    console.log(`Response Times:`);
    console.log(`  Min: ${duration['min']}ms`);
    console.log(`  Avg: ${duration['avg']}ms`);
    console.log(`  p95: ${duration['p(95)']}ms`);
    console.log(`  p99: ${duration['p(99)']}ms`);
    console.log(`  Max: ${duration['max']}ms`);
  }

  if (metrics && metrics.http_req_failed) {
    const failed = metrics.http_req_failed.values;
    console.log(`\nFailure Rate: ${(failed.rate * 100).toFixed(2)}%`);
  }

  if (metrics && metrics.http_reqs) {
    const reqs = metrics.http_reqs.values;
    console.log(`\nThroughput: ${reqs.rate}/s (${reqs.count} total)`);
  }

  console.log('==========================================\n');

  return {};
}
