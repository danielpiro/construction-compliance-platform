import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Use Node.js path module correctly with __dirname
import * as path from "path";
import { fileURLToPath } from "url";

// Create __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
