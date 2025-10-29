// ✅ Tudo via import (sem require)
import os from "os";
import crypto from "crypto";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Função auxiliar: tenta pegar o serial do disco
async function getDiskSerial(): Promise<string> {
  try {
    let command: string;

    switch (process.platform) {
      case "win32":
        command = "wmic diskdrive get SerialNumber";
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
