// src/main/utils/autolaunch.ts
import { app } from 'electron';
import path from 'path';

export function setAutoLaunch(enable = true) {
  if (!app.isPackaged) {
    console.log("⚠️ Ignorando autoLaunch no modo dev (macOS bloqueia).");
    return;
  }

  //const exePath = process.execPath;
  //const appName = app.getName();

  const exePath = app.getPath('exe');
  const appName = app.getName();

  switch (process.platform) {
    case 'win32':
    case 'darwin':
      //console.log('ehre');
      // No Windows e macOS, o Electron já fornece suporte nativo
      app.setLoginItemSettings({
        openAtLogin: enable,
        path: exePath,
        args: [],
      });
      break;

    case 'linux':
      // No Linux, é necessário criar um .desktop em ~/.config/autostart/
      /*const fs = require('fs');
      const autostartDir = path.join(process.env.HOME, '.config', 'autostart');
      const desktopFile = path.join(autostartDir, `${appName}.desktop`);
      
      if (enable) {
        if (!fs.existsSync(autostartDir)) fs.mkdirSync(autostartDir, { recursive: true });

        const desktopEntry = `[Desktop Entry]
        Type=Application
        Name=${appName}
        Exec=${exePath}
        X-GNOME-Autostart-enabled=true`;
        fs.writeFileSync(desktopFile, desktopEntry);
      } else {
        if (fs.existsSync(desktopFile)) fs.unlinkSync(desktopFile);
      }*/
      break;

    default:
      console.warn('Plataforma não suportada para auto-start:', process.platform);
  }
}
