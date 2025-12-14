import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animations: ['framer-motion'],
          icons: ['lucide-react'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    historyApiFallback: true,
    allowedHosts: [
      "9ee3bbf4-9f12-48da-bb61-c60d93de89cd-00-1wgfbgwwopyhr.spock.replit.dev",
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  publicDir: "public",
});
