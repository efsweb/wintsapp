"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//App.tsx
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var Container_1 = require("react-bootstrap/Container");
var Dashboard_1 = require("./pages/Dashboard");
var History_1 = require("./pages/History");
var Settings_1 = require("./pages/Settings");
var App = function () {
    return (<>
        <Container_1.default fluid className="bg-dark">
            <react_router_dom_1.HashRouter>
                <react_router_dom_1.Routes>
                    <react_router_dom_1.Route path="/" element={<Dashboard_1.default />}/>
                    <react_router_dom_1.Route path="/history" element={<History_1.default />}/>
                    <react_router_dom_1.Route path="/settings" element={<Settings_1.default />}/>
                </react_router_dom_1.Routes>
            </react_router_dom_1.HashRouter>
        </Container_1.default>
    </>);
};
exports.default = App;
