import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://agrica-project-1.onrender.com",
        changeOrigin: true
      },
      "/uploads": {
        target: "https://agrica-project-1.onrender.com",
        changeOrigin: true
      }
    }
  }
});

