import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProofs } from '../hooks/useProofs';
import TrashIcon from '../components/icons/TrashIcon';

const BANCAS_PREDEFINIDAS = ["Cespe/Cebraspe", "FGV", "FCC"];

const AddProof = () => {
    const navigate = useNavigate();
    const { handleAddProof } = useProofs();
    const [isSaving, setIsSaving] = useState(false);
    const [prova, setProva] = useState({ banca: '', data: '', titulo: '' });
    const [bancaSelecionada, setBancaSelecionada] = useState('');

    const [disciplinas, setDisciplinas] = useState([
        { id: 1, nome: '', acertos: '', erros: '', brancos: '', anuladas: '' }
    ]);

    const handleAdicionarDisciplina = () => {
        const novaDisciplina = {
            id: Date.now(),
            nome: '', acertos: '', erros: '', brancos: '', anuladas: ''
        };
        setDisciplinas([...disciplinas, novaDisciplina]);
    };

    const handleRemoverDisciplina = (id) => {
        if (disciplinas.length > 1) {
            setDisciplinas(disciplinas.filter(d => d.id !== id));
        }
    };

    const handleDisciplinaChange = (id, event) => {
        const { name, value } = event.target;
        const novasDisciplinas = disciplinas.map(d => (d.id === id ? { ...d, [name]: value } : d));
        setDisciplinas(novasDisciplinas);
    };

    const handleBancaChange = (e) => {
        const valor = e.target.value;
        setBancaSelecionada(valor);
        if (valor !== 'Outra') {
            setProva(prev => ({ ...prev, banca: valor }));
        } else {
            setProva(prev => ({ ...prev, banca: '' }));
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const newProof = {
            titulo: prova.titulo,
            banca: prova.banca,
            data: prova.data,
            results: disciplinas
                .filter(d => d.nome.trim() !== '')
                .map(d => ({
                    disciplina: d.nome,
                    acertos: parseInt(d.acertos) || 0,
                    erros: parseInt(d.erros) || 0,
                    brancos: parseInt(d.brancos) || 0,
                    anuladas: parseInt(d.anuladas) || 0,
                })),
        };

        const success = await handleAddProof(newProof);
        setIsSaving(false);
        if (success) {
            navigate('/minhas-provas');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Cadastrar Nova Prova</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input required type="text" value={prova.titulo} onChange={e => setProva({...prova, titulo: e.target.value})} placeholder="Nome da Prova (Ex: Analista Suporte STJ)" className="md:col-span-2 p-3 border border-gray-300 rounded-lg" />
                
                <div>
                    <label htmlFor="banca-select" className="block text-sm font-medium text-gray-700 mb-1">Banca</label>
                    <select id="banca-select" required value={bancaSelecionada} onChange={handleBancaChange} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                        <option value="" disabled>Selecione uma banca</option>
                        {BANCAS_PREDEFINIDAS.map(b => <option key={b} value={b}>{b}</option>)}
                        <option value="Outra">Outra...</option>
                    </select>
                </div>
                
                <div>
                    <label htmlFor="data-input" className="block text-sm font-medium text-gray-700 mb-1">Data da Prova</label>
                    <input
                        id="data-input"
                        required
                        type="date"
                        value={prova.data}
                        onChange={e => setProva({...prova, data: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                </div>

                {bancaSelecionada === 'Outra' && (
                    <div className="md:col-span-2">
                        <label htmlFor="outra-banca-input" className="block text-sm font-medium text-gray-700 mb-1">Qual banca?</label>
                        <input id="outra-banca-input" required type="text" value={prova.banca} onChange={e => setProva({...prova, banca: e.target.value})} placeholder="Digite o nome da nova banca" className="w-full p-3 border border-gray-300 rounded-lg" />
                    </div>
                )}
            </div>
            
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-700 mb-2">Matérias e Resultados</h3>
                {disciplinas.map((disciplina, index) => (
                    <div key={disciplina.id} className="p-4 border border-gray-200 rounded-lg space-y-3 bg-gray-50">
                        <div className="flex items-center gap-4">
                            <input name="nome" type="text" value={disciplina.nome} onChange={(e) => handleDisciplinaChange(disciplina.id, e)} placeholder={`Matéria ${index + 1}`} className="flex-grow p-3 border border-gray-300 rounded-lg" />
                            <button type="button" onClick={() => handleRemoverDisciplina(disciplina.id)} disabled={disciplinas.length <= 1} className="p-2 text-red-500 rounded-full hover:bg-red-100 disabled:opacity-50" aria-label="Remover Matéria">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <input name="acertos" type="number" value={disciplina.acertos} onChange={(e) => handleDisciplinaChange(disciplina.id, e)} placeholder="Acertos" min="0" className="p-3 border border-gray-300 rounded-lg" />
                            <input name="erros" type="number" value={disciplina.erros} onChange={(e) => handleDisciplinaChange(disciplina.id, e)} placeholder="Erros" min="0" className="p-3 border border-gray-300 rounded-lg" />
                            <input name="brancos" type="number" value={disciplina.brancos} onChange={(e) => handleDisciplinaChange(disciplina.id, e)} placeholder="Brancos" min="0" className="p-3 border border-gray-300 rounded-lg" />
                            <input name="anuladas" type="number" value={disciplina.anuladas} onChange={(e) => handleDisciplinaChange(disciplina.id, e)} placeholder="Anuladas" min="0" className="p-3 border border-gray-300 rounded-lg" />
                        </div>
                    </div>
                ))}
                <button type="button" onClick={handleAdicionarDisciplina} className="w-full font-semibold text-teal-600 border-2 border-dashed border-teal-400 rounded-lg py-3 hover:bg-teal-50 transition">
                    + Adicionar Matéria
                </button>
            </div>
            
            <div className="flex justify-end mt-8">
                 <button type="button" onClick={() => navigate(-1)} className="text-gray-600 font-bold py-3 px-6 mr-4 rounded-lg hover:bg-gray-200 transition">Voltar</button>
                <button type="submit" disabled={isSaving} className="bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition shadow-md">
                    {isSaving ? 'Salvando...' : 'Salvar Prova'}
                </button>
            </div>
        </form>
    );
};

export default AddProof;