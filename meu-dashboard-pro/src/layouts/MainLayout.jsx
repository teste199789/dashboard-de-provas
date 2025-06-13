import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useProofs } from '../hooks/useProofs';
import ConfirmationModal from '../components/common/ConfirmationModal';
import ChartBarIcon from '../components/icons/ChartBarIcon';
import NavButton from '../components/common/NavButton';

const Header = () => (
  <>
    <header className="mb-8">
      <h1 className="text-4xl font-bold text-gray-800 flex items-center">
        <ChartBarIcon className="w-10 h-10 mr-4 text-teal-500" />
        Dashboard de Provas
      </h1>
      <p className="text-gray-500 mt-2 text-lg">Visão geral e consolidada das suas estatísticas.</p>
    </header>

    <nav className="flex space-x-2 md:space-x-4 mb-8 bg-white p-2 rounded-lg shadow-sm overflow-x-auto">
      <NavButton to="/">Dashboard</NavButton>
      <NavButton to="/meus-concursos">Meus Concursos</NavButton>
      <NavButton to="/minhas-provas">Minhas Provas</NavButton>
      <NavButton to="/cadastrar-prova">Cadastrar Prova</NavButton>
    </nav>
  </>
);

const MainLayout = () => {
  const { modalState, closeDeleteModal, handleDeleteProof } = useProofs();

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onCancel={closeDeleteModal}
        onConfirm={handleDeleteProof}
        title="Confirmar Exclusão"
        message="Você tem certeza que deseja deletar esta prova? Esta ação não pode ser desfeita."
      />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Header />
        <main>
          <Outlet /> {/* As páginas da rota serão renderizadas aqui */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;