import React from 'react';
import { useProofs } from '../hooks/useProofs';
import StatsRow from '../components/common/StatsRow';
import AIAnalysisCard from '../components/common/AIAnalysisCard';
import SparklesIcon from '../components/icons/SparklesIcon';

const Dashboard = () => {
    const { 
        consolidatedData, 
        analysis, 
        isAnalyzing, 
        handleAnalysisRequest, 
        clearAnalysis 
    } = useProofs();
    
    const { disciplinas, totais } = consolidatedData;

    return (
        <>
            <AIAnalysisCard analysis={analysis} isLoading={isAnalyzing} onClear={clearAnalysis} />
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                <div className="bg-orange-400 text-white flex justify-between items-center py-4 px-6">
                    <h2 className="text-xl font-bold tracking-wider">DADOS CONSOLIDADOS</h2>
                    <button
                        onClick={handleAnalysisRequest}
                        disabled={isAnalyzing || totais.totalQuestoes === 0}
                        className="bg-white text-teal-600 font-bold py-2 px-4 rounded-lg hover:bg-teal-50 transition duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="w-5 h-5 mr-2"/>
                        {isAnalyzing ? 'Analisando...' : 'Análise com IA'}
                    </button>
                </div>
                <div className="text-sm text-gray-800">
                    <div className="hidden md:grid grid-cols-9 text-center font-semibold bg-teal-200 py-3 border-b-2 border-teal-300">
                        <p className="text-left pl-4">Disciplinas</p>
                        <p>Acertos</p><p>Erros</p><p>Brancos</p><p>Anuladas</p>
                        <p>Questões</p><p>Líquidos</p><p>% Bruta</p><p>% Líquidos</p>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {disciplinas.map(item => <StatsRow key={item.id} item={item} />)}
                    </div>
                    <StatsRow item={totais} isFooter={true} />
                </div>
            </div>
        </>
    );
};

export default Dashboard;