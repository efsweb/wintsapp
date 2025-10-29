// pages/Dashboard.tsx
import React, {useEffect, useState} from 'react';
import { Row, Col } from "react-bootstrap";
import Card from 'react-bootstrap/Card';

import GaugeComponent from 'react-gauge-component';
import Aside from '../components/Aside';
import Footer from '../components/Footer';

import { QRCodeCanvas } from 'qrcode.react';

const DashboardOLD: React.FC = () => {
	const inp = 127;
	const out = 110;
	const hz  = 50;
	const temp = 30;
	const bat = 90;

	useEffect(() => {
		console.log("Plataforma detectada:", window.electronAPI.platform);
	}, []);

	return(
		<>
			<Row>
				<Col sm={4} md={4}>
					<Aside />
				</Col>
	      		<Col sm={8} md={8} className="pb-3">
	      			<Row>
	      				<Col md={6} className="pt-3">
	      					<Card>
	      						<Card.Body className="border bg-dark rounded-2">
	      							<GaugeComponent type="semicircle"
	      								value={inp}
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
	      				<Col md={6} className="pt-3">
	      					<Card>
	      						<Card.Body className="border bg-dark rounded-2">
	      							<GaugeComponent type="semicircle"
	      								value={out}
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
	      				<Col md={6} className="pt-3">
	      					<Card>
	      						<Card.Body className="border bg-dark rounded-2">
	      							<GaugeComponent type="semicircle" 
	      								value={hz}
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
	      				<Col md={6} className="pt-3">
	      					<Card>
	      						<Card.Body className="border bg-dark rounded-2">
	      							<GaugeComponent type="semicircle" 
	      								value={temp}
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
	      				<Col md={6} className="pt-3">
	      					<Card>
	      						<Card.Body className="border bg-dark rounded-2">
	      							<GaugeComponent type="semicircle" 
	      								value={bat}
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
	      				<Col md={6} className="pt-3">
	      					<Card>
	      						<Card.Body className="border bg-dark rounded-2 text-center">
	      							<QRCodeCanvas value="tsapp://monitor" size={105} />
	      							<Card.Text className="text-center text-light">123dasd83b2kND</Card.Text>
	      						</Card.Body>
	      					</Card>
	      				</Col>
	      			</Row>
	      		</Col>
	      	</Row>
	      	<Row>
	      		<Col>
	      			<Footer />
	      		</Col>
	      	</Row>
		</>
	);
}

export default DashboardOLD;