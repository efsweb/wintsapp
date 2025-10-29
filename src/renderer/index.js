"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//index.tsx
var react_1 = require("react");
var client_1 = require("react-dom/client");
var App_1 = require("./App");
require("bootstrap/dist/css/bootstrap.min.css");
require("./assets/custom.css");
client_1.default.createRoot(document.getElementById("root")).render(<App_1.default />);
