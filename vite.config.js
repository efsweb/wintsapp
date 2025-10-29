//vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: path.join(__dirname, "src/renderer"),
  base: "./",
  build: {
    outDir: "dist/renderer",
    emptyOutDir: true,
    target: "esnext",
    rollupOptions: {
      input: path.resolve(__dirname, "src/renderer/index.html"),  // Definir o arquivo de entrada corretamente
    },
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],  // Certifique-se de que o Vite reconhece .ts e .tsx
  },
});
