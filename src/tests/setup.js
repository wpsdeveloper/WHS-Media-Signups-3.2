// tests/setup.js
/**
 * Set up global test environment for Google Apps Script
 * Mocks server-side APIs and configures test globals
 */

import { vi, beforeEach } from 'vitest';

// 1. Mock GAS Server Data Injection
/** @type {string} Serialized server data for view state and globals */
window.__SERVER_DATA__ = JSON.stringify({
  viewState: { view: 'attendance', data: {} },
  globals: {
    LOGO_ID: '',
    SCRIPT_URL: '',
    WED_INT_ACTIVE: true,
  }
});

// 2. Mock Google Apps Script APIs (for business logic tests)
/** @type {import('vitest').Mock} Mock drive API */
const mockDrive = vi.fn();
/** @type {import('vitest').Mock} Mock sheets API */
const mockSheets = vi.fn();
/** @type {import('vitest').Mock} Mock apps script API */
const mockAppsScript = vi.fn();

/** @type {Object} Global googleapis mock */
global.googleapis = {
  drive: mockDrive,
  sheets: mockSheets
};

/** @type {Object} Global appsscript mock */
global.appsscript = {
  AppsScript: mockAppsScript
};

// 3. Mock fetch/axios for API calls
/** @type {import('vitest').Mock} Mock global fetch */
window.fetch = vi.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: {} })
  })
);

// 4. Set up environment variables
process.env.VITE_ENV_MODE = 'test';
process.env.LOGO_ID = '';
process.env.SCRIPT_URL = '';

// 5. Enable test-specific console behavior
/** Use console.warn instead of console.error to reduce noise during tests */
console.error = console.warn; 

// 6. Mock localStorage (GAS doesn't support it natively)
/** @type {Object} Global localStorage mock */
global.localStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

// 7. Mock navigator for browser APIs
/** @type {Object} Global navigator mock */
window.navigator = {
  userAgent: 'Mozilla/5.0'
};