// tests/utils/mock-gas-env.js
/**
 * Mock GAS environment for client-side business logic
 */

export const mockGASEnv = {
  // Server data injection
  __SERVER_DATA__: null,
  
  // Mock Google APIs
  googleapis: {
    drive: {},
    sheets: {}
  },
  
  appsscript: {},
  
  // Mock storage
  localStorage: {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
    clear() {}
  },
  
  // Mock cookies
  document: {
    cookie: null,
    getElementById() { return {}; }
  },
  
  // Mock fetch for API calls
  window: {
    fetch() {
      return Promise.resolve({
        ok: true,
        json() { return Promise.resolve({}); }
      });
    },
    location: {
      href: 'http://localhost/test'
    }
  }
};

export default mockGASEnv;