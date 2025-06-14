import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../api/apiService';
import { formatDate } from '../utils/formatters';
import TrashIcon from '../components/icons/TrashIcon';

// Componente para a Aba de Informações (pode ficar no mesmo arquivo ou ser separado)
const InfoTab = ({ proof, refreshProof }) => {
    const [subjects, setSubjects] = useState(proof.subjects || []);

    const handleAddSubject = () => {
        setSubjects([...subjects, { nome: '', questoes: '' }]);
    };

    const handleSubjectChange = (index, field, value) => {
        const updatedSubjects = [...subjects];
        updatedSubjects[index][field] = value;
        setSubjects(updatedSubjects);
    };

    const handleRemoveSubject = (index) => {
        const updatedSubjects = subjects.filter((_, i) => i !== index);
        setSubjects(updatedSubjects);
    };

    const handleSaveChanges = async () => {
        const subjectsToSave = subjects
            .filter(s => s.nome && s.questoes)
            .map(s => ({ nome: s.nome, questoes: parseInt(s.questoes) }));
        
        try {
            await api.updateProofDetails(proof.id, { subjects: subjectsToSave });
            alert('Informações salvas com sucesso!');
            refreshProof();
        } catch (error) {
            alert('Falha ao salvar as informações.');
        }
    };

    return (
        <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Matérias do Concurso</h3>
            <div className="space-y-3">
                {subjects.map((subject, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input type="text" placeholder="Nome da Matéria" value={subject.nome} onChange={e => handleSubjectChange(index, 'nome', e.target.value)} className="flex-grow p-2 border rounded"/>
                        <input type="number" placeholder="Nº de Questões" value={subject.questoes} onChange={e => handleSubjectChange(index, 'questoes', e.target.value)} className="w-32 p-2 border rounded"/>
                        <button onClick={() => handleRemoveSubject(index)} className="text-red-500 p-2 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                ))}
            </div>
            <button onClick={handleAddSubject} className="mt-4 text-teal-600 font-semibold">+ Adicionar Matéria</button>
            <div className="mt-6 border-t pt-4 flex justify-end">
                <button onClick={handleSaveChanges} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600">Salvar Informações</button>
            </div>
        </div>
    );
};


// Componente Principal da Página
const ProofDetail = () => {
    const { proofId } = useParams();
    const navigate = useNavigate();
    const [proof, setProof] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');

    const fetchProof = async () => {
        try {
            const data = await api.getProofById(proofId);
            setProof(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchProof();
    }, [proofId]);

    if (isLoading) return <div>Carregando...</div>;
    if (!proof) return <div>Prova não encontrada.</div>;

    const TabButton = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 font-semibold border-b-4 transition-colors ${activeTab === tabName ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}
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
            
            <nav className="flex border-b">
                <TabButton tabName="info" label="Informações do Concurso"/>
                <TabButton tabName="gabaritos" label="Gabaritos da Banca"/>
                <TabButton tabName="meuGabarito" label="Meu Gabarito"/>
                <TabButton tabName="resultado" label="Resultado e Análise"/>
            </nav>

            <div>
                {activeTab === 'info' && <InfoTab proof={proof} refreshProof={fetchProof} />}
                {activeTab === 'gabaritos' && <div className="p-6">Funcionalidade a ser implementada.</div>}
                {activeTab === 'meuGabarito' && <div className="p-6">Funcionalidade a ser implementada.</div>}
                {activeTab === 'resultado' && <div className="p-6">Funcionalidade a ser implementada.</div>}
            </div>
        </div>
    );
};

export default ProofDetail;