import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      // The hosted preview supplies its own Vite runtime, so React Fast Refresh
      // must stay off when this app is served through the Express middleware.
      react({ fastRefresh: false }),
      tailwindcss(),
      {
        name: 'disable-preview-hmr-client',
        transformIndexHtml(html) {
          return html.replace(/<script[^>]+src=["']\/\@vite\/client["'][^>]*><\/script>/g, '');
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // The Express middleware server is not exposed as a Vite WebSocket endpoint
      // by the preview proxy, so disable the client HMR connector as well.
      hmr: false,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
