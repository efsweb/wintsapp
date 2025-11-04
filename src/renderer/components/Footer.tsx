import React, { useEffect, useState } from 'react';
import { Row, Col, Table } from "react-bootstrap";
import { IoPulseOutline, IoSpeedometerOutline, IoTimerOutline, IoCogOutline } from 'react-icons/io5';

const Footer: React.FC = () => {
	const [plat, setPlat] = useState<string>('');

	useEffect(() => {
		function wPla() {
			let a = window.electronAPI.platform;
			if (a === 'darwin') {
				setPlat('macOS');
			} else if (a === 'win32') {
				setPlat('Windows');
			} else if (a === 'linux') {
				setPlat('Linux');
			} else {
				setPlat(a); // fallback para mostrar qualquer outro valor
			}
		}
		wPla();
	});

	return(
		<>
			<Row>
				<Col md={12} className="text-light ps-3">
					<Row>
						<Col md={8}>
							<small className="text-lowercase">sistema: {plat}</small>
						</Col>
						<Col md={4} className="text-end">
							<small className="text-lowercase">versão 3.0.0</small>
						</Col>
					</Row>
				</Col>
			</Row>
		</>
	);
}

export default Footer;