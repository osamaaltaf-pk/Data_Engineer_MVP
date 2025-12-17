import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // @ts-ignore
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // @ts-ignore
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    server: {
      host: true
    }
  };
});