import React, { useState, useMemo } from 'react';
import { useProofs } from '../hooks/useProofs';
import ProofDetailCard from '../components/common/ProofDetailCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProofsList = () => {
    const { proofsList, openDeleteModal, isLoading } = useProofs();

    const [filterBanca, setFilterBanca] = useState('todas');
    const uniqueBancas = useMemo(() => ['todas', ...new Set(proofsList.map(p => p.banca).filter(Boolean))], [proofsList]);
    
    const processedProofs = useMemo(() => {
        let proofs = [...proofsList];
        
        if (filterBanca !== 'todas') {
            proofs = proofs.filter(p => p.banca.toLowerCase().includes(filterBanca.toLowerCase()));
        }

        return proofs.sort((a, b) => new Date(b.data) - new Date(a.data));

    }, [proofsList, filterBanca]);

    if (isLoading) {
        return <LoadingSpinner message="Carregando suas provas..." />
    }

    return (
    <div className="space-y-6">
        <div className="text-center"> {/* Container para centralizar */}
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Meu Histórico de Provas</h2>
        </div>
        
        <div className="max-w-xs mx-auto"> {/* Filtro também centralizado e com largura máxima */}
            <label htmlFor="banca-filter" className="sr-only">Filtrar por Banca</label>
            <select 
                id="banca-filter" 
                value={filterBanca} 
                onChange={e => setFilterBanca(e.target.value)} 
                className="w-full p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
            >
                {uniqueBancas.map(banca => <option key={banca} value={banca}>{banca.charAt(0).toUpperCase() + banca.slice(1)}</option>)}
            </select>
        </div>
        
        {processedProofs.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-xl">
                <p className="font-semibold text-gray-600 dark:text-gray-300">Nenhuma prova cadastrada.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Vá para a aba "Cadastrar Prova" para começar.</p>
             </div>
        ) : (
            <div className="space-y-6">
                {processedProofs.map(proof => (
                    <ProofDetailCard key={proof.id} proof={proof} />
                ))}
            </div>
        )}
    </div>
    );
};

export default ProofsList;