// vite.config.js (updated)
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { ViteNodeResolvePlugin, createVitePlugins } from 'vite-plugin-node-polyfills';

export default defineConfig(({ command, mode }) => {
  const isTest = mode === 'test';

  return {
    plugins: [
      // Production build plugin (only in prod mode)
      ...(command === 'build' && command !== 'serve' 
        ? [viteSingleFile()] 
        : []),

      // GAS scriptlet injector for production builds
      {
        name: 'gas-scriptlet-injector',
        transformIndexHtml(html) {
          return html.replace('"INJECT_SERVER_DATA_HERE"', '<?!= SERVER_DATA ?>');
        }
      },

      // Vitest plugin (only in test mode)
      ...(isTest ? [createVitePlugins(['vitest'])] : []),

      // GAS API polyfills for testing
      ViteNodeResolvePlugin({
        include: ['googleapis', 'drive', 'sheets']
      })
    ],

    build: {
      minify: true,
      outDir: resolve(__dirname, 'dist/ui'),
    },

    // Test-specific configuration
    test: {
      globals: true,                    // Enable global test APIs (beforeEach, it, etc.)
      environment: 'jsdom',             // Browser-like DOM for HTML elements
      setupFiles: ['./tests/setup.js'], // Global test setup
      coverage: {
        provider: 'istanbul',           // Coverage reporter
        reporter: ['text', 'json', 'lcov'],
        exclude: [
          '**/*.test.js',              // Exclude test files from coverage
          '**/tests/**/*.js'
        ]
      },

      // Environment variables for tests
      env: {
        ...process.env,                // Inherit environment
        VITE_ENV_MODE: 'test'          // Mark as test mode
      },

      // Handle GAS-specific setup
      includeSource: ['**/*.{js,ts,html}'],
    }
  };
});