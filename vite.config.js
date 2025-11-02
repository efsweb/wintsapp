//vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: path.join(__dirname, "src/renderer"),
  base: "./",
  build: {
    outDir: path.resolve(__dirname, "dist/renderer"),
    emptyOutDir: true,
    target: "esnext",
    rollupOptions: {
      input: path.resolve(__dirname, "src/renderer/index.html"),  // Definir o arquivo de entrada corretamente
      /*output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]"
      }*/
      external: [],
    },
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx"],  // Certifique-se de que o Vite reconhece .ts e .tsx
  },
});
