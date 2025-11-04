//settings.tsx
import React, {useEffect, useState} from 'react';
import { IoAlarmOutline } from 'react-icons/io5';
import { Row, Col, Button, Card, InputGroup, Form, Toast, ToastContainer, Tooltip, OverlayTrigger } from "react-bootstrap";
import Header from '../components/Header';
import Footer from '../components/Footer';

interface conf {
	id_nb: string,
	shutdown_failure: number, //desliga após falha do nb (tempo mm:ss)
	sl: number, //desliga com bateria baixa (tempo mm:ss)
	ups: number, //desliga o nobreak após x tempo (mm:ss)
	psd: number, //desliga o NB após desligar o windows
	afb: number, //hiberna ou desliga o nb após o tempo de back-up
	beep: number, //liga ou desliga o beep do NB
	astart: number, //inicia automaticamente com o S.O
}

const Settings: React.FC = () => {

	let nbConfig: {
		shutdown_failure: number;
		shutdown_low: number;
		ups_shutdown: number;
		ups_down_after: number;
		after_backup: number;
		beep: number;
		auto_start: number;
	} | null = null;

	const [tmin, setTmin] = useState<number>(0);
	const [show, setShow] = useState(false);
	const [cfg, setCfg] = useState<conf>({id_nb: '', shutdown_failure: 0, sl: 0, ups: 0, psd: 0, afb: 0, beep: 0, astart: 0});
	
	const sendTest = (kind: string) => {
		switch(kind){
			case 'a':
				window.electronAPI.sendNBCommand("T\r");
				break;
			case 'b':
				window.electronAPI.sendNBCommand("TL\r")
				break;
			case 'c':
				let n = '';
				let v = document.getElementById('customTestInput') as HTMLInputElement | null;
				if(v){
					n = v.value;
				}
				window.electronAPI.sendNBCommand(n);
				break;
			default:
				console.log('default');
				break;
		}
	};

	useEffect(() => {
		//window.electronAPI?.stopMonitoring?.();
		async function loadConfig(){
			//console.log('no load');
			let ins = await window.electronAPI.db.getConfig();
			if(ins.length > 0){
				const pv = {
					id_nb: ins[0].id_nb,
					shutdown_failure: ins[0].shutdown_failure,
					sl: ins[0].shutdown_low,
					ups: ins[0].ups_shutdown,
					psd: ins[0].ups_down_after,
					afb: ins[0].after_backup,
					beep: ins[0].beep,
					astart: ins[0].auto_start
				};
				setCfg(pv);
				console.log(pv);
			}
		};
		loadConfig();
	}, []);

	const hdlItem = (a: number) => {
		switch(a){
			case 1:
				let nb = cfg.beep ? 0 : 1;
				setCfg(prev => ({
					...prev,
					beep: !prev.beep ? 1 : 0
				}));
				//console.log("Result: " + nb);
				window.electronAPI.db.setConfig({id_nb: '1', beep: nb});
				window.electronAPI.sendNBCommand("Q\r");
				//console.log('fecho');
				break;
			case 2:
				let ns = cfg.astart ? 0 : 1;
				setCfg(prev => ({ ...prev, astart: ns }));
				window.electronAPI.db.setConfig({id_nb: '1', astart: ns});
				window.electronAPI.autoLaunch(!!ns);
				//window.electronAPI.autoLaunch.set(!!ns);
				break;
			case 3:
				let so = cfg.psd ? 0 : 1;
				setCfg(prev => ({
					...prev,
					psd: !prev.psd ? 1 : 0
				}));
				window.electronAPI.db.setConfig({id_nb: '1', psd: so});
				//window.electronAPI.sendNBCommand("Q\r");
				break;
			case 4:
				let d = '';
				break;
			default:
				break;
		}
	}

	const saveThis = async (vl: any, op: any) => {
		switch(op){
			case 'onoff':
				window.electronAPI.db.setConfig({id_nb: '1', ups: vl});
				window.electronAPI.sendNBCommand(`S${vl}\r`);
				break;
			case 'offnet':
				window.electronAPI.db.setConfig({id_nb: '1', sf: vl});
				break;
			case 'lowb':
				window.electronAPI.db.setConfig({id_nb: '1', sl: vl});
				break;
			default:
				break;
		}
	}

	return(
		<>
			<ToastContainer position="top-end" className="p-3">
				<Toast bg="success" show={show} onClose={() => setShow(false)} delay={2500} autohide>
					<Toast.Header>
						OPss
					</Toast.Header>
					<Toast.Body>
						Comunicação OK
					</Toast.Body>
				</Toast>
			</ToastContainer>
			<Header mnuId={3} />
			<Row className="mt-3">
				<Col>
					<Row>
						<Col>
							<h5 className="text-secondary">Teste o seu NB</h5>
						</Col>
					</Row>
					<Row className="mb-3 pb-3">
						<Col md={4}>
							<Button variant="secondary" onClick={() => sendTest('a')}>Teste de 10 segundos</Button>
						</Col>
						<Col md={4}>
							<Button variant="secondary" onClick={() => sendTest('b')}>Teste até bateria baixa</Button>
						</Col>
						<Col>
							<InputGroup>
								<Form.Control
									id="customTestInput"
									placeholder="Testar por X minutos"
									aria-label="Testar por X minutos"
									aria-describedby="basic-addon2"
									type="number"
								/>
								<Button variant="outline-secondary" id="button-addon2" onClick={() => sendTest('c')} >
									OK
								</Button>
							</InputGroup>
						</Col>
					</Row>
					<Row>
						<Col>
							<h5 className="mt-3 text-secondary">Configurações</h5>
						</Col>
					</Row>
					<Row className="bg-grad p-1">
						<Col md={7} className="bgdark text-secondary">
							<Row>
								<Col>
									<Form.Check onChange={() => hdlItem(1)} checked={!!cfg.beep} type="switch" id="toggleBeep" label="Desativar Beep" />
								</Col>
							</Row>
							<Row>
								<Col className="py-3">
									<Form.Check onChange={() => hdlItem(2)} checked={!!cfg.astart} type="switch" id="toggleInitRun" label="Iniciar o TS App com o sistema" />
								</Col>
							</Row>
							<Row>
								<Col>
									<Form.Check onChange={() => hdlItem(3)} checked={!!cfg.psd} type="switch" id="toggleShutdown" label="Desligar o NB após desligar o sistema" />
								</Col>
							</Row>
						</Col>
						<Col md={5} className="text-secondary">
							<Row>
								<Col>
									<InputGroup>
										<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-offnet">Desliga o nobreak se ficar sem energia por X minutos</Tooltip>}>
										<InputGroup.Text id="sdpf">
											<IoAlarmOutline />
										</InputGroup.Text>
										</OverlayTrigger>
										<Form.Control
											placeholder="Desligar sem rede (min)"
											aria-describedby="basic-addon2"
											type="number"
											defaultValue={(cfg.shutdown_failure != 0) ? cfg.shutdown_failure : ''}
											onBlur={(e) => saveThis(e.target.value, 'offnet')}
										></Form.Control>
									</InputGroup>
								</Col>
							</Row>
							<Row>
								<Col className="py-3">
									<InputGroup>
										<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-lowb">Desliga depois de X minutos após bateria baixa</Tooltip>}>
											<InputGroup.Text id="sdpf"><IoAlarmOutline /></InputGroup.Text>
										</OverlayTrigger>
										<Form.Control
											placeholder="Bateria baixa desligar (min)"
											aria-describedby="basic-addon2"
											type="number"
											defaultValue={(cfg.sl != 0) ? cfg.sl : ''}
											onBlur={(e) => saveThis(e.target.value, 'lowb')}
										></Form.Control>
										{/*<Button variant="outline-secondary" id="button-addon2" onClick={() => sendTest()} >
											OK
										</Button>*/}
									</InputGroup>
								</Col>
							</Row>
							<Row>
								<Col>
									<InputGroup>
										<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-onoff">Força o desligamento do NB, após o tempo indicado.</Tooltip>}>
											<InputGroup.Text id="turnoffups"><IoAlarmOutline /></InputGroup.Text>
										</OverlayTrigger>
										<Form.Control
											placeholder="Desligar NB (min) / max 10min"
											aria-describedby="basic-addon2"
											type="number"
											defaultValue={(cfg.ups != 0) ? cfg.ups : ''}
											onBlur={(e) => saveThis(e.target.value, 'onoff')}
										></Form.Control>
									</InputGroup>
								</Col>
							</Row>
						</Col>
					</Row>
				</Col>
			</Row>
			<Row className="fixed-bottom">
				<Col className="pb-2 px-4">
					<Footer />
				</Col>
			</Row>
			{/*Opções textbox:
			Desligamento por falha de rede (minutos)
			Desligamento por bateria baixa (minutos)
			Desligamento do Nobreak (minutos)
			Opções checkbox
			Desligar o nobreak automaticamente após desligar o windows
			Iniciar o TSAPP automaticamento ao ligar o windows
			Ativar envio de email
			Ativar a mensagem pela LAN
			Ao final do tempo de autonomia (hibernar) ou (desligar) o windows
			Configurações do envio de e-mail
			Sugerir envio de SMS e Push Notification*/}
		</>
	);
}

export default Settings;