//App.tsx
import React from "react";
import { HashRouter, Routes, Route } from 'react-router-dom';

import Container from "react-bootstrap/Container";

import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <>
        <Container fluid className="bg-dark">
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </HashRouter>
        </Container>
    </>
    );
};

export default App;


