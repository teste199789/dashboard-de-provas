import React from 'react';
import { Outlet } from 'react-router-dom';
import { useProofs } from '../hooks/useProofs';
import ConfirmationModal from '../components/common/ConfirmationModal';
import ChartBarIcon from '../components/icons/ChartBarIcon';
import NavButton from '../components/common/NavButton';
import ThemeToggle from '../components/common/ThemeToggle';

const Header = () => (
    <>
        <header className="mb-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <ChartBarIcon className="w-10 h-10 mr-4 text-teal-500" />
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">Dashboard de Provas</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">Sua central de análise de desempenho.</p>
                    </div>
                </div>
                <ThemeToggle />
            </div>
        </header>

        <nav className="flex space-x-2 md:space-x-4 mb-8 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm overflow-x-auto">
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
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200">
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
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;