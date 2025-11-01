//vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from "path";

/*export default defineConfig({
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
});*/


export default defineConfig({
  plugins: [
    react(),
    electron({
      entry: path.resolve(__dirname, "src/main/main.ts"),
      onstart: async (options) => {
        //if (process.env.VITE_DEV_SERVER_URL) {
        //process.env.VITE_DEV_SERVER_URL = "http://localhost:5173";
        console.log("Electron plugin iniciado, mas sem criar janela extra.");
        //await options.startup();
        //}
      },
      vite: {
        build: {
          outDir: "dist/main",
          rollupOptions: {
            external: ["electron", "sqlite3", "serialport"],
            output: {
              format: "cjs",
            },
          },
          minify: false,
          sourcemap: false,
          commonjsOptions:{
            include: [/node_modules/],
          },
        },
      },
    }),
    
  ],
  root: path.join(__dirname, "src/renderer"),
  base: "./",
  build: {
    outDir: "dist/renderer",
    emptyOutDir: true,
  },
  /*esbuild: {
    loader: "jsx", // ✅ era aqui que o Vite esperava uma string
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx", // ✅ aqui sim pode ser objeto
        ".tsx": "tsx",
      },
    },
  },*/
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "src/renderer"),
    },
  },
});

