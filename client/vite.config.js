import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    react(),
    // basicSsl(), // Enables basic SSL for HTTPS
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
    https: {
      key:fs.readFileSync("./localhost.key"),
      cert:fs.readFileSync("./localhost.crt")
    },
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






// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import basicSsl from '@vitejs/plugin-basic-ssl';
// import mkcert from 'vite-plugin-mkcert'
//
// export default defineConfig({
//   plugins: [
//     react(),
//     mkcert(),
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
//     https: true,
//     //     {
//     //   // key: './certs/key.pem', // Path to the SSL private key
//     //   // cert: './certs/cert.crt', // Path to the SSL certificate
//     // },
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
