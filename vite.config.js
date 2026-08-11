import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'child_process';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function autoBackendPlugin() {
  let backendProcess = null;

  return {
    name: 'auto-backend-server',
    configureServer(server) {
      // Check if backend is already running on port 5000
      const req = http.get('http://127.0.0.1:5000/api/health', () => {
        // Already running
      });

      req.on('error', () => {
        // Backend is not running -> start it automatically
        console.log('\n🚀 [Auto-Backend] Automatically starting Backend Server on http://localhost:5000...');
        const backendDir = path.resolve(__dirname, '../Backend');
        backendProcess = spawn(process.execPath, ['server.js'], {
          cwd: backendDir,
          stdio: 'inherit',
        });

        backendProcess.on('error', (err) => {
          console.error('❌ [Auto-Backend] Failed to start backend process:', err.message);
        });
      });

      const cleanup = () => {
        if (backendProcess) {
          try {
            backendProcess.kill();
          } catch (e) {}
        }
      };

      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
      process.on('exit', cleanup);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), autoBackendPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            // Gracefully handle initial startup before backend is ready without terminal noise
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                success: false, 
                message: 'Backend server is initializing, please retry in a second.' 
              }));
            }
          });
        },
      },
    },
  },
});


