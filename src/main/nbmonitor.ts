// src/main/nbmonitor.ts
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { resolveModuleURL } from "./path-resolver.js";

import axios from 'axios';
import moment from 'moment';
import { BrowserWindow } from 'electron';

const dbPath = resolveModuleURL('utils/dbconn.js');
const { saveEvent } = await import(dbPath);

//const ubPath = resolveModuleURL('usbports.js');
//const { getCurrentDevicePort } = await import(ubPath);

//import { saveEvent } from "../utils/dbconn.js";
import { getCurrentDevicePort } from './usbports.js';

let nbID: string | null = null;
let tensaonominal: Number | 0 = 0;
let monitorPort: SerialPort | null = null;
let mainWindow: BrowserWindow | null = null;
let pollingInterval: NodeJS.Timeout | null = null;

let lastNBData: {
	input: number;
	inputFault: number;
	output: number;
	current: number;
	freq: number;
	battery: number;
	temp: number;
	status: string;
} | null = null;

export function registerMainWindow(win: BrowserWindow, id: string) {
    mainWindow = win;
    nbID = id;
}

export async function startMonitoring() {
	const portPath = getCurrentDevicePort();

	if (!portPath) return;

	if(monitorPort && monitorPort.isOpen){
		console.error('[Serial] esta aberta:');
		return;
	}

	monitorPort = new SerialPort({
		path: portPath,
		baudRate: 2400,
		autoOpen: false,
	});

	monitorPort.open((err) => {
		if(err){
			console.error('[Serial] Erro ao abrir porta:', err.message);
			monitorPort = null;
			return;
		}
		if(tensaonominal == 0){
			sendCMD('F\r');
		}
		//sendCMD('Q1\r\n');
		pollingInterval = setInterval(() => {
			sendCMD('Q1\r\n');
		}, 2000);
	});

	const parser = monitorPort.pipe(new ReadlineParser({ delimiter: '\r' }));

	parser.on('data', (line: string) => {
		const cleanLine = line.trim();
		//console.log('[Serial] Linha recebida:', cleanLine);

		if (!cleanLine) return;

		let result: any = '';
		if(tensaonominal == 0){
			result = parseMsg(cleanLine, 'F');
		}else{
			result = parseMsg(cleanLine, 'Q1');
		}

		if (mainWindow && result) {
			mainWindow.webContents.send('nb-data', result);
			//console.log('[NBMonitor] Dados enviados ao renderer:', result);
		} else {
			//console.warn('[NBMonitor] Dados inválidos ou janela não disponível.');
		}
	});

	monitorPort.on('error', (err) => {
		//se precisar monitorar futuro
	});

	monitorPort.on('close', () => {
		if (pollingInterval) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}
		monitorPort = null;
	});
}

export function stopMonitoring() {
	if (monitorPort && monitorPort.isOpen) {
		monitorPort.close();
	}
	if (pollingInterval) {
		clearInterval(pollingInterval);
		pollingInterval = null;
	}
}

function sendCMD(cmd: string){
	if(!monitorPort || !monitorPort.isOpen){
		return;
	}
	monitorPort.write(cmd);
}

const toNum = (nm: string) => {
	const n = parseFloat(nm);
	return isNaN(n) ? 0 : n;
} 

