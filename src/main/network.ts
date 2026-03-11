// src/main/network.ts
import https from 'https';
import axios from "axios";
import wifi from "node-wifi";

wifi.init({ iface: null }); //inicia busca pelo wifi da firmware TS-253

interface WifiConnectionFixed {
    ssid?: string;
    ip_address?: string;
    [key: string]: any; // <- permite qualquer outro campo sem erro TS
}

// Função para verificar a conexão com a internet
export async function checkInternetConnection(): Promise<boolean> {
    return new Promise((resolve) => {
        https.get('https://www.google.com/favicon.ico', (res) => {
            // Se o status da resposta for 200 (OK), retornamos verdadeiro
            resolve(res.statusCode === 200);
        }).on('error', (err) => {
            resolve(false); // Caso ocorra erro na requisição, retornamos falso
        });
    });
}

async function refreshScan() {
    wifi.init({ iface: null }); // reinicializa lib → força SO a atualizar estado
    await new Promise(r => setTimeout(r, 300)); // tempo pro OS atualizar cache
    return wifi.scan();
}

//Busca rede AP da TS-253
export async function findFirmware(){
    //console.log('buscando rede');
    try{
        await refreshScan();
        const networks = await wifi.scan();
        return networks.find((net: any) => net.ssid === 'TS_NET_COM') || null;
        //return 'ahhahah';
    }catch (err) {
        //console.error("Erro ao escanear redes:", err);
        return null;
    }
}

async function chkNetwork(): Promise<string | null>{
    try {
        const connections = await wifi.getCurrentConnections();

        if (connections.length > 0 && connections[0].ssid) {
            //console.log(connections[0].ssid);
            return connections[0].ssid;
        }
        //console.log('Sem WIFI');
        return null;
    } catch (err) {
        //console.error("Erro ao obter rede atual:", err);
        return null;
    }
}

async function waitNetworkReady(ms = 2000) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitIP(timeout = 2000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const conn = await wifi.getCurrentConnections() as WifiConnectionFixed[];
        if (conn.length > 0 && conn[0].ip_address) return true;
        await waitNetworkReady(300);
    }
}

//Faz o Handshake entre TS-253 e Desktop
let previousSSID: string | null = null;
export async function connFirmware(ssid: string, pass: string, nb: string){
    console.log('to aqui');
    /*previousSSID = await chkNetwork();
    console.log("Rede anterior salva:", previousSSID);

    try {
        await wifi.connect({ ssid: 'TS_NET_COM', password: 'hsk@451212' });
        console.log("Conectada!!!!");
        await waitIP();
        console.log("DEBUG → Enviando:", { ssid, password: pass });
        const result = await axios.post('http://192.168.4.1/config', {ssid, password: pass, nb}, {headers: { "Content-Type": "application/json" },timeout: 5000});
        console.log("Resposta da firmware:", result.data);
        await waitNetworkReady();
        await reconnectPreviousNetwork(pass);
        await waitIP();
        return true;
    } catch (err) {
        console.error("Erro ao conectar:", err);
        return false;
    }*/

    /*const urimqtt = 'mqtt://tsapp.com.br:1883';
    const climqtt = mqtt.connect(urimqtt, {
        clean: true,
        connectTimeout: 4000,
        username: 'umbum',
        password: 'U4m5b7U5m4',
        reconnectPeriod: 1000,
    });

    climqtt.on('connect', () => {
        console.log('conectado');
        climqtt.subscribe(['tstest'], () => {
            console.log('Inscrito');
        });
        climqtt.on('message', (topic, payload) => {
            console.log('Msg Recebida: ', topic, payload.toString());
        });
        climqtt.publish('tstest', 'enviando comando para o NB', {qos: 0, retain: false}, (error) => {
            if(error){
                console.log(error);
            }
        });
    });*/
}

async function reconnectPreviousNetwork(pass?: string) {
    if (!previousSSID) {
        //console.warn("Nenhuma rede anterior salva.");
        return false;
    }

    try {
        await wifi.connect({
            ssid: previousSSID,
            password: pass
        });

        //console.log("Reconectado à rede:", previousSSID);
        return true;

    } catch (err) {
        //console.error("Erro ao reconectar:", err);
        return false;
    }
}
