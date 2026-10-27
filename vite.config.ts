/// <reference types="vitest/config" />
import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** The site is served from https://mautyn.github.io/Vollyguide/. */
export const PAGES_BASE = '/Vollyguide/';

/**
 * GitHub Pages serves 404.html for unknown paths. Making it a copy of index.html
 * lets deep links such as /Vollyguide/court load the app, which then routes them.
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    async writeBundle(options) {
      const dir = options.dir ?? 'dist';
      await copyFile(join(dir, 'index.html'), join(dir, '404.html'));
    },
  };
}

export default defineConfig(({ command, isPreview }) => ({
  // `vite preview` runs with command 'serve' but must serve the build under the same base.
  base: command === 'build' || isPreview ? PAGES_BASE : '/',
  plugins: [react(), spaFallback()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
}));
