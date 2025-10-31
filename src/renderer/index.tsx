//index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import './assets/custom.css';

//ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");
ReactDOM.createRoot(rootEl).render(<App />);
