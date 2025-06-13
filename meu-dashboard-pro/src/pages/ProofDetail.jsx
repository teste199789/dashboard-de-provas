import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../api/apiService';
import { useProofs } from '../hooks/useProofs';
import StatsRow from '../components/common/StatsRow';
import TrashIcon from '../components/icons/TrashIcon';
import { formatDate } from '../utils/formatters'; // Importa a função de formatação

const ProofDetail = () => {
    const { proofId } = useParams();
    const navigate = useNavigate();
    const { openDeleteModal } = useProofs();

    const [proof, setProof] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProof = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await api.getProofById(proofId);
                setProof(data);
            } catch (err) {
                setError("Não foi possível carregar os detalhes da prova.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProof();
    }, [proofId]);

    const proofTotals = useMemo(() => {
        if (!proof) return null;
        
        const processedData = proof.results.map(item => {
            const totalQuestoes = item.acertos + item.erros + item.brancos;
            const acertosLiquidos = item.acertos - item.erros;
            const percentualBruta = totalQuestoes > 0 ? item.acertos / totalQuestoes : 0;
            const percentualLiquidos = totalQuestoes > 0 ? (acertosLiquidos > 0 ? acertosLiquidos / totalQuestoes : 0) : 0;
            return { ...item, totalQuestoes, acertosLiquidos, percentualBruta, percentualLiquidos };
        });

        const totals = processedData.reduce((acc, current) => {
            acc.acertos += current.acertos;
            acc.erros += current.erros;
            acc.anuladas += current.anuladas;
            acc.brancos += current.brancos;
            acc.totalQuestoes += current.totalQuestoes;
            acc.acertosLiquidos += current.acertosLiquidos;
            return acc;
        }, { disciplina: 'Total', acertos: 0, erros: 0, brancos: 0, anuladas: 0, totalQuestoes: 0, acertosLiquidos: 0 });

        totals.percentualBruta = totals.totalQuestoes > 0 ? totals.acertos / totals.totalQuestoes : 0;
        totals.percentualLiquidos = totals.totalQuestoes > 0 ? (totals.acertosLiquidos > 0 ? totals.acertosLiquidos / totals.totalQuestoes : 0) : 0;
        
        return { processedData, totals };
    }, [proof]);


    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>;
    }

    if (!proof) return null;

    return (
         <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="bg-green-600 text-white p-4 flex justify-between items-center gap-4 flex-wrap">
                <div className="flex-grow">
                    <h2 className="text-2xl font-bold">{proof.titulo}</h2>
                    <p className="text-green-200">{proof.banca} - {formatDate(proof.data)}</p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <button onClick={() => navigate('/minhas-provas')} className="text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition">Voltar</button>
                    <button
                        onClick={() => openDeleteModal(proof.id)}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition flex items-center"
                        aria-label="Deletar prova"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="text-sm text-gray-800">
                <div className="hidden md:grid grid-cols-9 text-center font-semibold bg-green-200 py-3 border-b-2 border-green-300">
                    <p className="text-left pl-4">Matérias</p>
                    <p>Acertos</p><p>Erros</p><p>Brancos</p><p>Anuladas</p>
                    <p>Questões</p><p>Líquidos</p><p>% Bruta</p><p>% Líquidos</p>
                </div>
                <div className="divide-y divide-gray-200">
                    {proofTotals.processedData.map((item, index) => <StatsRow key={index} item={item} />)}
                </div>
                <StatsRow item={proofTotals.totals} isFooter={true} />
            </div>
        </div>
    );
}

export default ProofDetail;