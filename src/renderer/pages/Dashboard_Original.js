"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// pages/Dashboard.tsx
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var Card_1 = require("react-bootstrap/Card");
var react_gauge_component_1 = require("react-gauge-component");
var Aside_1 = require("../components/Aside");
var Footer_1 = require("../components/Footer");
var qrcode_react_1 = require("qrcode.react");
var DashboardOLD = function () {
    var inp = 127;
    var out = 110;
    var hz = 50;
    var temp = 30;
    var bat = 90;
    (0, react_1.useEffect)(function () {
        console.log("Plataforma detectada:", window.electronAPI.platform);
    }, []);
    return (<>
			<react_bootstrap_1.Row>
				<react_bootstrap_1.Col sm={4} md={4}>
					<Aside_1.default />
				</react_bootstrap_1.Col>
	      		<react_bootstrap_1.Col sm={8} md={8} className="pb-3">
	      			<react_bootstrap_1.Row>
	      				<react_bootstrap_1.Col md={6} className="pt-3">
	      					<Card_1.default>
	      						<Card_1.default.Body className="border bg-dark rounded-2">
	      							<react_gauge_component_1.default type="semicircle" value={inp} labels={{
            valueLabel: { formatTextValue: function (value) { return value + 'V'; } },
        }} arc={{
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
        }} minValue={0} maxValue={250}/>
	      							<Card_1.default.Text className="text-center text-light">Tensão de Entrada</Card_1.default.Text>
	      						</Card_1.default.Body>
	      					</Card_1.default>
	      				</react_bootstrap_1.Col>
	      				<react_bootstrap_1.Col md={6} className="pt-3">
	      					<Card_1.default>
	      						<Card_1.default.Body className="border bg-dark rounded-2">
	      							<react_gauge_component_1.default type="semicircle" value={out} labels={{
            valueLabel: { formatTextValue: function (value) { return value + 'V'; } },
        }} arc={{
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
        }} minValue={0} maxValue={250}/>
	      							<Card_1.default.Text className="text-center text-light">Tensão de Saída</Card_1.default.Text>
	      						</Card_1.default.Body>
	      					</Card_1.default>
	      				</react_bootstrap_1.Col>
	      				<react_bootstrap_1.Col md={6} className="pt-3">
	      					<Card_1.default>
	      						<Card_1.default.Body className="border bg-dark rounded-2">
	      							<react_gauge_component_1.default type="semicircle" value={hz} labels={{
            valueLabel: { formatTextValue: function (value) { return value + 'Hz'; } },
        }} arc={{
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
        }} minValue={20} maxValue={70}/>
	      							<Card_1.default.Text className="text-center text-light">Frequência</Card_1.default.Text>
	      						</Card_1.default.Body>
	      					</Card_1.default>
	      				</react_bootstrap_1.Col>
	      				<react_bootstrap_1.Col md={6} className="pt-3">
	      					<Card_1.default>
	      						<Card_1.default.Body className="border bg-dark rounded-2">
	      							<react_gauge_component_1.default type="semicircle" value={temp} labels={{
            valueLabel: { formatTextValue: function (value) { return value + 'ºC'; } },
        }} arc={{
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
                }, {
                    limit: 90,
                    color: '#ffb822',
                    showTick: true,
                    tooltip: {
                        text: 'Superaquecendo!'
                    }
                }, {
                    limit: 100,
                    color: '#fd397a',
                    showTick: true,
                    tooltip: {
                        text: 'Perigo!'
                    }
                }
            ]
        }}/>
	      							<Card_1.default.Text className="text-center text-light">Tempêratura</Card_1.default.Text>
	      						</Card_1.default.Body>
	      					</Card_1.default>
	      				</react_bootstrap_1.Col>
	      				<react_bootstrap_1.Col md={6} className="pt-3">
	      					<Card_1.default>
	      						<Card_1.default.Body className="border bg-dark rounded-2">
	      							<react_gauge_component_1.default type="semicircle" value={bat} labels={{
            valueLabel: { formatTextValue: function (value) { return value + '%'; } },
        }} arc={{
            width: 0.2,
            cornerRadius: 1,
            subArcs: [
                {
                    limit: 20,
                    color: '#fd397a',
                    showTick: true
                }, {
                    limit: 40,
                    color: '#ffb822',
                    showTick: true
                }, {
                    limit: 100,
                    color: '#0abb87',
                    showTick: true
                }
            ]
        }}/>
	      							<Card_1.default.Text className="text-center text-light">Bateria</Card_1.default.Text>
	      						</Card_1.default.Body>
	      					</Card_1.default>
	      				</react_bootstrap_1.Col>
	      				<react_bootstrap_1.Col md={6} className="pt-3">
	      					<Card_1.default>
	      						<Card_1.default.Body className="border bg-dark rounded-2 text-center">
	      							<qrcode_react_1.QRCodeCanvas value="tsapp://monitor" size={105}/>
	      							<Card_1.default.Text className="text-center text-light">123dasd83b2kND</Card_1.default.Text>
	      						</Card_1.default.Body>
	      					</Card_1.default>
	      				</react_bootstrap_1.Col>
	      			</react_bootstrap_1.Row>
	      		</react_bootstrap_1.Col>
	      	</react_bootstrap_1.Row>
	      	<react_bootstrap_1.Row>
	      		<react_bootstrap_1.Col>
	      			<Footer_1.default />
	      		</react_bootstrap_1.Col>
	      	</react_bootstrap_1.Row>
		</>);
};
exports.default = DashboardOLD;
