import { defineConfig } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { searchForWorkspaceRoot } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // React Compiler only in dev/build, not tests
    process.env.VITEST ? undefined : babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    fs: {
      allow: [
        // search up for workspace root
        searchForWorkspaceRoot(process.cwd()),
        // your custom rules
        '../../resources',
      ],
    },
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  }
})