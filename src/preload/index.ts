// src/preload/index.ts
import { contextBridge, ipcRenderer } from "electron";

// Expondo a API para o contexto da janela renderizada
contextBridge.exposeInMainWorld("electronAPI", {
  onNBStatus: (callback: (status: boolean) => void) => {
    const listener = (_event: any, status: boolean) => callback(status);
    ipcRenderer.on('nb-status', listener);
    return () => ipcRenderer.removeListener('nb-status', listener);
  },

  onNBData: (callback: (data: any) => void) => ipcRenderer.on('nb-data', (event, data) => callback(data)),
  
  sendNBCommand: (cmd: string) => ipcRenderer.invoke("nb-cmd", cmd),
  getInternetStatus: () => ipcRenderer.invoke('get-internet-status'),
  startMonitoring: () => ipcRenderer.invoke('start-monitoring'),
  stopMonitoring: () => ipcRenderer.invoke('stop-monitoring'),
  getModeStatus: () => ipcRenderer.invoke('get-mode-status'),
  getNBStatus: () => ipcRenderer.invoke('get-nb-status'),
  getNBID: () => ipcRenderer.invoke('hardwareid'),
  ping: () => ipcRenderer.invoke('ping'),
  platform: process.platform,

  //dbconn: () => ipcRenderer.invoke('bdconn'),
  db: {
    getLastEvents: (limit = 20) =>
      ipcRenderer.invoke("db:getLastEvents", limit),

    saveEvent: (eventData: any) =>
      ipcRenderer.invoke("db:saveEvent", eventData),

    getConfig: () =>
      ipcRenderer.invoke("db:getConfig"),

    setConfig: (eventData: any) =>
      ipcRenderer.invoke("db:setConfig", eventData),

    clean: () => ipcRenderer.invoke("db:clean"),

    close: () => ipcRenderer.invoke("db:closeDB"),
  },

});

