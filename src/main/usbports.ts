// src/main/usbports.ts
import { SerialPort } from 'serialport';
import { saveEvent } from "./utils/dbconn.js";
import { generateHardwareId } from "./utils/hardware-id.js";
import { mqttStart, mqttSendCommand } from "./utils/mqtt-srv.js";

let currentPorts: string[] = [];
let onDeviceDisconnected: (() => void) | null = null;
let detectedPortPath: string | null = null;

export async function findDevicePort(): Promise<boolean> {
    const foundUSB = await scanUSB();
    if(foundUSB){
        return true;
    }
    scanMQTT();
    return false;
}

async function scanMQTT(): Promise<boolean>{
    let id = generateHardwareId();
    //mqttStart(id);
    
    setTimeout(() => {
        mqttSendCommand("I\r\n");
    }, 500);

    return false;
}

async function scanUSB(): Promise<boolean>{
    const ports = await SerialPort.list();

    for (const pinfo of ports) {
        const port = new SerialPort({
            path: pinfo.path,
            baudRate: 2400,
            autoOpen: false,
        });
        let chk = pinfo.path.toLowerCase();
        if(chk.includes("bluetooth") || chk.includes("blth")){
            continue;
        }
        //console.log(pinfo.path);

        try {
            await new Promise<void>((resolve, reject) => {
                port.open((err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            const result = await new Promise<string>((resolve, reject) => {
                //console.log('buscando result');
                let responseBuffer = '';
                let timeout = setTimeout(() => {
                    port.off('data', onData);
                    if (port.isOpen) port.close();
                    resolve(responseBuffer);
                }, 3000);

                const onData = (data: Buffer) => {
                    responseBuffer += data.toString();
                    console.log(`📦 Parcial recebida de ${pinfo.path}:`, data.toString());
                    if (responseBuffer.includes('TS')) {
                        clearTimeout(timeout);
                        port.off('data', onData);
                        if (port.isOpen) port.close();
                        resolve(responseBuffer);
                    }
                }
                port.on('data', onData);

                /*port.once('data', (data) => {
                    clearTimeout(timeout);
                    resolve(data.toString());
                });*/

                port.write('I\r\n', (err) => {
                    if (err) {
                        console.log("Error:    ", err);
                        clearTimeout(timeout);
                        port.off('data', onData);
                        reject(err);
                    }else{
                        //console.log('enviou o comando');
                    }
                });
            });

            //console.log(`Resposta da final ${pinfo.path}:`, result);

            if (result.includes('TS')) {
                //saveEvent({ event: "Comunicação OK" });
                //console.log('🎯 Dispositivo encontrado na porta:', pinfo.path);
                detectedPortPath = pinfo.path;
                return true;
            } else {
                if (port.isOpen) port.close();
            }

        } catch (err: any) {
            //console.error(`Erro na porta ${pinfo.path}:`, err.message);
        }
    }
    //saveEvent({ event: "Falha na Comunicação" });
    //console.log('❌ Nenhum dispositivo encontrado.');
    detectedPortPath = null;
    return false;
}

export function getCurrentDevicePort(): string | null {
    return detectedPortPath;
}

export function watchUSBDevices(onChange: (connected: boolean) => void) {
    let prevConnectedStatus = false;
    let currentPorts: string[] = [];
    const interval = setInterval(async () => {
        const ports = await SerialPort.list();
        const newPortPaths = ports.map(p => p.path);

        const added = newPortPaths.filter(p => !currentPorts.includes(p));
        const removed = currentPorts.filter(p => !newPortPaths.includes(p));

        const portsChanged = added.length > 0 || removed.length > 0;

        currentPorts = newPortPaths;

        if(portsChanged){
            if(prevConnectedStatus){
                saveEvent({ event: "Falha na comunicação" });
            }
            //console.log("🌀 Mudança nas portas detectada.");
        }

        if(portsChanged || !prevConnectedStatus){
            const found = await findDevicePort();

            if(found !== prevConnectedStatus){
                prevConnectedStatus = found;
                onChange(found);
            }
        }

        /*if (added.length > 0 || removed.length > 0) {
            console.log("🌀 Mudança nas portas detectada.");
            const found = await findDevicePort();
            onChange(found);
        }*/

    }, 9000);

    return {
        stop() {
            clearInterval(interval);
        }
    };
}

