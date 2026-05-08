// config/urls.js
// Environment-driven URL configuration
// Default target: the deployed QA Portfolio API on Render.
// Override with BASE_URL env var: k6 run -e BASE_URL=http://localhost:8000 scripts/baseline.js

const getBaseUrl = () => {
  const env = __ENV.ENV || 'prod';
  const urlMap = {
    dev: __ENV.BASE_URL || 'http://localhost:8000',
    prod: __ENV.BASE_URL || 'https://qa-portfolio-api.onrender.com',
  };

  return urlMap[env] || urlMap.prod;
};

export const config = {
  baseUrl: getBaseUrl(),
  timeout: __ENV.TIMEOUT || '30s',
};

// Relative paths — used directly with ApiClient, which prepends config.baseUrl.
// The Render API has no version prefix; endpoints are at the root.
export const urls = {
  base: config.baseUrl,
  health: '/health',
  users: '/users',
  posts: '/posts',
  // The Render API exposes comments via /posts/{id}/comments, not /comments.
  // Scripts that need comments should use client.get(`/posts/${id}/comments`).
};
