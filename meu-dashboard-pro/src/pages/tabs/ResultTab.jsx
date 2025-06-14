import React, { useState, useMemo } from 'react';
import * as api from '../../api/apiService';
import StatsRow from '../../components/common/StatsRow';
import { calculatePerformance } from '../../utils/calculators';

const ResultTab = ({ proof, refreshProof }) => {
    const [isGrading, setIsGrading] = useState(false);
    const [error, setError] = useState(null);

    const handleGrade = async () => {
        setIsGrading(true);
        setError(null);
        try {
            await api.gradeProof(proof.id);
            // A função refreshProof vai buscar os novos dados do 'proof' e causar uma re-renderização
            await refreshProof(); 
        } catch (err) {
            setError("Falha ao corrigir a prova. Verifique se todos os gabaritos e matérias foram preenchidos corretamente.");
            console.error("ERRO DETALHADO NO FRONTEND:", err);
        } finally {
            setIsGrading(false);
        }
    };

    // Usamos o useMemo para recalcular os totais e percentuais sempre que o 'proof' (com os novos resultados) mudar.
    const calculatedResults = useMemo(() => {
        if (!proof || proof.results.length === 0) {
            return {
                detailedResults: [],
                totals: {},
            };
        }

        const overallPerformance = calculatePerformance(proof);

        // Mapeia os resultados para adicionar os campos que StatsRow precisa
        const detailedResults = proof.results.map(item => {
            const totalQuestoes = item.acertos + item.erros + item.brancos;
            const acertosLiquidos = item.acertos - item.erros;
            const percentualBruta = totalQuestoes > 0 ? item.acertos / totalQuestoes : 0;
            const percentualLiquidos = totalQuestoes > 0 ? Math.max(0, acertosLiquidos / totalQuestoes) : 0;
            return { ...item, totalQuestoes, acertosLiquidos, percentualBruta, percentualLiquidos };
        });

        const acertosTotais = detailedResults.reduce((sum, r) => sum + r.acertos, 0);
        const errosTotais = detailedResults.reduce((sum, r) => sum + r.erros, 0);
        
        const totals = {
            disciplina: 'Total',
            acertos: acertosTotais,
            erros: errosTotais,
            brancos: detailedResults.reduce((sum, r) => sum + r.brancos, 0),
            anuladas: detailedResults.reduce((sum, r) => sum + r.anuladas, 0),
            totalQuestoes: proof.totalQuestoes,
            acertosLiquidos: acertosTotais - errosTotais,
            percentualLiquidos: overallPerformance.percentage,
            percentualBruta: proof.totalQuestoes > 0 ? acertosTotais / proof.totalQuestoes : 0,
        };

        return { detailedResults, totals };

    }, [proof]);


    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Resultado e Análise</h3>
                <button onClick={handleGrade} disabled={isGrading} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {isGrading ? 'Corrigindo...' : 'Corrigir e Atualizar Análise'}
                </button>
            </div>

            {error && <div className="my-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            {proof.results.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg">
                    <p>Nenhum resultado calculado ainda.</p>
                    <p className="text-sm mt-2">Preencha os gabaritos e clique no botão acima para gerar a análise.</p>
                </div>
            ) : (
                <div className="text-sm text-gray-800 border rounded-lg overflow-hidden">
                    <div className="hidden md:grid grid-cols-9 text-center font-semibold bg-gray-200 py-3 border-b-2 border-gray-300">
                        <p className="text-left pl-4">Matéria</p>
                        <p>Acertos</p><p>Erros</p><p>Brancos</p><p>Anuladas</p>
                        <p>Questões</p><p>Líquidos</p><p>% Bruta</p><p>% Líquidos</p>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {calculatedResults.detailedResults.map((item, index) => <StatsRow key={index} item={item} />)}
                    </div>
                    <StatsRow item={calculatedResults.totals} isFooter={true} />
                </div>
            )}
        </div>
    );
};

export default ResultTab;