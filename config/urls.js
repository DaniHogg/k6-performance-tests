// config/urls.js
// Environment-driven URL configuration

const getBaseUrl = () => {
  const env = __ENV.ENV || 'staging';
  const urlMap = {
    dev: 'http://localhost:3000',
    staging: __ENV.BASE_URL || 'https://api-staging.example.com',
    prod: __ENV.BASE_URL || 'https://api.example.com',
  };
  
  return urlMap[env] || urlMap.staging;
};

export const config = {
  baseUrl: getBaseUrl(),
  apiEndpoint: __ENV.API_ENDPOINT || '/api/v1',
  timeout: __ENV.TIMEOUT || '30s',
};

export const urls = {
  base: config.baseUrl,
  users: `${config.baseUrl}${config.apiEndpoint}/users`,
  posts: `${config.baseUrl}${config.apiEndpoint}/posts`,
  comments: `${config.baseUrl}${config.apiEndpoint}/comments`,
  health: `${config.baseUrl}${config.apiEndpoint}/health`,
};
