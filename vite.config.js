// vite.config.js
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    viteSingleFile(),
  {
      // Custom plugin to inject Apps Script tags
      name: 'gas-scriptlet-injector',
      transformIndexHtml(html) {
        // Replace the string (including the quotes) with the unescaped GAS tag
        return html.replace(
          '"INJECT_SERVER_DATA_HERE"', 
          '<?!= SERVER_DATA ?>'
        );
      }
    }
  ],
  build: {
    minify: true,
    outDir: resolve(__dirname, 'dist/ui'),
  },
});