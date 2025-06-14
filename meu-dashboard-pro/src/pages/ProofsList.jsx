import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProofs } from '../hooks/useProofs';
import TrashIcon from '../components/icons/TrashIcon';
import { formatDate, formatPercent } from '../utils/formatters';

const ProofsList = () => {
    const { proofsList, openDeleteModal } = useProofs();
    const navigate = useNavigate();

    const [filterBanca, setFilterBanca] = useState('todas');
    const [filterAno, setFilterAno] = useState('');
    const [sortBy, setSortBy] = useState('recentes');

    const processedProofs = useMemo(() => {
        let proofsWithStats = [...proofsList]; // Cria uma cópia da lista

        // Filtros
        if (filterBanca !== 'todas') {
            proofsWithStats = proofsWithStats.filter(p => p.banca.toLowerCase() === filterBanca.toLowerCase());
        }
        if (filterAno.trim() !== '') {
            proofsWithStats = proofsWithStats.filter(p => new Date(p.data).getUTCFullYear().toString() === filterAno.trim());
        }

        // Ordenação
        switch(sortBy) {
            case 'maior-nota':
                proofsWithStats.sort((a, b) => (b.aproveitamento || 0) - (a.aproveitamento || 0));
                break;
            case 'menor-nota':
                proofsWithStats.sort((a, b) => (a.aproveitamento || 0) - (b.aproveitamento || 0));
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
             {/* Filtros... */}
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

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500">Aproveitamento</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {/* Usa o aproveitamento que vem direto do backend */}
                                    {formatPercent(proof.aproveitamento)}
                                </p>
                            </div>

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