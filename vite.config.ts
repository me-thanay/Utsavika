import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
      "/local": {
        target: "http://localhost:8787",
        changeOrigin: true,
        // keep path as /local/* so it hits the server's /local/* routes
      },
      "/admin": {
        target: "http://localhost:8787",
        changeOrigin: true,
        // keep path as /admin/* so it hits the server's /admin/* routes
      },
      "/notify-order": {
        target: "http://localhost:8787",
        changeOrigin: true,
        // keep path as /notify-order so it hits the server's /notify-order route
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
