import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProofs } from '../hooks/useProofs';

const AddProof = () => {
    const navigate = useNavigate();
    const { handleAddProof } = useProofs();
    const [isSaving, setIsSaving] = useState(false);

    const [prova, setProva] = useState({ banca: '', ano: '', titulo: '' });
    const [disciplinas, setDisciplinas] = useState({
        'Conhecimentos Básicos': { acertos: '', erros: '', brancos: '', anuladas: '' },
        'Conhecimentos Específicos': { acertos: '', erros: '', brancos: '', anuladas: '' },
        'Conhecimentos Especializados': { acertos: '', erros: '', brancos: '', anuladas: '' },
    });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const newProof = {
            titulo: prova.titulo,
            banca: prova.banca,
            ano: parseInt(prova.ano) || new Date().getFullYear(),
            results: Object.entries(disciplinas)
                .map(([nome, valores]) => ({
                    disciplina: nome,
                    acertos: parseInt(valores.acertos) || 0,
                    erros: parseInt(valores.erros) || 0,
                    brancos: parseInt(valores.brancos) || 0,
                    anuladas: parseInt(valores.anuladas) || 0,
                }))
                .filter(d => (d.acertos + d.erros + d.brancos + d.anuladas) > 0),
        };

        const success = await handleAddProof(newProof);
        setIsSaving(false);
        if (success) {
            navigate('/minhas-provas'); // Vai para a lista de provas após salvar
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Cadastrar Nova Prova</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input required type="text" value={prova.titulo} onChange={e => setProva({...prova, titulo: e.target.value})} placeholder="Nome da Prova (Ex: Analista Suporte STJ)" className="md:col-span-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                <input required type="text" value={prova.banca} onChange={e => setProva({...prova, banca: e.target.value})} placeholder="Banca" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                <input required type="number" value={prova.ano} onChange={e => setProva({...prova, ano: e.target.value})} placeholder="Ano" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            
            {Object.keys(disciplinas).map(nome => (
                <div key={nome} className="mb-6 p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-bold text-gray-700 mb-3">{nome}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <input type="number" value={disciplinas[nome].acertos} onChange={e => setDisciplinas({...disciplinas, [nome]: {...disciplinas[nome], acertos: e.target.value}})} placeholder="Acertos" min="0" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                        <input type="number" value={disciplinas[nome].erros} onChange={e => setDisciplinas({...disciplinas, [nome]: {...disciplinas[nome], erros: e.target.value}})} placeholder="Erros" min="0" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                        <input type="number" value={disciplinas[nome].brancos} onChange={e => setDisciplinas({...disciplinas, [nome]: {...disciplinas[nome], brancos: e.target.value}})} placeholder="Brancos" min="0" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                        <input type="number" value={disciplinas[nome].anuladas} onChange={e => setDisciplinas({...disciplinas, [nome]: {...disciplinas[nome], anuladas: e.target.value}})} placeholder="Anuladas" min="0" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                    </div>
                </div>
            ))}
            
            <div className="flex justify-end mt-6">
                 <button type="button" onClick={() => navigate(-1)} className="text-gray-600 font-bold py-3 px-6 mr-4 rounded-lg hover:bg-gray-200 transition">
                    Voltar
                </button>
                <button type="submit" disabled={isSaving} className="bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-wait">
                    {isSaving ? 'Salvando...' : 'Salvar Prova'}
                </button>
            </div>
        </form>
    );
};

export default AddProof;