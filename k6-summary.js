// k6-summary.js
// Generate HTML report from k6 JSON output

const fs = require('fs');
const path = require('path');

const resultsDir = 'results';
const reportFile = path.join(resultsDir, 'index.html');

function generateReport() {
  // Check if results exist
  const jsonFile = path.join(resultsDir, 'baseline.json');
  
  if (!fs.existsSync(jsonFile)) {
    console.log('No results found. Run tests first: npm run test:json');
    return;
  }

  // Parse k6 JSON output
  const data = fs.readFileSync(jsonFile, 'utf-8');
  const lines = data.split('\n').filter(l => l.trim());
  
  // Extract metrics (simplified parsing)
  let avgResponseTime = 0;
  let maxResponseTime = 0;
  let failureRate = 0;
  let requestCount = 0;

  lines.forEach(line => {
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'Point' && obj.metric === 'http_req_duration') {
        maxResponseTime = Math.max(maxResponseTime, obj.data.value);
      }
      if (obj.type === 'Point' && obj.metric === 'http_req_failed') {
        failureRate = obj.data.value;
      }
    } catch (e) {
      // Ignore parse errors
    }
  });

  // Generate HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>k6 Performance Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 {
      font-size: 2em;
      margin-bottom: 10px;
    }
    .header p {
      opacity: 0.9;
      font-size: 1.1em;
    }
    .content {
      padding: 40px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      border-radius: 8px;
    }
    .metric-card h3 {
      color: #667eea;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .metric-card .value {
      font-size: 2em;
      font-weight: bold;
      color: #333;
    }
    .metric-card .unit {
      color: #999;
      font-size: 0.9em;
      margin-left: 5px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }
    .info-box {
      background: #e8f4f8;
      border-left: 4px solid #06a8d5;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 15px;
    }
    .info-box strong {
      color: #06a8d5;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
    .status-pass { color: #28a745; }
    .status-warn { color: #ffc107; }
    .status-fail { color: #dc3545; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>k6 Performance Test Report</h1>
      <p>Performance Metrics Summary</p>
    </div>
    
    <div class="content">
      <div class="metrics-grid">
        <div class="metric-card">
          <h3>Max Response Time</h3>
          <div class="value">${maxResponseTime.toFixed(0)}<span class="unit">ms</span></div>
        </div>
        <div class="metric-card">
          <h3>Failure Rate</h3>
          <div class="value ${failureRate === 0 ? 'status-pass' : 'status-warn'}">${(failureRate * 100).toFixed(2)}<span class="unit">%</span></div>
        </div>
        <div class="metric-card">
          <h3>Test Time</h3>
          <div class="value">${new Date().toLocaleString()}</div>
        </div>
      </div>

      <div class="section">
        <h2>Test Summary</h2>
        <div class="info-box">
          <strong>Baseline Scenario:</strong> 10 concurrent users for 30 seconds
        </div>
        <p>This report was generated from k6 JSON output. See results/ directory for raw metrics.</p>
      </div>

      <div class="section">
        <h2>Next Steps</h2>
        <ul style="margin-left: 20px; line-height: 1.8;">
          <li>Review full metrics in <code>results/baseline.json</code></li>
          <li>Run additional scenarios: <code>npm run test:ramp-up</code></li>
          <li>Compare trends across multiple test runs</li>
          <li>Integrate with k6 Cloud for historical tracking</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p>Generated by k6 Performance Test Suite | <a href="https://k6.io" style="color: #667eea; text-decoration: none;">Learn more about k6</a></p>
    </div>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(reportFile, html);
  console.log(`✓ HTML report generated: ${reportFile}`);
}

generateReport();
