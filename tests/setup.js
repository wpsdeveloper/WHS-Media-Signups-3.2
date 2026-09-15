// tests/setup.js
/**
 * Set up global test environment for Google Apps Script
 * Mocks server-side APIs and configures test globals
 */

import { vi, beforeEach } from 'vitest';

// 1. Mock GAS Server Data Injection
window.__SERVER_DATA__ = JSON.stringify({
  viewState: { view: 'attendance', data: {} },
  globals: {
    LOGO_ID: '',
    SCRIPT_URL: '',
    WED_INT_ACTIVE: true,
  }
});

// 2. Mock Google Apps Script APIs (for business logic tests)
const mockDrive = vi.fn();
const mockSheets = vi.fn();
const mockAppsScript = vi.fn();

global.googleapis = {
  drive: mockDrive,
  sheets: mockSheets
};

global.appsscript = {
  AppsScript: mockAppsScript
};

// 3. Mock fetch/axios for API calls
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
console.error = console.warn; // Reduce noise during tests

// 6. Mock localStorage (GAS doesn't support it natively)
global.localStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

// 7. Mock navigator for browser APIs
window.navigator = {
  userAgent: 'Mozilla/5.0'
};