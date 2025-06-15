import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProofs } from '../hooks/useProofs';
import TrashIcon from '../components/icons/TrashIcon';
import PencilIcon from '../components/icons/PencilIcon';
import { formatDate, formatPercent } from '../utils/formatters';
import ProofLogo from '../components/common/ProofLogo';

const ProofsList = () => {
    const { proofsList, openDeleteModal } = useProofs();
    const navigate = useNavigate();

    const [filterBanca, setFilterBanca] = useState('todas');
    const [filterAno, setFilterAno] = useState('');
    const [sortBy, setSortBy] = useState('recentes');

    // A lógica de filtragem e ordenação continua a mesma
    const processedProofs = useMemo(() => {
        let proofsWithStats = [...proofsList];
        if (filterBanca !== 'todas') {
            proofsWithStats = proofsWithStats.filter(p => p.banca.toLowerCase().includes(filterBanca.toLowerCase()));
        }
        if (filterAno.trim() !== '') {
            proofsWithStats = proofsWithStats.filter(p => new Date(p.data).getUTCFullYear().toString() === filterAno.trim());
        }
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
            {/* Filtros */}
        </div>

        {processedProofs.length === 0 ? (
             <p className="text-gray-500 text-center py-10 bg-white rounded-lg shadow-sm">Nenhuma prova encontrada.</p>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {processedProofs.map(proof => (
                    <div key={proof.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
                        <div onClick={() => handleSelectProof(proof.id)} className="p-6 flex-grow cursor-pointer">
                            <div className="grid grid-cols-12 gap-5 items-center">
                                <div className="col-span-3 lg:col-span-2 flex justify-center">
                                    {/* --- MUDANÇA AQUI --- */}
                                    <ProofLogo titulo={proof.titulo} />
                                </div>

                                <div className="col-span-9 lg:col-span-10">
                                    <p className="font-semibold text-gray-600">{formatDate(proof.data)}</p>
                                    <hr className="my-2"/>
                                    <p className="font-bold text-gray-800">{proof.banca.toUpperCase()}</p>
                                    <h3 className="text-lg font-bold text-blue-700 mt-1 leading-tight">{proof.titulo}</h3>
                                </div>
                            </div>
                            {typeof proof.aproveitamento === 'number' && (
                                <div className="mt-4 pt-4 border-t text-right">
                                    <p className="text-sm text-gray-500">Aproveitamento Líquido</p>
                                    <p className="text-3xl font-bold text-gray-800">
                                        {formatPercent(proof.aproveitamento)}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="px-6 pb-4 flex items-center justify-end space-x-2">
                            <button onClick={(e) => { e.stopPropagation(); handleSelectProof(proof.id); }} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors" title="Editar Prova">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); openDeleteModal(proof.id); }} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors" title="Deletar Prova">
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