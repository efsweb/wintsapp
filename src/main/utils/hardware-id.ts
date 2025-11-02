// ✅ Tudo via import (sem require)
import os from "os";
import crypto from "crypto";
import { exec } from "child_process";
import { promisify } from "util";
//import si from "systeminformation";

const execAsync = promisify(exec);

async function commandExists(cmd: string): Promise<boolean> {
  try {
    await execAsync(`where ${cmd}`);
    return true;
  } catch {
    return false;
  }
}

// Função auxiliar: tenta pegar o serial do disco
async function getDiskSerial(): Promise<string> {
  try {
    let command: string = "";

    switch (process.platform) {
      case "win32":
        const hasWmic = await commandExists("wmic");

        if (hasWmic) {
          try {
            const { stdout } = await execAsync("wmic diskdrive get SerialNumber");
            const match = stdout.match(/[A-Za-z0-9_-]+/);
            if (match) return match[0].trim();
          } catch {
            // tenta o próximo método
          }
        }

        const hasPowerShell = await commandExists("powershell");
        if (hasPowerShell) {
          try {
            // Tenta Storage API (Windows 8+)
            const { stdout } = await execAsync(
              'powershell -NoProfile -Command "Get-PhysicalDisk | Select -ExpandProperty SerialNumber"'
            );
            const match = stdout.match(/[A-Za-z0-9_-]+/);
            console.log("veioooo");
            return match ? match[0].trim() : "UNKNOWN";
          } catch {
            // Fallback: WMI antigo
            const { stdout } = await execAsync(
              'powershell -NoProfile -Command "Get-WmiObject Win32_DiskDrive | Select -ExpandProperty SerialNumber"'
            );
            const match = stdout.match(/[A-Za-z0-9_-]+/);
            return match ? match[0].trim() : "UNKNOWN";
          }
        }

        // Último recurso: Volume ID
        try {
          const { stdout } = await execAsync("vol C:");
          const match = stdout.match(/ ([A-Za-z0-9_-]{8,})/i);
          if (match) return match[1];
        } catch {
          return "UNKNOWN";
        }
        break;
      case "darwin":
        command = "system_profiler SPHardwareDataType | grep 'Serial Number'";
        break;
      case "linux":
        command = "udevadm info --query=all --name=/dev/sda | grep ID_SERIAL_SHORT";
        break;
      default:
        return "UNKNOWN";
    }

    const { stdout } = await execAsync(command);
    const match = stdout.match(/([A-Z0-9]+(-[A-Z0-9]+)?)/i);
    return match ? match[0].trim() : "UNKNOWN";
  } catch (err) {
    console.error("Erro ao obter serial do disco:", err);
    return "ERROR";
  }
}

// ✅ Principal função exportada
export async function generateHardwareId(): Promise<string> {
  const serial = await getDiskSerial();
  const hostname = os.hostname();
  
  const raw = `${serial}-${hostname}`;
  const hash = crypto.createHash("sha256").update(raw).digest("hex").slice(0, 12);
  return hash.toUpperCase().replace(/(.{4})/g, "$1-").slice(0, 14);
}
