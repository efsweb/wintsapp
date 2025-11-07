// src/main/main.ts

//** Imports **//
import ElectronShutdownHandler from '@paymoapp/electron-shutdown-handler';
import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, Notification } from "electron";

import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { SerialPort } from 'serialport';

import { checkInternetConnection } from './network.js';
import { findDevicePort, watchUSBDevices } from './usbports.js';
import { startMonitoring, stopMonitoring, registerMainWindow, sendCommandToNB, checkMode, setNotificationCallback } from './nbmonitor.js';

import { setAutoLaunch } from './utils/autolaunch.js';
import { generateHardwareId } from "./utils/hardware-id.js";
import { sendNotificationMail } from './utils/mail-sender.js';

import { exec } from "child_process";
import { createRequire } from "module";


//** Fim Imports **//

//** Variaveis **//
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const hardwareId = await generateHardwareId();

let closeDB: any;
let isQuiting = false;
let getLastEvents: any;
let tray: Tray | null = null;
let devicePort: Boolean = false;
let win: BrowserWindow | null = null;
let onNBEvent: ((title: string, body: string) => void) | null = null;


if (process.env.NODE_ENV === "development") {
  const electronReload = require("electron-reload");
  electronReload(path.join(__dirname, ".."), {
    electron: path.join(__dirname, "../../node_modules/.bin/electron"),
    awaitWriteFinish: true,
  });
}

//** Fim Variaveis **//

export function registerNBNotificationCallback(callback: (title: string, body: string) => void) {
  onNBEvent = callback;
}

export function showNotification(title: string, body: string) {
  new Notification({ title, body }).show();
}

async function createWindow() {
  
  win = new BrowserWindow({
    title: "TSApp Desktop",
    width: 800,
    height: 600,
    frame: true,
    closable: true,
    resizable: false,
    transparent: false,
    show: false, // <-- Inicia oculto quando false
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
    console.log('comando chamado');
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
    return getLastEvents();
  });

  if (process.env.NODE_ENV === "development") {
    await win.loadURL("http://localhost:5173/src/renderer/index.html");
    //win.webContents.openDevTools(); // abre o DevTools na janela Electron
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  win?.webContents.on("did-fail-load", (event, code, desc, url) => {
    console.error("❌ Falha ao carregar:", code, desc, url);
  });
}

let usbWatcher: { stop: () => void } | null = null;
function startUSBWatcher() {
  usbWatcher = watchUSBDevices((connected: boolean) => {
    devicePort = connected;
    if (win && !win.isDestroyed() && win.webContents) {
      //console.log('aquiiiii');
      showNotification(
        'NB Status',
        connected ? 'NB Conectado' : 'NB Disconectado'
      );
      win?.webContents.send('nb-status', connected); // emite evento pro renderer
    }

  });
}

app.whenReady().then(async () => {
  app.setAppUserModelId('br.com.tsappfordesktop');
  const dbPath = path.resolve(__dirname, "./utils/dbconn.js");

  const { getLastEvents: gl, saveEvent, setConfig, getConfig, cleanDatabase, closeDB: cdb } = 
  await import(process.platform === "win32" ? pathToFileURL(dbPath).href : dbPath);
  
  setNotificationCallback((title: string, body: string) => showNotification(title, body));

  getLastEvents = gl;
  closeDB = cdb;

  createWindow();
  createTray();
  win?.setSkipTaskbar(true);
  
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

  ipcMain.handle("autoLaunch", async (event, enable) => {
    await setAutoLaunch(enable);
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

  //win?.webContents.openDevTools({ mode: 'detach' }); //<-- abre o devtools janela independente
  //console.log("Hardware ID:", hardwareId);
  devicePort = await findDevicePort();
  startUSBWatcher();
  if(win){
    ElectronShutdownHandler.setWindowHandle(win.getNativeWindowHandle());
    ElectronShutdownHandler.blockShutdown('Please wait for some data to be saved');

    ElectronShutdownHandler.on('shutdown', () => {
      showNotification('Teste', 'desligando o sistema');
      console.log('Shutting down!');
      ElectronShutdownHandler.releaseShutdown();
      win?.webContents.send('shutdown');
      //app.quit();
    });
  }

  win?.on("close", (event) => {
    if (!isQuiting) {
      event.preventDefault();
      win?.hide();
    }
  });
});

app.on("window-all-closed", async () => {
  if (closeDB) await closeDB();
  if (usbWatcher && typeof usbWatcher.stop === "function") {
    usbWatcher.stop();
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

function createTray() {
  const iconFile = process.platform === 'darwin'
    ? 'icon-mac.png'
    : process.platform === 'win32'
    ? 'icon-win.png'
    : 'icon-linux.png';

  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, iconFile)
    : path.join(process.cwd(), 'build', iconFile); 

  const trayIcon = nativeImage.createFromPath(iconPath);
  
  tray = new Tray(trayIcon);
  tray.setToolTip("TSApp Desktop");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Mostrar janela",
      click: () => {
        if (win) {
          win.show();
          win.focus();
        }
      },
    },
    {
      label: "Sair",
      click: () => {
        isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // clique simples alterna mostrar/ocultar
  tray.on("click", () => {
    if (!win) return;
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  });
}


//export const NBID = hardwareId;









