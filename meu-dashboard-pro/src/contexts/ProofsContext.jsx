import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../api/apiService';

export const ProofsContext = createContext();

export const ProofsProvider = ({ children }) => {
    const [proofsList, setProofsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalState, setModalState] = useState({ isOpen: false, proofId: null });
    const [analysis, setAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const fetchProofs = useCallback(async () => {
        setError(null);
        try {
            const data = await api.getProofs();
            setProofsList(data);
        } catch (e) {
            console.error("Erro ao buscar dados:", e);
            setError("Não foi possível carregar os dados.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        fetchProofs();
    }, [fetchProofs]);

    const handleAddProof = async (newProofData) => {
        try {
            const newProof = await api.addProof(newProofData);
            await fetchProofs();
            return newProof;
        } catch (error) {
            setError("Falha ao criar a prova.");
            throw error;
        }
    };

    const handleGradeProof = async (proofId) => {
        try {
            await api.gradeProof(proofId);
            const updatedProof = await api.getProofById(proofId);
            setProofsList(currentList => 
                currentList.map(p => 
                    p.id === proofId ? updatedProof : p
                )
            );
            return true;
        } catch(err) {
            throw err;
        }
    };

    const openDeleteModal = (id) => setModalState({ isOpen: true, proofId: id });
    const closeDeleteModal = () => setModalState({ isOpen: false, proofId: null });

    const handleDeleteProof = async () => {
        const id = modalState.proofId;
        if (!id) return;
        try {
            await api.deleteProof(id);
            closeDeleteModal();
            fetchProofs();
        } catch (error) {
            setError("Falha ao deletar a prova.");
            closeDeleteModal();
        }
    };

    const consolidatedData = useMemo(() => {
        const disciplineTotals = {};

        proofsList.forEach(proof => {
            if (proof.results && proof.results.length > 0 && proof.subjects && proof.subjects.length > 0) {
                const subjectQuestionMap = new Map(proof.subjects.map(s => [s.nome, s.questoes]));
                proof.results.forEach(result => {
                    const { disciplina, acertos, erros, brancos, anuladas } = result;
                    if (!disciplineTotals[disciplina]) {
                        disciplineTotals[disciplina] = { acertos: 0, erros: 0, brancos: 0, anuladas: 0, totalQuestoes: 0 };
                    }
                    disciplineTotals[disciplina].acertos += acertos;
                    disciplineTotals[disciplina].erros += erros;
                    disciplineTotals[disciplina].brancos += brancos;
                    disciplineTotals[disciplina].anuladas += anuladas;
                    disciplineTotals[disciplina].totalQuestoes += subjectQuestionMap.get(disciplina) || 0;
                });
            }
        });

        const processedDisciplinas = Object.entries(disciplineTotals).map(([nome, totais], index) => {
            const acertosComAnuladas = totais.acertos; // 'acertos' já inclui os pontos das anuladas
            const pontuacaoLiquida = acertosComAnuladas - totais.erros;
            const universoValido = totais.totalQuestoes - totais.anuladas;

            return {
                id: index,
                disciplina: nome,
                ...totais,
                acertosLiquidos: pontuacaoLiquida,
                percentualBruta: universoValido > 0 ? acertosComAnuladas / universoValido : 0,
                percentualLiquidos: totais.totalQuestoes > 0 ? Math.max(0, pontuacaoLiquida / totais.totalQuestoes) : 0,
            };
        });

        const totaisGerais = processedDisciplinas.reduce((acc, current) => {
            acc.acertos += current.acertos;
            acc.erros += current.erros;
            acc.brancos += current.brancos;
            acc.anuladas += current.anuladas;
            acc.totalQuestoes += current.totalQuestoes;
            return acc;
        }, { disciplina: 'Total', acertos: 0, erros: 0, brancos: 0, anuladas: 0, totalQuestoes: 0 });

        const pontuacaoLiquidaGeral = totaisGerais.acertos - totaisGerais.erros;
        const universoTotalValido = totaisGerais.totalQuestoes - totaisGerais.anuladas;
        
        totaisGerais.acertosLiquidos = pontuacaoLiquidaGeral;
        // --- FÓRMULA FINAL CORRIGIDA PARA O TOTAL ---
        totaisGerais.percentualBruta = universoTotalValido > 0 ? totaisGerais.acertos / universoTotalValido : 0;
        totaisGerais.percentualLiquidos = totaisGerais.totalQuestoes > 0 ? Math.max(0, pontuacaoLiquidaGeral / totaisGerais.totalQuestoes) : 0;

        return { disciplinas: processedDisciplinas, totais: totaisGerais };
    }, [proofsList]);

    
    const value = {
        proofsList, consolidatedData, isLoading, error, modalState, fetchProofs, handleAddProof, 
        openDeleteModal, closeDeleteModal, handleDeleteProof, handleGradeProof,
        analysis, isAnalyzing,
    };

    return <ProofsContext.Provider value={value}>{children}</ProofsContext.Provider>;
};