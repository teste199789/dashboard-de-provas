import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../api/apiService';
import { formatDate } from '../utils/formatters';
import { useProofs } from '../hooks/useProofs';

import InfoTab from './tabs/InfoTab';
import OfficialKeysTab from './tabs/OfficialKeysTab';
import UserAnswersTab from './tabs/UserAnswersTab';
import ResultTab from './tabs/ResultTab';
import SimulateAnnulmentTab from './tabs/SimulateAnnulmentTab';
import PencilIcon from '../components/icons/PencilIcon';

// Lista de bancas para o seletor de edição
const BANCAS_PREDEFINIDAS = ["Cespe/Cebraspe", "FGV", "FCC", "Outra"];

const ProofDetail = () => {
    const { proofId } = useParams();
    const [proof, setProof] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');

    // --- NOVOS ESTADOS PARA O MODO DE EDIÇÃO ---
    const [isEditing, setIsEditing] = useState(false);
    const [editedProof, setEditedProof] = useState(null);

    const { handleGradeProof, fetchProofs } = useProofs();

    const fetchProof = useCallback(async () => {
        try {
            const data = await api.getProofById(proofId);
            setProof(data);
            setEditedProof(data); // Inicializa o estado de edição com os dados da prova
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

    // --- NOVAS FUNÇÕES PARA SALVAR E CANCELAR ---
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditedProof(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        try {
            // Envia apenas os campos que queremos atualizar
            await api.updateProofDetails(proof.id, {
                titulo: editedProof.titulo,
                banca: editedProof.banca,
                data: editedProof.data,
            });
            await fetchProofs(); // Atualiza a lista principal para refletir na tela "Minhas Provas"
            await fetchProof(); // Recarrega os dados desta prova
            setIsEditing(false); // Sai do modo de edição
        } catch (error) {
            alert('Falha ao salvar as alterações.');
        }
    };

    const handleCancelEdit = () => {
        setEditedProof(proof); // Restaura os dados originais
        setIsEditing(false);   // Sai do modo de edição
    };


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
            {/* --- CABEÇALHO COM MODO DE EDIÇÃO --- */}
            <div className="p-4 bg-gray-50 border-b space-y-2">
                {isEditing ? (
                    // MODO DE EDIÇÃO
                    <div className="space-y-4">
                        <input type="text" name="titulo" value={editedProof.titulo} onChange={handleEditChange} className="w-full text-2xl font-bold p-2 border rounded-md"/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <select name="banca" value={editedProof.banca} onChange={handleEditChange} className="w-full p-2 border rounded-md bg-white">
                                {BANCAS_PREDEFINIDAS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <input type="date" name="data" value={editedProof.data.substring(0, 10)} onChange={handleEditChange} className="w-full p-2 border rounded-md"/>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button onClick={handleCancelEdit} className="py-2 px-4 bg-gray-200 rounded-md font-semibold">Cancelar</button>
                            <button onClick={handleSaveChanges} className="py-2 px-4 bg-green-600 text-white rounded-md font-semibold">Salvar</button>
                        </div>
                    </div>
                ) : (
                    // MODO DE VISUALIZAÇÃO
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{proof.titulo}</h2>
                            <p className="text-gray-500">{proof.banca} - {formatDate(proof.data)}</p>
                        </div>
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 py-2 px-4 bg-white border rounded-md shadow-sm hover:bg-gray-100 font-semibold text-sm">
                            <PencilIcon className="w-4 h-4" />
                            Editar
                        </button>
                    </div>
                )}
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