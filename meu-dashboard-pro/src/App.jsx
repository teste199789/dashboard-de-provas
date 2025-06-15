import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProofsProvider } from './contexts/ProofsContext';
import { Toaster } from 'react-hot-toast';

import MainLayout from './layouts/MainLayout';
import FocusedLayout from './layouts/FocusedLayout';
import Dashboard from './pages/Dashboard';
import MyContests from './pages/MyContests';
import ProofsList from './pages/ProofsList';
import AddProof from './pages/AddProof';
import AddSimulado from './pages/AddSimulado'; // <-- Importa a nova página
import ProofDetail from './pages/ProofDetail';

function App() {
  return (
    <ProofsProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ className: 'dark:bg-gray-700 dark:text-white' }} />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meus-concursos" element={<MyContests />} />
            <Route path="/minhas-provas" element={<ProofsList />} />
            <Route path="/cadastrar-prova" element={<AddProof />} />
            <Route path="/cadastrar-simulado" element={<AddSimulado />} /> {/* <-- Adiciona a nova rota */}
          </Route>
          <Route element={<FocusedLayout />}>
            <Route path="/minhas-provas/:proofId" element={<ProofDetail />} />
          </Route>
          <Route path="*" element={<h2 className="text-center p-8">404: Página Não Encontrada</h2>} />
        </Routes>
      </Router>
    </ProofsProvider>
  );
}

export default App;