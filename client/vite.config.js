import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  server: {
    watch: {
      usePolling: true, // Enable polling for changes
    },
    host: true,        // Listen on all network interfaces
    strictPort: true,  // Fail if the port is already in use
    port: 3000,        // Set server to use port 8080
    open: true,        // Open browser on server start
  },
  build: {
    outDir: 'build',   // Output to 'build' to mimic CRA structure
  }
});