// @ts-nocheck
import { defineConfig, loadEnv, ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import inspect from 'vite-plugin-inspect'
import path from 'path';

export const aliases = {
  '@components': path.resolve(__dirname, 'src', 'components'),
  '@hooks': path.resolve(__dirname, 'src', 'hooks'),
  '@utils': path.resolve(__dirname, 'src', 'utils'),
  '@features': path.resolve(__dirname, 'src', 'features'),
  '@slices': path.resolve(__dirname, 'src', 'slices'),
  '@providers': path.resolve(__dirname, 'src', 'providers'),
  '@root': path.resolve(__dirname, 'src'),
}

export default ({ mode }: ConfigEnv) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const isProd = mode === 'production';

  const env: Record<string, string | undefined> = {};
  if (isProd) {
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('VITE_')) {
        env[`import.meta.env.${key}`] = process.env[key];
      }
    });
  }

  const plugins = [];
  
  plugins.push(...react());
  
  if(!isProd) plugins.push(inspect())

  return defineConfig({
    plugins,
    publicDir: './public',
    ...(isProd && { define: env }),
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: aliases,
    },
    server: {
      port: 3000,
      host: true,
    },
    build: {
      chunkSizeWarningLimit: 2500,
    },
    optimizeDeps: {
      include: [],
    },
  });
};
