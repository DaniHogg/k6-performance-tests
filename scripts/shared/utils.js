// scripts/shared/utils.js
// Utility functions and helpers for k6 tests

import { check, fail } from 'k6';

/**
 * Assert response status and log details on failure
 */
export function assertStatus(res, expectedStatus, name = 'Status check') {
  const passed = check(res, {
    [name]: (r) => r.status === expectedStatus,
  });

  if (!passed) {
    console.error(`${name} failed: expected ${expectedStatus}, got ${res.status}`);
    console.error(`Response body: ${res.body}`);
  }

  return passed;
}

/**
 * Assert JSON response contains expected fields
 */
export function assertJsonFields(res, expectedFields, name = 'JSON fields') {
  let body;
  try {
    body = JSON.parse(res.body);
  } catch (e) {
    console.error(`Failed to parse JSON response: ${res.body}`);
    return false;
  }

  const passed = check(body, {
    [name]: (b) => expectedFields.every(field => field in b),
  });

  if (!passed) {
    console.error(`Expected fields not found: ${expectedFields.join(', ')}`);
  }

  return passed;
}

/**
 * Assert response time is within threshold
 */
export function assertResponseTime(res, maxMs, name = 'Response time') {
  const passed = check(res, {
    [name]: (r) => r.timings.duration <= maxMs,
  });

  if (!passed) {
    console.warn(`${name} exceeded: ${res.timings.duration}ms > ${maxMs}ms`);
  }

  return passed;
}

/**
 * Generate random user data for testing
 */
export function generateUser() {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@example.com`,
    name: `User ${timestamp}`,
    age: Math.floor(Math.random() * 60) + 18,
  };
}

/**
 * Generate random post data
 */
export function generatePost() {
  const titles = [
    'Getting Started with Performance Testing',
    'Optimizing API Response Times',
    'Load Testing Best Practices',
    'Understanding User Behavior',
    'Capacity Planning Guide',
  ];
  
  const contents = [
    'This is a test post for performance testing.',
    'Performance optimization is crucial for user experience.',
    'Load testing helps identify bottlenecks.',
    'Monitor your metrics closely.',
    'Iterate and measure improvements.',
  ];

  return {
    title: titles[Math.floor(Math.random() * titles.length)],
    content: contents[Math.floor(Math.random() * contents.length)],
    tags: ['testing', 'performance', 'qa'],
  };
}

/**
 * Random delay between min and max milliseconds
 */
export function randomDelay(minMs = 100, maxMs = 500) {
  return (Math.random() * (maxMs - minMs)) + minMs;
}

/**
 * Retry a function with exponential backoff
 */
export function retryWithBackoff(fn, maxRetries = 3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return fn();
    } catch (e) {
      lastError = e;
      const backoffMs = Math.pow(2, i) * 100;
      console.warn(`Attempt ${i + 1} failed, retrying in ${backoffMs}ms...`);
      // Note: k6 doesn't support sleep here, handle in calling code
    }
  }
  throw lastError;
}

/**
 * Format bytes for readable output
 */
export function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Log performance metrics summary
 */
export function logMetricsSummary(testName, metrics) {
  console.log(`\n========== ${testName} Summary ==========`);
  Object.entries(metrics).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  console.log('='.repeat(40));
}
