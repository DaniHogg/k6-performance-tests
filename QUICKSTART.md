# Quick Start Guide for k6 Performance Tests

This is a quick reference for getting started with the k6 performance testing suite.

## Installation

### 1. Install k6

**macOS:**
```bash
brew install k6
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows (Chocolatey):**
```bash
choco install k6
```

**Or download:** https://k6.io/docs/getting-started/installation

### 2. Verify Installation

```bash
k6 version
```

### 3. Install Node Dependencies

```bash
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your target URLs
```

## Run Tests

### Individual Scenarios

```bash
# Baseline (10 VUs, 30s) - Quick smoke test
npm run test:baseline

# Ramp-up (1→50 VUs, 3m) - Growth simulation
npm run test:ramp-up

# Soak (20 VUs, 5m) - Memory/leak detection
npm run test:soak

# Spike (5→100 VUs) - Surge recovery
npm run test:spike

# Stress (0→400 VUs) - Breaking point
npm run test:stress
```

### Run All Tests

```bash
npm run test:all
```

### With JSON Output (for reporting)

```bash
npm run test:json
npm run report
```

### k6 Cloud (distributed testing)

```bash
npm run test:cloud
```

Requires free account at https://app.k6.io

## Understand Results

Key metrics to look for:

```
http_req_duration - Response time (p95, p99 important)
http_req_failed   - Error rate percentage
http_reqs         - Throughput (requests/second)
iterations        - Total iterations completed
checks            - Custom assertions pass/fail
```

Targets in `config/options.js`:
- p95 response time < 500ms
- Error rate < 5%
- Custom checks > 95% pass

## Tips

1. **Test locally first** with baseline before running larger scenarios
2. **Monitor your app** during tests (watch server logs, metrics)
3. **Adjust URLs** in `.env` for different environments
4. **Modify thresholds** based on your SLAs in `config/options.js`
5. **Save results** with `--out json=results/test.json` for trending

## Troubleshooting

**k6: command not found** → Ensure k6 is installed and in PATH
**Connection refused** → Check BASE_URL in .env is correct
**High error rate** → Reduce VUs or check server logs

## Resources

- k6 Docs: https://k6.io/docs
- Examples: https://github.com/grafana/k6/tree/master/examples
- Community: https://community.k6.io

Enjoy! 🚀
