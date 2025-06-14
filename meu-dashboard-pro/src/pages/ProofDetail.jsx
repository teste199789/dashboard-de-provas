import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../api/apiService';
import { formatDate } from '../utils/formatters';

// Importando os componentes de abas dos seus próprios arquivos
import InfoTab from './tabs/InfoTab';
import OfficialKeysTab from './tabs/OfficialKeysTab';
import UserAnswersTab from './tabs/UserAnswersTab';


// Componente Principal da Página
const ProofDetail = () => {
    const { proofId } = useParams();
    const [proof, setProof] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');

    const fetchProof = useCallback(async () => {
        try {
            const data = await api.getProofById(proofId);
            setProof(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [proofId]);

    useEffect(() => {
        setIsLoading(true);
        fetchProof();
    }, [fetchProof]);

    if (isLoading) return <div className="text-center p-10">Carregando...</div>;
    if (!proof) return <div className="text-center p-10">Prova não encontrada.</div>;

    const TabButton = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-3 font-semibold border-b-4 transition-colors text-sm md:text-base ${activeTab === tabName ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-2xl font-bold text-gray-800">{proof.titulo}</h2>
                <p className="text-gray-500">{proof.banca} - {formatDate(proof.data)}</p>
            </div>
            
            <nav className="flex border-b overflow-x-auto">
                <TabButton tabName="info" label="Informações"/>
                <TabButton tabName="gabaritos" label="Gabaritos da Banca"/>
                <TabButton tabName="meuGabarito" label="Meu Gabarito"/>
                <TabButton tabName="resultado" label="Resultado e Análise"/>
            </nav>

            <div className="min-h-[300px]">
                {activeTab === 'info' && <InfoTab proof={proof} refreshProof={fetchProof} />}
                {activeTab === 'gabaritos' && <OfficialKeysTab proof={proof} />}
                {activeTab === 'meuGabarito' && <UserAnswersTab proof={proof} />}
                {activeTab === 'resultado' && <div className="p-6">A correção automática será implementada aqui.</div>}
            </div>
        </div>
    );
};

// O código duplicado do InfoTab foi REMOVIDO daqui e movido para seu próprio arquivo.

export default ProofDetail;