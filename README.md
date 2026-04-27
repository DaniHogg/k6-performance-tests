# k6 Performance Testing Suite

[![K6 Performance Tests](https://github.com/DaniHogg/k6-performance-tests/actions/workflows/performance.yml/badge.svg)](https://github.com/DaniHogg/k6-performance-tests/actions/workflows/performance.yml)
![k6](https://img.shields.io/badge/k6-7.x-7D64FF?style=flat&logo=k6&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)

This repository contains examples of performance and load testing using k6.

It is intended to demonstrate:
- Basic performance testing concepts
- Writing k6 test scripts using JavaScript
- Running and interpreting performance test results

This repository is intentionally scoped to learning and demonstration.
It is not a full performance testing framework or production setup.

## Features

- **Multiple test scenarios** – baseline, ramp-up, soak, spike, stress  
- **Real-time metrics** – throughput, response times, error rates, connection pooling  
- **HTML reporting** – detailed performance summaries with visualizations  
- **Configurable thresholds** – pass/fail criteria based on SLAs  
- **Environment-driven config** – easily switch between environments (dev, staging, production)  
- **Modular test structure** – reusable shared functions and utility helpers  
- **GitHub Actions CI** – automated nightly runs with artifact uploads  
- **K6 Cloud integration** – optional reporting to k6 Cloud for historical trends  

## What is k6?

**k6** is a modern, developer-friendly load testing tool built on Go with JavaScript scripting. Unlike traditional tools, k6 is:
- **Fast** – minimal overhead, tests run efficiently  
- **JavaScript-native** – write tests in familiar JS, no DSL to learn  
- **Cloud-enabled** – run distributed tests across cloud infrastructure  
- **Metrics-focused** – rich built-in metrics without custom instrumentation  
- **CI/CD-friendly** – lightweight, runs anywhere, integrates naturally with pipelines  

## Installation

### Prerequisites
- Node.js 18+ (for local development and script utilities)  
- k6 binary (install via package manager or download)

### Install k6

**macOS (via Homebrew)**
```bash
brew install k6
```

**Linux (Ubuntu/Debian)**
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Linux (Fedora/RHEL)**
```bash
sudo dnf install k6
```

**Windows (via Chocolatey)**
```bash
choco install k6
```

**Or download directly**: [k6 Downloads](https://k6.io/docs/getting-started/installation)

### Install Dependencies

```bash
npm install
```

## Project Structure

```
k6-performance-tests/
├── scripts/
│   ├── baseline.js           # Baseline performance test (minimal load)
│   ├── ramp-up.js            # Gradual load increase over time
│   ├── soak.js               # Sustained load for extended period
│   ├── spike.js              # Sudden spike in concurrent users
│   ├── stress.js             # Progressive load to breaking point
│   └── shared/
│       ├── api-client.js      # Reusable API client utilities
│       └── utils.js           # Helper functions (setup, teardown, assertions)
├── config/
│   ├── options.js            # Shared k6 options and thresholds
│   └── urls.js               # Environment-driven URL config
├── results/                  # Performance test results and HTML reports
├── .github/workflows/
│   └── performance.yml       # GitHub Actions CI workflow
├── package.json              # Node dependencies and npm scripts
├── .env.example              # Environment variable template
├── k6-summary.js             # HTML summary report generator
└── README.md                 # This file
```

## Quick Start

### Run Individual Tests Locally

**Baseline test** – measure response time and throughput with minimal load
```bash
k6 run scripts/baseline.js
```

**Ramp-up test** – gradually increase from 1 to 50 users over 2 minutes
```bash
k6 run scripts/ramp-up.js
```

**Soak test** – sustain 20 users for 5 minutes to detect memory leaks
```bash
k6 run scripts/soak.js
```

**Spike test** – sudden jump from 5 to 100 users for 1 minute
```bash
k6 run scripts/spike.js
```

**Stress test** – progressive load until system breaks
```bash
k6 run scripts/stress.js
```

### Run All Tests with npm

```bash
npm run test:all
```

### Run with HTML Report Output

```bash
k6 run scripts/baseline.js --out json=results/baseline.json
npm run report
```

## Configuration

### Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your target URLs:

```env
# Staging environment
BASE_URL=https://api-staging.example.com
API_ENDPOINT=/api/v1

# Production environment (use with caution!)
# BASE_URL=https://api.example.com
# API_ENDPOINT=/api/v1

# Test user credentials (optional)
TEST_USER_EMAIL=user@example.com
TEST_USER_PASSWORD=password123
```

### Thresholds

Thresholds are defined in `config/options.js` and determine if a test passes or fails:

```javascript
thresholds: {
  'http_req_duration': ['p(95)<500', 'p(99)<1000'],  // 95th percentile < 500ms
  'http_req_failed': ['rate<0.05'],                    // Error rate < 5%
  'iterations': ['count>100'],                         // At least 100 iterations
}
```

Modify thresholds based on your SLA requirements.

## Test Scenarios Explained

### 1. Baseline (`baseline.js`)
- **Purpose**: Establish performance baseline with minimal load  
- **Load**: 10 concurrent users for 30 seconds  
- **Use case**: Quick smoke test, regression baseline  
- **Metrics**: Response time, throughput, error rate  

### 2. Ramp-Up (`ramp-up.js`)
- **Purpose**: Simulate realistic user growth  
- **Load**: 1 → 50 concurrent users over 2 minutes  
- **Use case**: Test application behavior under increasing load  
- **Metrics**: Response degradation curve, queue depth  

### 3. Soak (`soak.js`)
- **Purpose**: Detect memory leaks and degradation over time  
- **Load**: 20 concurrent users for 10 minutes  
- **Use case**: Find slow leaks, connection pool exhaustion  
- **Metrics**: Memory/CPU over time, sustained error rate  

### 4. Spike (`spike.js`)
- **Purpose**: Test recovery from sudden traffic surge  
- **Load**: Baseline 5 users → spike to 100 for 1 minute → back to 5  
- **Use case**: Handle flash sales, viral moments  
- **Metrics**: Spike recovery time, error spike  

### 5. Stress (`stress.js`)
- **Purpose**: Find breaking point and failure modes  
- **Load**: Continuously increase users until system fails  
- **Use case**: Understand maximum capacity, identify bottlenecks  
- **Metrics**: Breaking point, graceful degradation  

## Interpreting Results

After running a test, k6 outputs summary statistics:

```
checks.........................: 100.00% ✓ 1000  ✗ 0
data_received..................: 1.2 MB  12 kB/s
data_sent.......................: 450 kB  4.5 kB/s
http_req_blocked...............: avg=1.2ms  p(90)=2.1ms  p(95)=2.5ms
http_req_connecting............: avg=0.8ms  p(90)=1.5ms  p(95)=1.8ms
http_req_duration..............: avg=145ms  p(90)=280ms  p(95)=350ms  p(99)=420ms ← Key metric
http_req_failed................: 0.00% ✓ 0  ✗ 1000
http_req_receiving.............: avg=5.2ms  p(90)=8.1ms  p(95)=9.3ms
http_req_sending...............: avg=2.1ms  p(90)=3.5ms  p(95)=4.2ms
http_req_tls_handshaking.......: avg=0.0ms  p(90)=0.0ms  p(95)=0.0ms
http_req_waiting...............: avg=137ms  p(90)=270ms  p(95)=340ms  p(99)=410ms
http_reqs......................: 1000    10/s
iterations......................: 1000    10/s
vus............................: 10      min=10  max=10
vus_max........................: 10      min=10  max=10
```

**Key Metrics:**
- `http_req_duration` – Total response time (p95/p99 indicate percentiles)  
- `http_req_failed` – Percentage of failed requests  
- `checks` – Custom assertions pass/fail rate  
- `iterations` – Total completed test iterations  
- `http_reqs` – Requests per second (throughput)  

## Advanced Usage

### Run with k6 Cloud

Distribute tests across k6's cloud infrastructure for massive scale:

```bash
k6 cloud scripts/baseline.js
```

(Requires free k6 account at https://app.k6.io)

### Run Specific VU Scenarios

```bash
# 50 virtual users for 60 seconds
k6 run -u 50 -d 60s scripts/baseline.js

# Progressive ramp: 5→10→20→50 over 5 minutes
k6 run \
  --stage 1m:5 \
  --stage 2m:10 \
  --stage 3m:20 \
  --stage 5m:50 \
  scripts/ramp-up.js
```

### Generate JSON Results

```bash
k6 run scripts/baseline.js --out json=results/baseline.json
```

### View Real-time Summary (Web Dashboard)

```bash
k6 run scripts/baseline.js --summary-export=results/summary.json
```

## CI/CD Integration

Tests run automatically via GitHub Actions on a schedule:

- **Nightly**: Full performance suite (baseline + ramp-up + soak)  
- **On PR**: Baseline test only (quick regression check)  
- **Manual**: Trigger any test via workflow dispatch  

Results are uploaded as artifacts for historical trending.

### Workflow File

See `.github/workflows/performance.yml` for configuration.

## Troubleshooting

### "k6: command not found"
Ensure k6 is installed and in your PATH:
```bash
k6 version
```

### "Check failure" in results
If checks fail, verify:
- Target URL is reachable and correct
- API endpoints return expected response codes
- Server is not rate-limiting requests

### High error rates
- Increase `--rps` (requests per second) limit if needed
- Check server logs for issues
- Reduce concurrent users if server is overloaded

### Memory issues during soak test
- Reduce duration or virtual user count
- Check for connection leaks in your application

## Best Practices

1. **Start small** – Run baseline before spike/stress tests  
2. **Monitor your application** – Watch server metrics during tests  
3. **Test in isolation** – Avoid running tests during business hours  
4. **Set realistic thresholds** – Base SLAs on production data  
5. **Combine with monitoring** – Correlate k6 metrics with APM tools  
6. **Iterate** – Re-run tests after optimizations to measure impact  

## Resources

- [k6 Official Docs](https://k6.io/docs)  
- [k6 Community Forum](https://community.k6.io)  
- [GitHub Actions Integration](https://k6.io/docs/integrations/ci-cd/github-actions)  
- [k6 Examples](https://github.com/grafana/k6/tree/master/examples)  

## License

MIT

---

**Portfolio Note**: This project demonstrates understanding of non-functional QA testing, metrics interpretation, and CI/CD automation. Perfect complement to functional testing skills.
