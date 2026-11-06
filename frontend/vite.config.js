import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, path.resolve(import.meta.dirname, '..'), '');
  const localEnv = loadEnv(mode, import.meta.dirname, '');

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'import.meta.env.VITE_PROJECT_ID': JSON.stringify(
        localEnv.VITE_PROJECT_ID || rootEnv.VITE_PROJECT_ID || ''
      ),
      'import.meta.env.VITE_CONTRACT_ADDRESS': JSON.stringify(
        localEnv.VITE_CONTRACT_ADDRESS || rootEnv.VITE_CONTRACT_ADDRESS || ''
      ),
    },
  };
});
