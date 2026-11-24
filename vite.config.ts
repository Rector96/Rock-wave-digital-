import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    server: {
      // Keep HMR and file watching configurable for environments that disable them.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
