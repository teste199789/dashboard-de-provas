import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../api/apiService'; // Nosso serviço de API

export const ProofsContext = createContext();

export const ProofsProvider = ({ children }) => {
    const [proofsList, setProofsList] = useState([]);
    const [analysis, setAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalState, setModalState] = useState({ isOpen: false, proofId: null });

    const fetchProofs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // USANDO A API REAL AGORA
            const data = await api.getProofs();
            setProofsList(data);
        } catch (e) {
            console.error("Erro ao buscar dados:", e);
            setError("Não foi possível carregar os dados. Verifique o console ou o servidor backend.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProofs();
    }, [fetchProofs]);

    const handleAddProof = async (newProof) => {
        try {
            // USANDO A API REAL AGORA
            await api.addProof(newProof);
            fetchProofs(); // Atualiza a lista com os dados do servidor
            return true;
        } catch (error) {
            console.error("Erro ao adicionar prova:", error);
            setError("Falha ao salvar a prova.");
            return false;
        }
    };

    const handleDeleteProof = async () => {
        const id = modalState.proofId;
        if (!id) return;

        try {
            // USANDO A API REAL AGORA
            await api.deleteProof(id);
            fetchProofs(); // Atualiza a lista com os dados do servidor
            closeDeleteModal();
        } catch (error) {
            console.error("Erro ao deletar prova:", error);
            setError("Falha ao deletar a prova.");
            closeDeleteModal();
        }
    };
    
    // O resto do arquivo continua igual...
    const openDeleteModal = (id) => setModalState({ isOpen: true, proofId: id });
    const closeDeleteModal = () => setModalState({ isOpen: false, proofId: null });

    const consolidatedData = useMemo(() => {
        const initial = {
            'Conhecimentos Básicos': { id: 1, disciplina: 'Conhecimentos Básicos', acertos: 0, erros: 0, brancos: 0, anuladas: 0 },
            'Conhecimentos Específicos': { id: 2, disciplina: 'Conhecimentos Específicos', acertos: 0, erros: 0, brancos: 0, anuladas: 0 },
            'Conhecimentos Especializados': { id: 3, disciplina: 'Conhecimentos Especializados', acertos: 0, erros: 0, brancos: 0, anuladas: 0 },
        };

        proofsList.forEach(proof => {
            proof.results.forEach(result => {
                if (initial[result.disciplina]) {
                    initial[result.disciplina].acertos += result.acertos;
                    initial[result.disciplina].erros += result.erros;
                    initial[result.disciplina].brancos += result.brancos;
                    initial[result.disciplina].anuladas += result.anuladas;
                }
            });
        });
        
        const processedDisciplinas = Object.values(initial).map(item => {
            const totalQuestoes = item.acertos + item.erros + item.brancos;
            const acertosLiquidos = item.acertos - item.erros;
            const percentualBruta = totalQuestoes > 0 ? item.acertos / totalQuestoes : 0;
            const percentualLiquidos = totalQuestoes > 0 ? (acertosLiquidos > 0 ? acertosLiquidos / totalQuestoes : 0) : 0;
            return { ...item, totalQuestoes, acertosLiquidos, percentualBruta, percentualLiquidos };
        });

         const totais = processedDisciplinas.reduce((acc, current) => {
            acc.acertos += current.acertos;
            acc.erros += current.erros;
            acc.brancos += current.brancos;
            acc.anuladas += current.anuladas;
            acc.totalQuestoes += current.totalQuestoes;
            acc.acertosLiquidos += current.acertosLiquidos;
            return acc;
          }, { disciplina: 'Total', acertos: 0, erros: 0, brancos: 0, anuladas: 0, totalQuestoes: 0, acertosLiquidos: 0 });
          
          totais.percentualBruta = totais.totalQuestoes > 0 ? totais.acertos / totais.totalQuestoes : 0;
          totais.percentualLiquidos = totais.totalQuestoes > 0 ? (totais.acertosLiquidos > 0 ? totais.acertosLiquidos / totais.totalQuestoes : 0) : 0;

        return { disciplinas: processedDisciplinas, totais };
    }, [proofsList]);

    const handleAnalysisRequest = async () => {
        setIsAnalyzing(true);
        setAnalysis('');
        const { disciplinas, totais } = consolidatedData;
        const result = await api.getAIAnalysis(disciplinas, totais);
        setAnalysis(result);
        setIsAnalyzing(false);
    };
    
    const value = {
        proofsList, analysis, isAnalyzing, isLoading, error, modalState, consolidatedData,
        fetchProofs, handleAddProof, openDeleteModal, closeDeleteModal, handleDeleteProof,
        handleAnalysisRequest, clearAnalysis: () => setAnalysis('')
    };

    return (
        <ProofsContext.Provider value={value}>
            {children}
        </ProofsContext.Provider>
    );
};