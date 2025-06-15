import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProofsProvider } from './contexts/ProofsContext';
import { Toaster } from 'react-hot-toast';

// Importação das páginas e layouts
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import MyContests from './pages/MyContests';
import ProofsList from './pages/ProofsList';
import AddProof from './pages/AddProof';
import ProofDetail from './pages/ProofDetail';

// O componente principal da aplicação
function App() {
  return (
    <ProofsProvider> {/* 2. O Provedor de Provas envolve o Router */}
      <Router>
        {/* 3. O Toaster fica aqui para renderizar as notificações */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            className: 'dark:bg-gray-700 dark:text-white', // Estilo para dark mode
            duration: 4000,
          }}
        />

        {/* 4. As Rotas definem qual página é mostrada */}
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="meus-concursos" element={<MyContests />} />
            <Route path="minhas-provas" element={<ProofsList />} />
            <Route path="minhas-provas/:proofId" element={<ProofDetail />} />
            <Route path="cadastrar-prova" element={<AddProof />} />
            <Route path="*" element={<h2 className="text-center p-8">404: Página Não Encontrada</h2>} />
          </Route>
        </Routes>
      </Router>
    </ProofsProvider>
  );
}

export default App;