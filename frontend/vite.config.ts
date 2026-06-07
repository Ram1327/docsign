import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  // react-pdf requires the worker to be served as a static asset
  optimizeDeps: {
    include: ["react-pdf"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-pdf": ["react-pdf"],
        },
      },
    },
  },
});
