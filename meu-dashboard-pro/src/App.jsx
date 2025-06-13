import ProofDetail from './pages/ProofDetail';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProofsProvider } from './contexts/ProofsContext';
import { useProofs } from './hooks/useProofs';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import MyContests from './pages/MyContests';
import ProofsList from './pages/ProofsList';
import AddProof from './pages/AddProof';

// Componente para lidar com o estado de carregamento inicial e erros globais
const AppContent = () => {
    // ...
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="meus-concursos" element={<MyContests />} />
                    <Route path="minhas-provas" element={<ProofsList />} />
                    {/* 👇 ROTA NOVA 👇 */}
                    <Route path="minhas-provas/:proofId" element={<ProofDetail />} />
                    <Route path="cadastrar-prova" element={<AddProof />} />
                    <Route path="*" element={<div className="text-center py-10"><h2>404 - Página Não Encontrada</h2></div>} />
                </Route>
            </Routes>
        </Router>
    );
};


// Componente principal que envolve a aplicação com o provedor de contexto
const App = () => {
    return (
        <ProofsProvider>
            <AppContent />
        </ProofsProvider>
    );
};

export default App;