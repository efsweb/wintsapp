// src/utils/path-helper.ts
import path from "path";
import { app } from "electron";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function resolveModulePath(relPath: string) {
  const isDev = !app.isPackaged;

  const basePath = isDev
    ? path.join(__dirname, "..") // → src/
    : path.join(app.getAppPath(), "dist"); // dentro do app.asar/dist/

  return path.normalize(path.join(basePath, relPath));
}

export function resolveModuleURL(relPath: string) {
  return pathToFileURL(resolveModulePath(relPath)).href;
}
