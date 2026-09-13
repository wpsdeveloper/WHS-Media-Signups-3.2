// vitest.config.js (alternative approach)
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // ... existing config ...

  test: {
    globals: true,
    environment: 'jsdom',
    
    coverage: {
      include: ['src/**/*.{js,ts}'],   // Files to measure
      exclude: [
        '**/*.test.js',
        '**/node_modules/**',
        '**/dist/**'
      ],
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      thresholds: {
        lines: 80,              // Target line coverage
        functions: 85,          // Target function coverage
        branches: 75,           // Target branch coverage
        statements: 75
      },
      all: true                 // Show progress during test run
    }
  }
});