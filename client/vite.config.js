import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
  ],
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
    port: 3000,        // Set server to use port 3000
    open: true,        // Open browser on server start
  },
  build: {
    outDir: 'build',   // Output to 'build' to mimic CRA structure
  },
});



//stare:
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import fs from 'fs';
// import basicSsl from '@vitejs/plugin-basic-ssl';
//
// export default defineConfig({
//   plugins: [
//     react(),
//     // basicSsl(), // Enables basic SSL for HTTPS
//   ],
//   define: {
//     global: 'globalThis',
//     'process.env': {},
//   },
//   resolve: {
//     alias: {
//       buffer: 'buffer',
//     },
//   },
//   server: {
//     https: {
//       key:fs.readFileSync("./key.pem"),
//       cert:fs.readFileSync("./cert.crt")
//     },
//     watch: {
//       usePolling: true, // Enable polling for changes
//     },
//     host: true,        // Listen on all network interfaces
//     strictPort: true,  // Fail if the port is already in use
//     port: 3000,        // Set server to use port 3000
//     open: true,        // Open browser on server start
//   },
//   build: {
//     outDir: 'build',   // Output to 'build' to mimic CRA structure
//   },
// });