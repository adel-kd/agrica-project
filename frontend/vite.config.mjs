import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://agrica-ethiopia.onrender.com",
        // target: "http://localhost:5001",

        changeOrigin: true
      },
      "/uploads": {
        target: "https://agrica-ethiopia.onrender.com",
        // target: "http://localhost:5001",

        changeOrigin: true
      }
    }
  }
});

