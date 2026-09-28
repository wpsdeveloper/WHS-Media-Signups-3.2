// tests/utils/mock-gas-env.js
/**
 * Mock GAS environment for client-side business logic testing.
 * Provides stub implementations of Google Apps Script APIs and globals.
 */
export const mockGASEnv = {
  /** Serialized server data injected into the HTML template */
  __SERVER_DATA__: null,
  
  /** Mock of the googleapis object available in GAS */
  googleapis: {
    drive: {},
    sheets: {}
  },
  
  /** Mock of the appsscript global object */
  appsscript: {},
  
  /** Mock localStorage since GAS doesn't support it natively */
  localStorage: {
    /** @returns {null} Always returns null in mock */
    getItem() { return null; },
    /** No-op implementation */
    setItem() {},
    /** No-op implementation */
    removeItem() {},
    /** No-op implementation */
    clear() {}
  },
  
  /** Mock document object for DOM dependencies */
  document: {
    cookie: null,
    /** @returns {Object} Empty object as mock element */
    getElementById() { return {}; }
  },
  
  /** Mock window object with fetch API */
  window: {
    /**
     * Mocks fetch requests.
     * @returns {Promise<{ok: boolean, json: function(): Promise<Object>}>}
     */
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