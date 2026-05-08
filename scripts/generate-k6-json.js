// scripts/generate-k6-json.js
// Reads results/baseline-summary.json (written by handleSummary in baseline.js)
// and writes results/k6-results.json in the normalised schema used by the live
// portfolio site (fetch_k6_status.py).
//
// Usage (from repo root after running the baseline test):
//   node scripts/generate-k6-json.js

'use strict';

const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, '..', 'results');
const SUMMARY_FILE = path.join(RESULTS_DIR, 'baseline-summary.json');
const OUTPUT_FILE = path.join(RESULTS_DIR, 'k6-results.json');

function isoNow() {
  return new Date().toISOString().replace('+00:00', 'Z');
}

function run() {
  if (!fs.existsSync(SUMMARY_FILE)) {
    console.error(`baseline-summary.json not found at ${SUMMARY_FILE}`);
    console.error('Run: npm run test:baseline first');
    process.exit(1);
  }

  const summary = JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf8'));

  // Metric labels shown on the live site card
  const { metrics, totals } = summary;
  const metricRows = [
    {
      name: 'P95 Response Time',
      value: `${metrics.http_req_duration_p95_ms} ms`,
      threshold: '< 500 ms',
      passed: metrics.http_req_duration_p95_ms < 500,
    },
    {
      name: 'Avg Response Time',
      value: `${metrics.http_req_duration_avg_ms} ms`,
      threshold: null,
      passed: true,
    },
    {
      name: 'Error Rate',
      value: `${(metrics.http_req_failed_rate * 100).toFixed(2)}%`,
      threshold: '< 5%',
      passed: metrics.http_req_failed_rate < 0.05,
    },
    {
      name: 'Check Pass Rate',
      value: `${(metrics.checks_pass_rate * 100).toFixed(2)}%`,
      threshold: '> 95%',
      passed: metrics.checks_pass_rate > 0.95,
    },
  ];

  const output = {
    $schema_version: '1.0.0',
    generated_at: isoNow(),
    test_type: summary.test_type,
    target: summary.target,
    scenario: summary.scenario,
    status: summary.status,
    thresholds_passed: summary.thresholds_passed,
    totals: {
      requests: totals.requests,
      passed: metricRows.filter((r) => r.passed).length,
      failed: metricRows.filter((r) => !r.passed).length,
    },
    metric_rows: metricRows,
    // Suites map to the distinct test scenarios in the k6 suite.
    // Only baseline runs every time; others are conditional or long-running.
    suites: [
      {
        suite_id: 'baseline',
        suite_name: 'Baseline (10 VUs × 30s)',
        status: summary.status,
        target: summary.target,
        metrics: metrics,
        totals: { requests: totals.requests },
        notes: 'Constant load test against the QA Portfolio API.',
      },
    ],
  };

  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`Written ${OUTPUT_FILE}  status=${output.status}`);
}

run();
