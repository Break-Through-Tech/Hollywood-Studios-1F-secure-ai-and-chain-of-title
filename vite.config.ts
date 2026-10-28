import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { apiDevPlugin } from './dev/api-dev-plugin.ts';

export default defineConfig({
  plugins: [react(), apiDevPlugin()],
});
