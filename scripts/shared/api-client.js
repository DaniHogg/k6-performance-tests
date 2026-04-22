// scripts/shared/api-client.js
// Reusable HTTP client with common request patterns

import http from 'k6/http';
import { check, sleep } from 'k6';

export class ApiClient {
  constructor(baseUrl, defaultThinkTime = 100) {
    this.baseUrl = baseUrl;
    this.defaultThinkTime = defaultThinkTime;
    this.headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'k6/performance-test',
    };
  }

  /**
   * Authenticate and set bearer token
   */
  async authenticate(email, password) {
    const res = http.post(`${this.baseUrl}/auth/login`, JSON.stringify({
      email,
      password,
    }), {
      headers: this.headers,
      timeout: '30s',
    });

    check(res, {
      'auth: status is 200': (r) => r.status === 200,
      'auth: has token': (r) => r.body.includes('token'),
    });

    if (res.status === 200) {
      const body = JSON.parse(res.body);
      this.headers['Authorization'] = `Bearer ${body.token}`;
    }

    return res;
  }

  /**
   * GET request
   */
  get(endpoint, params = {}) {
    const url = this._buildUrl(endpoint, params);
    const res = http.get(url, {
      headers: this.headers,
      timeout: '30s',
    });
    this._thinkTime();
    return res;
  }

  /**
   * POST request
   */
  post(endpoint, payload = {}) {
    const url = this._buildUrl(endpoint);
    const res = http.post(url, JSON.stringify(payload), {
      headers: this.headers,
      timeout: '30s',
    });
    this._thinkTime();
    return res;
  }

  /**
   * PUT request
   */
  put(endpoint, payload = {}) {
    const url = this._buildUrl(endpoint);
    const res = http.put(url, JSON.stringify(payload), {
      headers: this.headers,
      timeout: '30s',
    });
    this._thinkTime();
    return res;
  }

  /**
   * DELETE request
   */
  delete(endpoint) {
    const url = this._buildUrl(endpoint);
    const res = http.del(url, {
      headers: this.headers,
      timeout: '30s',
    });
    this._thinkTime();
    return res;
  }

  /**
   * Batch multiple requests
   */
  batch(requests) {
    const batch = {};
    requests.forEach((req, idx) => {
      batch[idx.toString()] = [req.method, `${this.baseUrl}${req.endpoint}`, null, {
        headers: this.headers,
      }];
    });
    const results = http.batch(batch);
    this._thinkTime();
    return results;
  }

  /**
   * Build full URL with query params
   */
  _buildUrl(endpoint, params = {}) {
    let url = `${this.baseUrl}${endpoint}`;
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Simulate user think time between requests
   */
  _thinkTime() {
    sleep(this.defaultThinkTime / 1000);
  }

  /**
   * Set custom header
   */
  setHeader(key, value) {
    this.headers[key] = value;
  }

  /**
   * Clear all custom headers
   */
  clearHeaders() {
    this.headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'k6/performance-test',
    };
  }
}
