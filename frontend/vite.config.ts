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
        // Forward Authorization header so protected file endpoints work
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            const auth = (req as { headers: Record<string, string> }).headers["authorization"];
            if (auth) proxyReq.setHeader("Authorization", auth);
          });
        },
      },
    },
  },
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
