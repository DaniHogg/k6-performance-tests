// config/options.js
// Shared k6 options and thresholds used across all test scenarios

export const baseOptions = {
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],  // 95th percentile < 500ms, 99th < 1000ms
    'http_req_failed': ['rate<0.05'],                    // Error rate < 5%
    'http_conn_duration': ['p(95)<200'],                 // Connection duration p95 < 200ms
    'checks': ['rate>0.95'],                             // Custom checks 95%+ pass rate
  },
  ext: {
    loadimpact: {
      projectID: 3330657,  // k6 Cloud project ID (replace with your own)
      name: 'Performance Tests',
    },
  },
};

// Scenario profiles for different test types
export const scenarios = {
  baseline: {
    executor: 'constant-vus',
    vus: 10,
    duration: '30s',
  },
  rampUp: {
    executor: 'ramping-vus',
    startVUs: 1,
    stages: [
      { duration: '1m', target: 25 },
      { duration: '1m', target: 50 },
      { duration: '1m', target: 25 },
      { duration: '30s', target: 0 },
    ],
  },
  soak: {
    executor: 'constant-vus',
    vus: 20,
    duration: '5m',
  },
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 5 },
      { duration: '1m30s', target: 5 },
      { duration: '20s', target: 100 },
      { duration: '1m', target: 100 },
      { duration: '20s', target: 5 },
      { duration: '30s', target: 0 },
    ],
  },
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 50 },
      { duration: '2m', target: 100 },
      { duration: '2m', target: 200 },
      { duration: '2m', target: 300 },
      { duration: '2m', target: 400 },
      { duration: '1m', target: 0 },
    ],
  },
};
