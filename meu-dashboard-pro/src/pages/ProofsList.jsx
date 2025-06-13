import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProofs } from '../hooks/useProofs';
import TrashIcon from '../components/icons/TrashIcon';
import { formatDate, formatPercent } from '../utils/formatters'; // Importa a função de formatar porcentagem

const ProofsList = () => {
    const { proofsList, openDeleteModal } = useProofs();
    const navigate = useNavigate();

    const [filterBanca, setFilterBanca] = useState('todas');
    const [filterAno, setFilterAno] = useState('');
    const [sortBy, setSortBy] = useState('recentes');

    const processedProofs = useMemo(() => {
        let proofsWithStats = proofsList.map(proof => {
            const totals = proof.results.reduce((acc, r) => {
                acc.acertos += r.acertos;
                acc.erros += r.erros;
                acc.brancos += r.brancos;
                return acc;
            }, { acertos: 0, erros: 0, brancos: 0 });
            const totalQuestoes = totals.acertos + totals.erros + totals.brancos;
            const acertosLiquidos = totals.acertos - totals.erros;
            // A porcentagem líquida é calculada aqui
            const percentage = totalQuestoes > 0 ? (acertosLiquidos / totalQuestoes) : 0;
            return { ...proof, percentage };
        });

        if (filterBanca !== 'todas') {
            proofsWithStats = proofsWithStats.filter(p => p.banca.toLowerCase() === filterBanca.toLowerCase());
        }
        if (filterAno.trim() !== '') {
            proofsWithStats = proofsWithStats.filter(p => new Date(p.data).getUTCFullYear().toString() === filterAno.trim());
        }

        switch(sortBy) {
            case 'maior-nota':
                proofsWithStats.sort((a, b) => b.percentage - a.percentage);
                break;
            case 'menor-nota':
                proofsWithStats.sort((a, b) => a.percentage - b.percentage);
                break;
            case 'recentes':
            default:
                 proofsWithStats.sort((a, b) => new Date(b.data) - new Date(a.data));
                break;
        }
        return proofsWithStats;
    }, [proofsList, filterBanca, filterAno, sortBy]);

    const uniqueBancas = useMemo(() => ['todas', ...new Set(proofsList.map(p => p.banca).filter(Boolean))], [proofsList]);

    const handleSelectProof = (id) => {
        navigate(`/minhas-provas/${id}`);
    };

    return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-700">Minhas Provas</h2>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label htmlFor="banca-filter" className="block text-sm font-medium text-gray-700 mb-1">Banca</label>
                    <select id="banca-filter" value={filterBanca} onChange={e => setFilterBanca(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                         {uniqueBancas.map(banca => <option key={banca} value={banca}>{banca.charAt(0).toUpperCase() + banca.slice(1)}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="ano-filter" className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                    <input type="number" id="ano-filter" value={filterAno} onChange={e => setFilterAno(e.target.value)} placeholder="Ex: 2023" className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                    <select id="sort-filter" value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                        <option value="recentes">Mais Recentes</option>
                        <option value="maior-nota">Maior Nota</option>
                        <option value="menor-nota">Menor Nota</option>
                    </select>
                </div>
            </div>
        </div>

        {processedProofs.length === 0 ? (
             <p className="text-gray-500 text-center py-10 bg-white rounded-lg shadow-sm">Nenhuma prova encontrada.</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedProofs.map(proof => (
                    <div key={proof.id} className="bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                        <div onClick={() => handleSelectProof(proof.id)} className="text-left p-6 flex-grow cursor-pointer">
                            <h3 className="font-bold text-lg text-teal-600 truncate">{proof.titulo}</h3>
                            <p className="text-gray-600">{proof.banca}</p>
                            <p className="text-gray-400 text-sm mb-4">{formatDate(proof.data)}</p>

                            {/* --- CÓDIGO ADICIONADO --- */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500">Aproveitamento Líquido</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {formatPercent(proof.percentage)}
                                </p>
                            </div>
                            {/* --- FIM DO CÓDIGO ADICIONADO --- */}

                        </div>
                        <div className="px-6 pb-4 flex justify-end">
                            <button
                                onClick={(e) => { e.stopPropagation(); openDeleteModal(proof.id); }}
                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
                                aria-label="Deletar prova"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
    );
};

export default ProofsList;