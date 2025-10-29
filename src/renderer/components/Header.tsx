import React, {useEffect, useState} from 'react';

import { Link } from 'react-router-dom';
import { Row, Col, Image, Nav, Toast, ToastContainer } from "react-bootstrap";
import { IoPulseOutline, IoSpeedometerOutline, IoTimerOutline, IoCogOutline, IoBuildOutline } from 'react-icons/io5';

import { IoFlashSharp, IoBatteryFullOutline } from 'react-icons/io5';
import { IoCloud, IoCloudDone, IoCloudOfflineOutline } from 'react-icons/io5';
import { IoUnlinkOutline, IoLinkOutline, IoWifiOutline } from 'react-icons/io5';

interface HeaderProps {
	mnuId: number;
}

const Header: React.FC<HeaderProps> = ({mnuId}) => {
	const [stsNet, setStsNet] = useState<boolean>(true);
	const [stsCnn, setStsCnn] = useState<boolean>(true);
	const [stsNB, setStsNB] = useState<boolean>(false);
	const [stsWifi, setStsWifi] = useState<boolean>(false);
	const [nbID, setNbID] = useState<string>('');
	const [show, setShow] = useState(false);

	const showToast = () => {
		setShow(true);
		setTimeout(() => setShow(false), 2500); // fecha sozinho
	};

	useEffect(() => {
		async function fetchMode(){
			if(window.electronAPI){
				const mdRedeBat = await window.electronAPI.getModeStatus();
				setStsCnn(mdRedeBat);
			}
		}
		fetchMode();
		const invmode = setInterval(fetchMode, 1000);
		return () => clearInterval(invmode);
	}, []);

	useEffect(() => {
		async function fetchStatuses() {
			if (window.electronAPI) {
				const netStatus = await window.electronAPI.getInternetStatus();
				setStsNet(netStatus);
				const id = await window.electronAPI.getNBID();
				setNbID(id);
			}
		}
		fetchStatuses(); // chamada inicial
		const interval = setInterval(fetchStatuses, 1000); // atualiza a cada 5s
		return () => clearInterval(interval); // limpa o intervalo no unmount
	}, []);

	useEffect(() => {
		const findNb = async () => {
			const nbStatus = await window.electronAPI.getNBStatus();
			console.log(nbStatus);
			setStsNB(nbStatus);
		};

		findNb();

		const removeListener = window.electronAPI.onNBStatus((status: boolean) => {
			console.log("📡 Status do NB atualizado:", status);
			setStsNB(status);
		});

		//window.electronAPI.onNBStatus(listener);

		return () => {
			removeListener?.();
		};
	}, []);

	return(
		<>
			<ToastContainer position="top-end" className="p-3">
				<Toast bg="success" show={show} onClose={() => setShow(false)} delay={2500} autohide>
					<Toast.Header>
						Status do Nobreak
					</Toast.Header>
					<Toast.Body>
						Comunicação OK
					</Toast.Body>
				</Toast>
			</ToastContainer>
			<Row>
				<Col className="ps-3 pe-3 pb-3 pt-2">
					<Row>
						<Col md={2}>
							<Image fluid src="/assets/logo-white.png" />
						</Col>
						<Col md={{span:8, offset:2}} className="mt-2">
							<Row className="align-items-center text-light">
								<Col md={4} className={`text-center ${ mnuId === 1 ? 'text-danger' : ''}`}>
									<Nav.Link  as={Link} to="/">
										<IoSpeedometerOutline /> <small>monitor</small>
									</Nav.Link>
								</Col>
								<Col md={4} className={`text-center border-start border-secondary ${ mnuId === 2 ? ' text-danger' : ''}`}>
									<Nav.Link  as={Link} to="/history">
										<IoTimerOutline /> <small>histórico</small>
									</Nav.Link>
								</Col>
								<Col md={4} className={`text-center border-start border-secondary ${ mnuId === 3 ? ' text-danger' : ''}`}>
									<Nav.Link  as={Link} to="/settings">
										<IoBuildOutline /> <small>configurações</small>
									</Nav.Link>
								</Col>
							</Row>
						</Col>
					</Row>
				</Col>
			</Row>
			<Row>
				<Col className="bd-grad py-2 my-2">
					<Row>
						<Col md={3} className="bgdark">&nbsp;</Col>
						<Col md={9} className="bgdark text-end text-secondary py-2 pe-4">
							<Row>
								<Col md={5}>
									NB ID: {nbID}
								</Col>
								<Col md={2}>
									NB: { (stsNB) ?
										( (stsWifi) ? (<IoWifiOutline className="text-info" />) : (<IoLinkOutline className="text-success" />) ) :
										(<IoUnlinkOutline className="text-secondary" />) 
									}
								</Col>
								<Col md={2}>
									Modo: { (stsCnn) ?
										(<IoFlashSharp className="text-success" />) :
										(<IoBatteryFullOutline className="text-danger" />)
									}
								</Col>
								<Col md={3}>
									Internet: { (stsNet) ?
										(<IoCloudDone className="text-success" />) :
										(<IoCloudOfflineOutline className="text-secondary" />)
									}
								</Col>
							</Row>
						</Col>
					</Row>
				</Col>
			</Row>
		</>
	);
}

export default Header;