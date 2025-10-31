// src/main/main.ts
import { app, BrowserWindow, ipcMain } from "electron";
import { resolveModuleURL } from "./path-resolver.js";

//import { resolveModuleURL } from "../utils/path-helper.js";

import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { SerialPort } from 'serialport';

const ntPath = resolveModuleURL('main/network.js');
const { checkInternetConnection } = await import(ntPath);

const nmPath = resolveModuleURL('main/nbmonitor.js');
const { startMonitoring, stopMonitoring, registerMainWindow, sendCommandToNB, checkMode } = await import(nmPath);

const upPath = resolveModuleURL('main/usbports.js');
const { findDevicePort, watchUSBDevices } = await import(upPath);

const genHDPath = resolveModuleURL('utils/hardware-id.js');
const { generateHardwareId } = await import(genHDPath);
const hardwareId = await generateHardwareId();

import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { createRequire } from "module";
const require = createRequire(import.meta.url);

let getLastEvents: any;
let closeDB: any;

if (process.env.NODE_ENV === "development") {
  const electronReload = require("electron-reload");
  electronReload(path.join(__dirname, ".."), {
    electron: path.join(__dirname, "../../node_modules/.bin/electron"),
    awaitWriteFinish: true,
  });
}

let win: BrowserWindow | null = null;
let devicePort: Boolean = false;

async function createWindow() {
  win = new BrowserWindow({
    title: "TSApp Desktop",
    width: 1200,
    height: 600,
    frame: true,
    closable: true,
    resizable: false,
    transparent: false,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'), // Adjust path as needed
      contextIsolation: true, // Recommended for security
      nodeIntegration: true, // Recommended for security
    },
  });

  registerMainWindow(win, hardwareId);

  ipcMain.handle('ping', () => 'pong');

  ipcMain.handle('get-internet-status', async () => {
    const isOnline = await checkInternetConnection();
    return isOnline;  // Retorna o status da internet ao renderer
  });

  ipcMain.handle('get-mode-status', async () => {
    const isMode = await checkMode();
    return isMode;  // Retorna o status da internet ao renderer
  });

  ipcMain.handle('get-nb-status', async () => {
    return devicePort;
  });

  ipcMain.handle('start-monitoring', async() => {
    await startMonitoring();
    return true;
  });

  ipcMain.handle('stop-monitoring', async() => {
    await stopMonitoring();
    return true;
  });

  ipcMain.handle('nb-cmd', async(_event, cmd: string) => {
    try{
      const ok = sendCommandToNB(cmd);
      return true;
    }catch(err){
      console.error("ERR: " + err);
      return { success: false, error: err };
    }
  });

  ipcMain.handle('hardwareid', async() => {
    return hardwareId;
  });

  ipcMain.handle('bdconn', async() => {
    //const { getLastEvents } = await "../utils/dbconn.js";
    return getLastEvents();
  });

  if (process.env.NODE_ENV === "development") {
    try {
      //await win.loadURL(process.env.VITE_DEV_SERVER_URL);
      await win.loadURL("http://localhost:5173/src/renderer/index.html");
      win.webContents.openDevTools();
    } catch (err) {
      console.error("Falha ao carregar URL do Vite dev:", err);
    }
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

function startUSBWatcher() {
  watchUSBDevices((connected: boolean) => {
    devicePort = connected;
    if (win && !win.isDestroyed() && win.webContents) {
      win?.webContents.send('nb-status', connected); // emite evento pro renderer
    }
  });
}

app.whenReady().then(async () => {
  const dbPath = resolveModuleURL("utils/dbconn.js"); //path.resolve(__dirname, "../utils/dbconn.js");
  const { getLastEvents: gl, saveEvent, setConfig, getConfig, cleanDatabase, closeDB: cdb } = await import(dbPath);
  
  getLastEvents = gl;
  closeDB = cdb;

  createWindow();

  // Registra IPCs do banco depois do import
  ipcMain.handle("db:getLastEvents", async (_, limit = 20) => {
    return gl(limit);
  });

  ipcMain.handle("db:saveEvent", async (_, eventData) => {
    return saveEvent(eventData);
  });

  ipcMain.handle("db:getConfig", async (_) => {
    return getConfig();
  });

  ipcMain.handle("db:setConfig", async (_, eventData) => {
    return setConfig(eventData);
  });

  ipcMain.handle("db:clean", async () => {
    return cleanDatabase();
  });

  ipcMain.handle("db:closeDB", async () => {
    return cdb();
  });

  ipcMain.handle("system:shutdown", async () => {
    const plat = process.platform;
    let cmd = "";
    if(plat === 'win32'){
      cmd = 'shutdown /s /t 0';
    }else if(plat === 'darwin'){
      cmd = `osascript -e 'tell app "System Events" to shut down'`;
    }else if(plat === 'linux'){
      cmd = "shutdown -h now";
    }

    return new Promise((resolve, reject) => {
      exec(cmd, (error) => {
        if(error){
          console.log('Erro ao tentar desligar: ', error);
          reject(error);
        }else{
          resolve('Desligando o sistema...');
        }
      });
    });
  });

  //console.log("Hardware ID:", hardwareId);
  devicePort = await findDevicePort();
  startUSBWatcher();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

app.on("window-all-closed", async () => {
  if (closeDB) await closeDB();
  if (typeof watchUSBDevices.stop === "function") {
    watchUSBDevices.stop();
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

//export const NBID = hardwareId;