function parseMsg(msg: string, cmd: string){
	switch(cmd){
		case 'Q1':
			try{
				//408.0 127.0 127.0 000 59.0 13.3 28.0 10001001
				const clean = msg.replace('#', '').replace('(','').trim();
				const parts = clean.split(' ');
				//console.log(clean);
				if (clean.length < 6) return null;
				
				const dtsend = clean + ' ' + tensaonominal;
				sendDataToService(dtsend, nbID ?? 'UNKNOWN');

				const [input, inputFault, output, current, freq, battery, temp, status] = parts;

				let sts = status.split('');
				let lst = (lastNBData == null) ? ['0','0','0','0','0','0','0'] : lastNBData.status.split('');
				//falha_util, bateria_baixa, bypass, UPS_falho, UPS StandBy = 1 | Online = 0
				//teste_progresso, desligamento_ativo, beep on/off (on=1, off=2)
				//console.log('Status: ', sts);
				if(parseInt(sts[0]) != parseInt(lst[0])){ //falha_util
					let falha = "Falha Rede";
					if((parseInt(sts[0]) == 0)){
						falha = "Rede OK";
					}else{
						console.log('Enviado');
						sendCommandToNB("S1\r");
					}
					saveEvent({
						event: falha,
						inputVoltage: toNum(input),
						outputVoltage: toNum(output),
						battery: toNum(battery),
						frequency: toNum(freq),
						temperature: toNum(temp),
						status: status
					});
				}
				
				if(parseInt(sts[1]) != parseInt(lst[1])){ //bateria_baixa
					let baixa = 'Bateria OK';
				 	if(parseInt(sts[1]) == 1){
				 		baixa = 'Bateria Baixa';
				 	}
					saveEvent({
						event: baixa,
						inputVoltage: toNum(input),
						outputVoltage: toNum(output),
						battery: toNum(battery),
						frequency: toNum(freq),
						temperature: toNum(temp),
						status: status
					});
				}
				if(parseInt(sts[2]) == 1){ //bypass
					saveEvent({
						event: "Modo Bypass",
						inputVoltage: toNum(input),
						outputVoltage: toNum(output),
						battery: toNum(battery),
						frequency: toNum(freq),
						temperature: toNum(temp),
						status: status
					});
				}
				/*if(parseInt(sts[3]) == 1){ //Falha UPS
					saveEvent({
						event: "Falha NB",
						inputVoltage: toNum(input),
						outputVoltage: toNum(output),
						battery: toNum(battery),
						frequency: toNum(freq),
						temperature: toNum(temp),
						status: status
					});
				}*/
				if(parseInt(sts[5]) != parseInt(lst[5])){ //teste bateria baixa
					let tb = 'Início Teste bateria baixa';
					if(parseInt(sts[5]) == 0){
						tb = 'Fim do Teste bateria baixa';
					}
					saveEvent({
						event: tb,
						inputVoltage: toNum(input),
						outputVoltage: toNum(output),
						battery: toNum(battery),
						frequency: toNum(freq),
						temperature: toNum(temp),
						status: status
					});
				}
				if(parseInt(sts[6]) == 1){
					saveEvent({
						event: "Desligamento ativo",
						inputVoltage: toNum(input),
						outputVoltage: toNum(output),
						battery: toNum(battery),
						frequency: toNum(freq),
						temperature: toNum(temp),
						status: status
					});
				}
				if(parseInt(sts[7]) != parseInt(lst[7])){ //beep
					let bp = 'Beep Desativado';
					if(parseInt(sts[7]) == 1){
						bp = 'Beep Ativado';
					}
					saveEvent({
						event: bp,
						inputVoltage: toNum(input),
						outputVoltage: toNum(output),
						battery: toNum(battery),
						frequency: toNum(freq),
						temperature: toNum(temp),
						status: status
					});
				}

				lastNBData = {
					input: toNum(input),
					inputFault: toNum(inputFault),
					output: toNum(output),
					current: toNum(current),
					freq: toNum(freq),
					battery: toNum(battery),
					temp: toNum(temp),
					status: status ?? 'UNKNOWN'
				};

				//console.log(parseFloat(output));
				//console.log('X: ' + parseFloat(inputFault));

				let bt = calcSOC(parseFloat(battery),12);
				return {
					inputVoltage: parseFloat(input) || 0,
					inputFaultVoltage: parseFloat(inputFault) || 0,
					outputVoltage: parseFloat(output) || 0,
					current: parseFloat(current) || 0,
					frequency: parseFloat(freq) || 0,
					battery: bt,
					temperature: parseFloat(temp) || 0,
					status: status ?? 'UNKNOWN'
				};
			}catch (e) {
				return null;
			}
			break;
		case 'F':
			try{
				const clean = msg.replace('#', '').replace('(','').trim();
				const parts = clean.split(' ');
				//console.log(parts);
				tensaonominal = 12;
			}catch (e){
				return null;
			}
			break;
		default:
			break;
	}
}

function calcSOC(bat: number, nom: number): number{
	const tensao12 = [12.20, 12.09, 11.98, 11.87, 11.76, 11.64, 11.53, 11.42, 11.31, 10.91, 10.50];
	const tensao24 = [24.40, 24.18, 23.96, 23.74, 23.52, 23.28, 23.06, 22.84, 22.62, 21.82, 21.00];
	const socRea = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

	let tensao = nom === 24 ? tensao24 : tensao12;
	let soc = 0;

	if(bat > tensao[0]){
		soc = 100;
	}else if(bat <= tensao[tensao.length - 1]){
		soc = 0;
	}else{
		for(let i = 0; i < tensao.length - 1; i++){
			if(bat <= tensao[i] && bat > tensao[i + 1]){
				const slope = (socRea[i] - socRea[i + 1]) / (tensao[i] - tensao[i + 1]);
				soc = socRea[i] - slope * (tensao[i] - bat);
				break;
			}
		}
	}
	soc = Math.max(0, Math.min(100, soc));
	//console.log('BAT: ' + bat);
	//console.log('SOC: ' + soc);
	//console.log('NOM: ' + nom);
	return Math.round(soc);
}

