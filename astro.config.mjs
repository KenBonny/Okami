// @ts-check
import {defineConfig, envField} from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  },

  vite: {
    plugins: [tailwindcss()]
  },

    env: {
      schema: {
          PUBLIC_GOOGLE_CLIENT_ID: envField.string({context: "client", access: "public", optional: false})
      }
    }
});