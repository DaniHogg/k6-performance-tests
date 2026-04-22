# k6 Performance Testing Suite

A production-ready performance testing framework using k6, designed for QA engineers and DevOps teams.

## Project Overview

This suite provides comprehensive performance testing scenarios:
- **Baseline** - Smoke test with minimal load (10 VUs)
- **Ramp-up** - Progressive user growth testing
- **Soak** - Extended load for leak detection
- **Spike** - Sudden traffic surge handling
- **Stress** - Breaking point discovery

## Why k6?

- **Modern** - Native JavaScript scripting, cloud-native
- **Fast** - Minimal overhead, built on Go
- **CI/CD Ready** - Perfect for GitHub Actions, GitLab CI, Jenkins
- **Developer Friendly** - Easy to write and maintain tests
- **Cost Effective** - Open source with optional cloud features

## Getting Started

1. Install k6: `brew install k6` (or see QUICKSTART.md)
2. Configure URLs: `cp .env.example .env` and edit
3. Run a test: `npm run test:baseline`

## Project Structure

```
scripts/
  baseline.js, ramp-up.js, soak.js, spike.js, stress.js
  shared/
    api-client.js  - Reusable HTTP client
    utils.js       - Helper functions
config/
  options.js       - Shared thresholds and scenarios
  urls.js          - Environment configuration
.github/workflows/
  performance.yml  - CI/CD automation
```

## Key Features

✓ Multiple test scenarios  
✓ Configurable thresholds (SLAs)  
✓ HTML reporting  
✓ GitHub Actions integration  
✓ k6 Cloud support  
✓ Modular, reusable components  
✓ Environment-driven config  

## Customization

**Modify thresholds** in `config/options.js` based on your SLAs.

**Add API endpoints** in `config/urls.js` for your target application.

**Create custom scenarios** by copying existing scripts and modifying the executor type.

**Adjust load levels** - edit stages in `scenarios` object for different VU counts and durations.

## CI/CD Integration

GitHub Actions workflow runs:
- **PR**: Baseline test (quick regression)
- **Nightly**: Full suite (all scenarios)
- **Manual**: Dispatch specific test

See `.github/workflows/performance.yml` for configuration.

## Portfolio Value

This project demonstrates:
- Non-functional testing expertise (performance, load, stress)
- Test automation and framework design
- CI/CD integration and DevOps mindset
- JavaScript/k6 proficiency
- Metrics interpretation and SLA management
- Production-ready code practices

Perfect complement to functional testing projects for QA engineer roles.

## Commands

```bash
make install           # Set up environment
make test-baseline     # Quick smoke test
make test-all          # Full suite
npm run test:json      # Save results
npm run report         # Generate HTML report
```

See Makefile or package.json for all available commands.

## Resources

- k6 Docs: https://k6.io/docs
- API Client: See `scripts/shared/api-client.js` for request patterns
- Examples: https://github.com/grafana/k6/tree/master/examples

---

**Next Steps:**
1. Update `BASE_URL` in `.env` to your test target
2. Customize endpoints in `config/urls.js`
3. Run `make test-baseline` to verify setup
4. Push to GitHub and enable Actions

Happy testing! 🚀