async function sendDataToService(prdInfo: any, nbID: string) {
	const dt = moment().format('YYYY-MM-DD HH:mm:ss');
	//https://service.tsapp.com.br/tsapp/?a=B543-FE5E-023D&b=2025-10-14%2013:53:56&c=%22128.0%20128.0%20128.0%20000%2059.0%2013.4%2028.0%2010001001%2012%22
	//console.log(dt);
	try {
		const url = `https://service.tsapp.com.br/tsapp/a=${nbID}&b=${dt}&c=${prdInfo}&d=0`;
		//console.log(url);
		await axios.get(url);
		//console.log('Dados enviados com sucesso');
	} catch (err) {
		//console.error('Erro ao enviar dados:', err);
	}
}

export function sendCommandToNB(cmd: string) {
	console.log("chegou aqui");
	if (!monitorPort || !monitorPort.isOpen) {
		//console.warn("[Serial] Porta não está aberta.");
		return false;
	}

	console.log(`[Serial] Enviando comando manual: ${cmd}`);
	switch(cmd){
		case "T\r":
			if (lastNBData) {
				saveEvent({
					event: 'Teste 10 segundos',
					inputVoltage: toNum(String(lastNBData.input)) || 0,
					outputVoltage: toNum(String(lastNBData.output)) || 0,
					battery: toNum(String(lastNBData.battery)) || 0,
					frequency: toNum(String(lastNBData.freq)) || 0,
					temperature: toNum(String(lastNBData.temp)) || 0,
					status: lastNBData.status || '00000000'
				});
			}else{
				saveEvent({
					event: 'Teste 10 segundos',
					inputVoltage: 0,
					outputVoltage: 0,
					battery: 0,
					frequency: 0,
					temperature: 0,
					status: '00000000'
				});
			}
			break;
		case "TL\r":
			if (lastNBData) {
				saveEvent({
					event: 'Teste bateria baixa',
					inputVoltage: toNum(String(lastNBData.input)) || 0,
					outputVoltage: toNum(String(lastNBData.output)) || 0,
					battery: toNum(String(lastNBData.battery)) || 0,
					frequency: toNum(String(lastNBData.freq)) || 0,
					temperature: toNum(String(lastNBData.temp)) || 0,
					status: lastNBData.status || '00000000'
				});
			}else{
				saveEvent({
					event: 'Teste bateria baixa',
					inputVoltage: 0,
					outputVoltage: 0,
					battery: 0,
					frequency: 0,
					temperature: 0,
					status: '00000000'
				});
			}
			break;
		case "Q\r":
			//console.log('bateu aqui');
			let bp = 'Beep Desativado';
			if (lastNBData) {
				if(lastNBData.status[7] == '0'){
					bp = 'Beep Ativado';
				}
				saveEvent({
					event: bp,
					inputVoltage: toNum(String(lastNBData.input)) || 0,
					outputVoltage: toNum(String(lastNBData.output)) || 0,
					battery: toNum(String(lastNBData.battery)) || 0,
					frequency: toNum(String(lastNBData.freq)) || 0,
					temperature: toNum(String(lastNBData.temp)) || 0,
					status: lastNBData.status || '00000000'
				});
			}else{
				saveEvent({
					event: bp,
					inputVoltage: 0,
					outputVoltage: 0,
					battery: 0,
					frequency: 0,
					temperature: 0,
					status: '00000000'
				});
			}
			break;
		default:
			console.log('vaio no default');
			let a = cmd.substring(0,1);
			console.log('AAA ' + a);
			if(a == 'S'){
				console.log('Enviando desligamento');
				cmd = "S001\r";
			}else{
				cmd = cmd.padStart(2, "0");
				if (lastNBData) {
					saveEvent({
						event: `Teste de ${cmd} minutos`,
						inputVoltage: toNum(String(lastNBData.input)) || 0,
						outputVoltage: toNum(String(lastNBData.output)) || 0,
						battery: toNum(String(lastNBData.battery)) || 0,
						frequency: toNum(String(lastNBData.freq)) || 0,
						temperature: toNum(String(lastNBData.temp)) || 0,
						status: lastNBData.status || '00000000'
					});
				}else{
					saveEvent({
						event: `Teste de ${cmd} minutos`,
						inputVoltage: 0,
						outputVoltage: 0,
						battery: 0,
						frequency: 0,
						temperature: 0,
						status: '00000000'
					});
				}
				cmd = `T${cmd}\r`;
			}
			break;
	}
	monitorPort.write(cmd);
	return true;
}

export function checkMode(){
	if(lastNBData){
		let a = lastNBData.status[0];
		if(a == '1'){
			return false;
		}
	}
	return true;
}



