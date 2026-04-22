// scripts/ramp-up.js
// Ramp-up load test
// Purpose: Simulate realistic user growth, test behavior under increasing load
// Load: 1 → 25 → 50 users over 3 minutes

import { check, sleep } from 'k6';
import { ApiClient } from './shared/api-client.js';
import { assertStatus, generatePost, assertResponseTime } from './shared/utils.js';
import { baseOptions, scenarios } from '../config/options.js';
import { urls } from '../config/urls.js';

export const options = {
  ...baseOptions,
  thresholds: {
    ...baseOptions.thresholds,
    'http_req_duration': ['p(95)<800', 'p(99)<1500'],  // Relaxed for ramp-up
  },
  scenarios: {
    rampUp: scenarios.rampUp,
  },
};

const client = new ApiClient(urls.base, 150);

export default function () {
  // Simulate mixed user behavior
  const scenario = Math.random();

  if (scenario < 0.4) {
    // 40%: List and read posts
    const postsRes = client.get('/posts', { limit: 20 });
    assertStatus(postsRes, 200, 'List posts OK');
    
    // Simulate user reading posts
    sleep(1);
    
    const postId = Math.floor(Math.random() * 100) + 1;
    const postDetailRes = client.get(`/posts/${postId}`);
    check(postDetailRes, {
      'post detail request succeeds': (r) => r.status === 200 || r.status === 404,
    });
  } else if (scenario < 0.7) {
    // 30%: List users and comments
    const usersRes = client.get('/users', { limit: 50 });
    assertStatus(usersRes, 200, 'List users OK');
    
    const commentsRes = client.get('/comments', { limit: 30 });
    assertStatus(commentsRes, 200, 'List comments OK');
  } else {
    // 30%: Create post (if API supports it)
    const postPayload = generatePost();
    const createRes = client.post('/posts', postPayload);
    
    check(createRes, {
      'create post succeeds or auth fails': (r) => r.status === 201 || r.status === 401 || r.status === 400,
    });
    
    if (createRes.status === 201) {
      assertResponseTime(createRes, 1000, 'Create post < 1000ms');
    }
  }

  // Simulate user think time
  sleep(Math.random() * 2);
}
