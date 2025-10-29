// pages/History.tsx
import React, {useEffect, useState} from 'react';
import { Row, Col, Table, Button } from "react-bootstrap";

import Header from '../components/Header';
import Footer from '../components/Footer';


interface EventRecord {
  id: number;
  timestamp: string;
  event: string;
  inputVoltage: number;
  outputVoltage: number;
  battery: number;
  frequency: number;
  temperature: number;
  status: string;
}

const History: React.FC = () => {
	const [history, setHistory] = useState<EventRecord[]>([]);
	const [ldClear, setLdClear] = useState(false);
	const [upddata, setUpddata] = useState(false);

	useEffect(() => {
		window.electronAPI?.stopMonitoring?.();
		async function fetchHistory() {
			if (window.electronAPI?.db) {
				try {
					const data = await window.electronAPI.db.getLastEvents(10);
					setHistory(data);
				}catch(err){
					console.log("Erro ao buscar histórico: ", err);
				}
			}
		};
		fetchHistory();
	}, []);

	const clearDB = () => {
		setLdClear(true);
		window.electronAPI.db.clean().then(() => {
			setHistory([]);
			setLdClear(false);
		});
	}

	const updDB = async () => {
		setUpddata(true);
		const dt = await window.electronAPI.db.getLastEvents(10);
		setHistory(dt);
		setUpddata(false);
	}

	return(
		<>
			<Header mnuId={2} />
			<Row className="mt-2 mb-2">
				<Col>
					<Button variant="outline-light" size="sm" disabled={ldClear} onClick={!ldClear ? clearDB : undefined} >
						{ldClear ? 'Carregando…' : 'Limpar'}
					</Button> &nbsp;
					<Button variant="outline-light" size="sm" disabled={upddata} onClick={!upddata ? updDB : undefined} >
						{upddata ? 'Carregando…' : 'Atualizar'}
					</Button>
				</Col>
			</Row>
			<Row className="mb-3 mt-2">
				<Col>
					<Table striped bordered hover size="sm" variant="dark">
						<thead>
							<tr>
								<th>Horário</th>
								<th>Evento</th>
								<th>Ent</th>
								<th>Saída</th>
								<th>Bat</th>
								<th>Freq</th>
								<th>Temp</th>
							</tr>
						</thead>
						<tbody>
							{history.length > 0 ? (
								history.map((item, index) => (
								<tr key={index}>
									<td>{new Date(item.timestamp).toLocaleString('pt-BR')}</td>
									<td>{item.event}</td>
									<td>{item.inputVoltage}</td>
									<td>{item.outputVoltage}</td>
									<td>{item.battery}</td>
									<td>{item.frequency}</td>
									<td>{item.temperature}</td>
								</tr>
								))
							) : (
							<tr>
								<td colSpan={7} className="text-center">
									Nenhum resultado encontrado
								</td>
							</tr>
							)}
						</tbody>
					</Table>
				</Col>
			</Row>
			<Row className="fixed-bottom">
				<Col className="pb-2 px-4">
					<Footer />
				</Col>
			</Row>
		</>
	);
}

export default History;