// pages/Dashboard.tsx
import React, {useEffect, useState} from 'react';

import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import { QRCodeCanvas } from 'qrcode.react';
import { Row, Col, Table } from "react-bootstrap";

import { IoNotifications } from 'react-icons/io5';
import { IoNotificationsOff } from 'react-icons/io5';

//import Header from '../components/Header';
//import Footer from '../components/Footer';
import GaugeComponent from 'react-gauge-component';


const Dashboard: React.FC = () => {

	const [nbData, setNbData] = useState({
		inputVoltage: 0,
		outputVoltage: 0,
		frequency: 0,
		temperature: 0,
		battery: 0,
		status: 'N/A'
	});
	const [nbID, setNbID] = useState<string>('');

	useEffect(() => {

		if (window.electronAPI?.onNBData) {
			//console.log('Registrando listener de dados do nobreak');
			window.electronAPI.onNBData((data) => {
				//console.log("📡 Dados recebidos:", data);
				if (data) {
					if(isNaN(data.inputVoltage)){
						data.inputVoltage = nbData.inputVoltage;
						//if(nbData.inputVoltage != data.inputVoltage)
					}
					setNbData(data);
				}
			});
		}
		// Listener de conexão com o nobreak
		const unsubscribe = window.electronAPI?.onNBStatus(async (status: boolean) => {
			//console.log('[NBStatus] Status atualizado:', status);
			if (status) {
				await window.electronAPI?.startMonitoring();
				console.log('[NBStatus] startMonitoring chamado!');
			}
		});

		// Primeira checagem ao carregar a página
		const init = async () => {
			const id = await window.electronAPI.getNBID();
			setNbID(id);

			//console.log('init...');
			const hasNB = await window.electronAPI?.getNBStatus();
			//console.log('[Init] Tem nobreak conectado?', hasNB);
			if (hasNB) {
				await window.electronAPI?.startMonitoring();
				//console.log('[Init] startMonitoring chamado!');
			}
		};
		init();
		// Cleanup do listener quando o componente desmontar
		return () => {
			window.electronAPI?.stopMonitoring?.(); // safe call
			if (unsubscribe) unsubscribe();
		};
	}, []);

	

	return(
		<>
			{/*<Header mnuId={1} />*/}
			<Row className="mb-3">
				<Col>
					<Row>
	      				<Col md={4} className="pt-3">
	      					<Card>
	      						<Card.Body className="border bg-dark rounded-2">
	      							<GaugeComponent type="semicircle"
	      								value={nbData.inputVoltage}
	      								labels={{
	      									valueLabel: { formatTextValue: value => value + 'V'},
	      								}}
		      							arc={{
		      								width: 0.2,
		      								cornerRadius: 1,
		      								subArcs: [
		      									{
		      										limit: 80,
		      										color: '#fd397a',
		      										showTick: true
		      									},
		      									{
		      										limit: 127,
		      										color: '#0abb87',
		      										showTick: true
		      									},
		      									{
		      										limit: 200,
		      										color: '#fd397a',
		      										showTick: true
		      									},
		      									{
		      										limit: 225,
		      										color: '#0abb87',
		      										showTick: true
		      									},
		      									{
		      										limit: 250,
		      										color: '#fd397a',
		      										showTick: true
		      									}
		      								]
		      							}} minValue={0} maxValue={250} />
	      							<Card.Text className="text-center text-light">Tensão de Entrada</Card.Text>
	      						</Card.Body>
	      					</Card>
	      				</Col>
	      				<Col md={4} className="pt-3">
	      					<Card>
	      						<Card.Body className="border bg-dark rounded-2">
	      							<GaugeComponent type="semicircle"
	      								value={nbData.outputVoltage}
	      								labels={{
	      									valueLabel: { formatTextValue: value => value + 'V'},
	      								}}
	      								arc={{
		      								width: 0.2,
		      								cornerRadius: 1,
		      								subArcs: [
		      									{
		      										limit: 80,
		      										color: '#fd397a',
		      										showTick: true
		      									},
		      									{
		      										limit: 127,
		      										color: '#0abb87',
		      										showTick: true
		      									},
		      									{
		      										limit: 200,
		      										color: '#fd397a',
		      										showTick: true
		      									},
		      									{
		      										limit: 225,
		      										color: '#0abb87',
		      										showTick: true
		      									},
		      									{
		      										limit: 250,
		      										color: '#fd397a',
		      										showTick: true
		      									}
		      								]
		      							}} minValue={0} maxValue={250} />
	      							<Card.Text className="text-center text-light">Tensão de Saída</Card.Text>
	      						</Card.Body>
	      					</Card>
	      				</Col>
	      				<Col md={4} className="pt-3">
	      					<Card>
	      						<Card.Body className="border bg-dark rounded-2">
	      							<GaugeComponent type="semicircle" 
	      								value={nbData.frequency}
	      								labels={{
	      									valueLabel: { formatTextValue: value => value + 'Hz'},
	      								}}
	      								arc={{
		      								width: 0.2,
		      								cornerRadius: 1,
		      								subArcs: [
		      									{
		      										limit: 42,
		      										color: '#fd397a',
		      										showTick: true
		      									},
		      									{
		      										limit: 47,
		      										color: '#ffb822',
		      										showTick: true
		      									},
		      									{
		      										limit: 53,
		      										color: '#0abb87',
		      										showTick: true
		      									},
		      									{
		      										limit: 57,
		      										color: '#ffb822',
		      										showTick: true
		      									},
		      									{
		      										limit: 60,
		      										color: '#0abb87',
		      										showTick: true
		      									},
		      									{
		      										limit: 63,
		      										color: '#ffb822',
		      										showTick: true
		      									},
		      									{
		      										limit: 70,
		      										color: '#fd397a',
		      										showTick: true
		      									},
		      								]
		      							}} minValue={20} maxValue={70} />
	      							<Card.Text className="text-center text-light">Frequência</Card.Text>
	      						</Card.Body>
	      					</Card>
	      				</Col>
	      				<Col md={4} className="pt-3">
	      					<Card>
	      						<Card.Body className="border bg-dark rounded-2">
	      							<GaugeComponent type="semicircle" 
	      								value={nbData.temperature}
	      								labels={{
		      								valueLabel: { formatTextValue: value => value + 'ºC' },
		      							}}
	      								arc={{
		      								width: 0.2,
		      								cornerRadius: 1,
		      								subArcs: [
			      									{
			      										limit: 80,
			      										color: '#0abb87',
			      										showTick: true,
			      										tooltip: {
			      											text: 'OK!'
			      										},
			      									},{
			      										limit: 90,
			      										color: '#ffb822',
			      										showTick: true,
			      										tooltip:{
			      											text: 'Superaquecendo!'
			      										}
			      									},{
			      										limit: 100,
			      										color: '#fd397a',
			      										showTick: true,
			      										tooltip:{
			      											text: 'Perigo!'
			      										}
			      									}
			      								]
		      							}} />
	      							<Card.Text className="text-center text-light">Tempêratura</Card.Text>
	      						</Card.Body>
	      					</Card>
	      				</Col>
	      				<Col md={4} className="pt-3">
	      					<Card>
	      						<Card.Body className="border bg-dark rounded-2">
	      							<GaugeComponent type="semicircle" 
	      								value={nbData.battery}
	      								labels={{
		      								valueLabel: { formatTextValue: value => value + '%' },
		      							}}
	      							 	arc={{
		      								width: 0.2,
		      								cornerRadius: 1,
		      								subArcs: [
		      									{
		      										limit: 20,
		      										color: '#fd397a',
		      										showTick: true
		      									},{
		      										limit: 40,
		      										color: '#ffb822',
		      										showTick: true
		      									},{
		      										limit: 100,
		      										color: '#0abb87',
		      										showTick: true
		      									}
		      								]
		      							}} />
	      							<Card.Text className="text-center text-light">Bateria</Card.Text>
	      						</Card.Body>
	      					</Card>
	      				</Col>
	      				<Col md={4} className="pt-3">
	      					<Card>
	      						<Card.Body className="border bg-dark rounded-2 text-center">
	      							<QRCodeCanvas bgColor="#212529" value={`tsapp://monitor/${nbID}`} size={105} />
	      							<Card.Text className="text-center text-light">{nbID}</Card.Text>
	      						</Card.Body>
	      					</Card>
	      				</Col>
	      			</Row>
				</Col>
			</Row>
			<Row className="fixed-bottom">
				<Col className="pb-2 px-4">
					{/*<Footer />*/}
				</Col>
			</Row>
		</>
	);
}

export default Dashboard;