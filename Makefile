# Makefile for k6 Performance Tests

.PHONY: help install test test-baseline test-ramp test-soak test-spike test-stress test-all test-cloud report clean

help:
	@echo "k6 Performance Testing - Available Commands"
	@echo ""
	@echo "  make install       - Install k6 and dependencies"
	@echo "  make test-baseline - Run baseline scenario (10 VUs, 30s)"
	@echo "  make test-ramp     - Run ramp-up scenario (1→50 VUs)"
	@echo "  make test-soak     - Run soak test (20 VUs, 5m)"
	@echo "  make test-spike    - Run spike test (sudden load surge)"
	@echo "  make test-stress   - Run stress test (progressive load)"
	@echo "  make test-all      - Run all scenarios"
	@echo "  make test-cloud    - Run on k6 Cloud"
	@echo "  make report        - Generate HTML report"
	@echo "  make clean         - Remove results and logs"
	@echo ""

install:
	@echo "Installing k6 and dependencies..."
	@command -v k6 >/dev/null 2>&1 || { echo "k6 not found. Installing..."; \
		if [ "$$(uname)" = "Darwin" ]; then \
			brew install k6; \
		elif [ "$$(uname)" = "Linux" ]; then \
			curl https://repos.insights.ubuntu.com/ubuntu/pubkey.gpg | sudo apt-key add -; \
			echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list; \
			sudo apt-get update && sudo apt-get install k6; \
		fi; }
	npm ci
	@echo "✓ Installation complete"

test-baseline:
	@echo "Running baseline test (10 VUs, 30s)..."
	k6 run scripts/baseline.js

test-ramp:
	@echo "Running ramp-up test (1→50 VUs)..."
	k6 run scripts/ramp-up.js

test-soak:
	@echo "Running soak test (20 VUs, 5m)..."
	k6 run scripts/soak.js

test-spike:
	@echo "Running spike test (sudden surge)..."
	k6 run scripts/spike.js

test-stress:
	@echo "Running stress test (0→400 VUs)..."
	k6 run scripts/stress.js

test-all: test-baseline test-ramp test-soak test-spike
	@echo "✓ All scenarios completed"

test-cloud:
	@echo "Running on k6 Cloud..."
	k6 cloud scripts/baseline.js

report:
	@echo "Generating HTML report..."
	npm run report
	@echo "✓ Report generated: results/index.html"

clean:
	@echo "Cleaning results..."
	rm -rf results/*.json results/*.html
	@echo "✓ Cleaned"

.DEFAULT_GOAL := help
