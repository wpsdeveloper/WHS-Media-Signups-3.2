import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { normalizePath } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ command, mode }) => {
  const isTest = mode === 'test';

  return {
    plugins: [
      // Production single file bundle
      ...(command === 'build' ? [viteSingleFile()] : []),

      // Node Polyfills (handles Node built-in modules)
      nodePolyfills({
        include: ['buffer', 'process', 'util', 'stream'],
      }),
      // Copies uncompiled server files directly into dist/ on build
      viteStaticCopy({
        targets: [
          {
            src: normalizePath(resolve(__dirname, 'src/server/*.js')),
            dest: '.'
          },
          {
            src: normalizePath(resolve(__dirname, 'appsscript.json')),
            dest: 'dist'
          }
        ]
      })
    ],

    build: {
      target: 'es2015',
      cssCodeSplit: false,
      inlineDynamicImports: true,
      minify: false,
      outDir: resolve(__dirname, 'dist'),
    },
    root: 'src/client',
    server: {
      sourcemapIgnoreList: false
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.js'],
      coverage: {
        provider: 'istanbul',
        reporter: ['text', 'json', 'lcov'],
        exclude: ['**/*.test.js', '**/tests/**/*.js'],
      },
      env: {
        ...process.env,
        VITE_ENV_MODE: 'test',
      },
      includeSource: ['**/*.{js,ts,html}'],
    },
  };
});
