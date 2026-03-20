import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'process.env.NEXT_PUBLIC_GEMINI_API_KEY': JSON.stringify(env.NEXT_PUBLIC_GEMINI_API_KEY),
    },
    server: {
      port: 5173,
      open: true
    }
  };
});
