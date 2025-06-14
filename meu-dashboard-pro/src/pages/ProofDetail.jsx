import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../api/apiService';
import { formatDate } from '../utils/formatters';

import InfoTab from './tabs/InfoTab';
import OfficialKeysTab from './tabs/OfficialKeysTab';
import UserAnswersTab from './tabs/UserAnswersTab';
import ResultTab from './tabs/ResultTab';
import SimulateAnnulmentTab from './tabs/SimulateAnnulmentTab';

const ProofDetail = () => {
    const { proofId } = useParams(); // Pega o ID da URL
    
    // --- PONTO DE VERIFICAÇÃO 1 ---
    console.log(`[ProofDetail] Componente renderizado. ID da URL (useParams): ${proofId}`);

    const [proof, setProof] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');

    const fetchProof = useCallback(async () => {
        // --- PONTO DE VERIFICAÇÃO 2 ---
        console.log(`[ProofDetail] Dentro do fetchProof. Tentando buscar dados para o ID: ${proofId}`);

        if (!proofId) {
            console.error("[ProofDetail] ID da prova é nulo ou indefinido. Abortando busca.");
            setIsLoading(false);
            return;
        }

        try {
            const data = await api.getProofById(proofId);
            console.log("[ProofDetail] Dados recebidos da API:", data);
            setProof(data);
        } catch (err) {
            console.error("[ProofDetail] Erro ao buscar dados da prova:", err);
            setProof(null); // Limpa a prova em caso de erro
        } finally {
            setIsLoading(false);
        }
    }, [proofId]); // A dependência agora é o proofId diretamente

    useEffect(() => {
        console.log("[ProofDetail] useEffect disparado. Chamando fetchProof...");
        setIsLoading(true);
        fetchProof();
    }, [fetchProof]); // O fetchProof só muda quando o proofId muda

    if (isLoading) return <div className="text-center p-10 font-bold">Carregando Detalhes da Prova...</div>;
    
    // Se, após carregar, a prova for nula, mostramos o erro
    if (!proof) {
        return <div className="text-center p-10 font-bold text-red-500">Erro: Prova com ID '{proofId}' não encontrada.</div>;
    }

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
                <TabButton tabName="simulacao" label="Simular Anulações"/>
                <TabButton tabName="resultado" label="Resultado Final"/>
            </nav>

            <div className="min-h-[300px]">
                {activeTab === 'info' && <InfoTab proof={proof} refreshProof={fetchProof} />}
                {activeTab === 'gabaritos' && <OfficialKeysTab proof={proof} />}
                {activeTab === 'meuGabarito' && <UserAnswersTab proof={proof} />}
                {activeTab === 'simulacao' && <SimulateAnnulmentTab proof={proof} />}
                {activeTab === 'resultado' && <ResultTab proof={proof} refreshProof={fetchProof} />}
            </div>
        </div>
    );
};

export default ProofDetail;