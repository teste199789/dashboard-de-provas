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
    const { isLoading, error } = useProofs();

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-gray-100 z-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
                <p className="ml-4 text-gray-600 text-lg">Carregando dados...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-gray-100 z-50">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md" role="alert">
                    <p className="font-bold">Erro de Conexão</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }
    
    // Se não está carregando nem com erro, renderiza as rotas
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="meus-concursos" element={<MyContests />} />
                    <Route path="minhas-provas" element={<ProofsList />} />
                    <Route path="cadastrar-prova" element={<AddProof />} />
                    {/* Rota para 404 - Página não encontrada */}
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