import React, { useState, useMemo } from 'react';
import StatsRow from '../../components/common/StatsRow';
import { useProofs } from '../../hooks/useProofs';
import ScoreCard from '../../components/common/ScoreCard';
import * as api from '../../api/apiService';
import toast from 'react-hot-toast';

const ResultTab = ({ proof, refreshProof }) => {
    const [isGrading, setIsGrading] = useState(false);
    const [error, setError] = useState(null);
    const { handleGradeProof } = useProofs();

    const onGradeClick = async () => {
        setIsGrading(true);
        setError(null);
        try {
            await handleGradeProof(proof.id);
            await refreshProof();
            toast.success('Análise gerada com sucesso!');
        } catch (err) {
            setError("Falha ao corrigir a prova. Verifique se todos os gabaritos e matérias foram preenchidos corretamente.");
            toast.error('Falha ao corrigir a prova.');
            console.error("ERRO DETALHADO NO FRONTEND:", err);
        } finally {
            setIsGrading(false);
        }
    };

    const displayData = useMemo(() => {
        if (!proof || proof.results.length === 0) {
            return { scoreCards: [], detailedResults: [], totals: {} };
        }

        const anuladasTotais = proof.results.reduce((sum, r) => sum + r.anuladas, 0);
        const universoTotalValido = proof.totalQuestoes > 0 ? proof.totalQuestoes - anuladasTotais : 0;

        const detailedResults = proof.results.map(item => {
            const totalQuestoesNaMateria = item.acertos + item.erros + item.brancos + item.anuladas;
            const acertosLiquidos = item.acertos - item.erros;
            const universoValidoMateria = totalQuestoesNaMateria - item.anuladas;
            const percentualBruta = universoValidoMateria > 0 ? item.acertos / universoValidoMateria : 0;
            const percentualLiquidos = totalQuestoesNaMateria > 0 ? Math.max(0, acertosLiquidos / totalQuestoesNaMateria) : 0;
            return { ...item, totalQuestoes: totalQuestoesNaMateria, acertosLiquidos, percentualBruta, percentualLiquidos };
        });

        const acertosTotais = detailedResults.reduce((sum, r) => sum + r.acertos, 0);
        const errosTotais = detailedResults.reduce((sum, r) => sum + r.erros, 0);
        const brancosTotais = detailedResults.reduce((sum, r) => sum + r.brancos, 0);
        const pontuacaoTotal = acertosTotais - errosTotais;
        
        const scores = {
            cb: { pontuacao: 0, acertos: 0, erros: 0, brancos: 0 },
            ce: { pontuacao: 0, acertos: 0, erros: 0, brancos: 0 }
        };
        detailedResults.forEach(result => {
            const pontuacaoMateria = result.acertos - result.erros;
            const disciplinaNormalizada = result.disciplina.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (disciplinaNormalizada.includes('basico')) {
                scores.cb.pontuacao += pontuacaoMateria;
                scores.cb.acertos += result.acertos;
                scores.cb.erros += result.erros;
                scores.cb.brancos += result.brancos;
            } else if (disciplinaNormalizada.includes('especifico') || disciplinaNormalizada.includes('especializado')) {
                scores.ce.pontuacao += pontuacaoMateria;
                scores.ce.acertos += result.acertos;
                scores.ce.erros += result.erros;
                scores.ce.brancos += result.brancos;
            }
        });

        const scoreCards = [
            { title: 'total', score: pontuacaoTotal, percentage: proof.aproveitamento || 0, details: { acertos: acertosTotais, erros: errosTotais, brancos: brancosTotais }},
            { title: 'c.b.', score: scores.cb.pontuacao, percentage: universoTotalValido > 0 ? scores.cb.pontuacao / universoTotalValido : 0, details: scores.cb },
            { title: 'c.e.', score: scores.ce.pontuacao, percentage: universoTotalValido > 0 ? scores.ce.pontuacao / universoTotalValido : 0, details: scores.ce }
        ];

        const totals = {
            disciplina: 'Total', acertos: acertosTotais, erros: errosTotais,
            brancos: brancosTotais, anuladas: anuladasTotais, totalQuestoes: proof.totalQuestoes,
            acertosLiquidos: pontuacaoTotal,
            percentualLiquidos: proof.aproveitamento,
            percentualBruta: universoTotalValido > 0 ? acertosTotais / universoTotalValido : 0,
        };

        return { scoreCards, detailedResults, totals };
    }, [proof]);


    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Resultado e Análise</h2>
                <button onClick={onGradeClick} disabled={isGrading} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {isGrading ? 'Corrigindo...' : 'Corrigir e Atualizar Análise'}
                </button>
            </div>
            {error && <div className="my-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
            {proof.results.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p>Nenhum resultado calculado ainda.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x dark:divide-gray-700">
                            {displayData.scoreCards.map(card => (
                                <ScoreCard key={card.title} {...card} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Desempenho Detalhado por Matéria</h3>
                        <div className="text-sm text-gray-800 dark:text-gray-200 border dark:border-gray-700 rounded-lg overflow-hidden">
                            <div className="hidden md:grid grid-cols-9 text-center font-semibold bg-gray-200 dark:bg-gray-700 py-3 border-b-2 dark:border-gray-600">
                                <p className="text-left pl-4">Matéria</p>
                                <p>Acertos</p><p>Erros</p><p>Brancos</p><p>Anuladas</p>
                                <p>Questões</p><p>Líquidos</p><p>% Bruta</p><p>% Líquidos</p>
                            </div>
                            <div className="divide-y dark:divide-gray-700">
                                {displayData.detailedResults.map((item, index) => <StatsRow key={index} item={item} />)}
                            </div>
                            <StatsRow item={displayData.totals} isFooter={true} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultTab; // <-- A LINHA QUE FALTAVA