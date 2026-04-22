// scripts/spike.js
// Spike test - sudden traffic surge
// Purpose: Test recovery from sudden load spikes, flash sales, viral moments
// Load: Baseline 5 users → spike to 100 users → back to 5

import { check, sleep } from 'k6';
import { ApiClient } from './shared/api-client.js';
import { assertStatus, assertResponseTime } from './shared/utils.js';
import { baseOptions, scenarios } from '../config/options.js';
import { urls } from '../config/urls.js';

export const options = {
  ...baseOptions,
  thresholds: {
    ...baseOptions.thresholds,
    'http_req_duration': ['p(95)<2000', 'p(99)<5000'],  // High thresholds during spike
    'http_req_failed': ['rate<0.15'],  // Allow higher error rate during spike
  },
  scenarios: {
    spike: scenarios.spike,
  },
};

const client = new ApiClient(urls.base, 100);

export default function () {
  // Get current VU count to understand test phase
  const vuCount = __VU;
  const testPhase = vuCount <= 5 ? 'pre-spike' : (vuCount >= 100 ? 'spike' : 'recovery');

  // Vary request patterns based on spike phase
  if (testPhase === 'pre-spike') {
    // Normal operation: modest requests
    const usersRes = client.get('/users', { limit: 10 });
    assertStatus(usersRes, 200, 'Normal: Users OK');
    sleep(1);
  } else if (testPhase === 'spike') {
    // During spike: aggressive requests, monitor response
    const startTime = new Date();

    // Multiple requests to stress system
    for (let i = 0; i < 3; i++) {
      const postsRes = client.get('/posts', { limit: 50 });
      check(postsRes, {
        'spike: requests still respond': (r) => r.status < 500,
      });

      const userRes = client.get('/users', { limit: 50 });
      check(userRes, {
        'spike: no total failures': (r) => r.status < 500,
      });
    }

    const duration = new Date() - startTime;
    console.log(`Spike phase - processed 3 request pairs in ${duration}ms`);

    sleep(0.5);
  } else {
    // Recovery: verify system returns to normal
    const recoveryRes = client.get('/users', { limit: 10 });
    assertStatus(recoveryRes, 200, 'Recovery: Users OK');
    assertResponseTime(recoveryRes, 800, 'Recovery: Response time normalized');

    sleep(1);
  }
}

export function handleSummary(data) {
  console.log('Spike test summary:');
  const metrics = data.metrics;
  
  if (metrics && metrics.http_req_duration) {
    console.log(`  Response time p95: ${metrics.http_req_duration.values['p(95)']}ms`);
    console.log(`  Response time p99: ${metrics.http_req_duration.values['p(99)']}ms`);
  }

  return {
    stdout: JSON.stringify(data),
  };
}
