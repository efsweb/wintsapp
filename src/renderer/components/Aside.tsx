import React from 'react';
import { Row, Col } from "react-bootstrap";
import ListGroup from 'react-bootstrap/ListGroup';

const Aside: React.FC = (nm) => {
	return(
		<>
			<Row className="ms-1 mt-3 mb-1 border rounded-2 bg-dark" style={{ height: "540px" }}>
				<Col className="px-0">
					<ListGroup className="m-0 p-0" style={{ width: "100"}}>
						<ListGroup.Item action className="text-secundary">
							Monitoramento
						</ListGroup.Item>
						<ListGroup.Item action className="text-secundary">
							Histórico
						</ListGroup.Item>
						{/*<ListGroup.Item action className="text-secundary">
							Mensageria
						</ListGroup.Item>*/}
						<ListGroup.Item action className="text-secundary">
							Configurações
						</ListGroup.Item>
					</ListGroup>
				</Col>
			</Row>
			<Row className="text-danger mb-3">
				<Col className="text-center text-secondary">
					Versão 4.0.0
				</Col>
			</Row>
		</>
	);
}

export default Aside;