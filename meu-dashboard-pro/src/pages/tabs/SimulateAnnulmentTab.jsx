import React, { useState, useMemo } from 'react';
import { calculatePerformance } from '../../utils/calculators'; // Vamos precisar do calculador

// Função auxiliar para simular a pontuação
const simulateScore = (proof, annulledSet) => {
    if (!proof || !proof.userAnswers || !proof.gabaritoDefinitivo) return { finalScore: 0, newAcertos: 0 };

    const userMap = new Map(proof.userAnswers.split(',').map(p => p.split(':')));
    const definMap = new Map(proof.gabaritoDefinitivo.split(',').map(p => p.split(':')));
    
    let acertos = 0;
    let erros = 0;

    for(let i = 1; i <= proof.totalQuestoes; i++) {
        const iStr = String(i);
        const userAnswer = userMap.get(iStr);
        const definAnswer = definMap.get(iStr);

        if (annulledSet.has(iStr)) {
            // Se a questão simulada como anulada foi errada ou deixada em branco, vira um acerto.
            if (!userAnswer || userAnswer !== definAnswer) {
                acertos++;
            } else {
                acertos++; // Se já tinha acertado, continua acertando
            }
        } else {
            // Lógica normal
            if (userAnswer === definAnswer) {
                acertos++;
            } else if (userAnswer) {
                erros++;
            }
        }
    }

    let finalScore = acertos;
    if (proof.tipoPontuacao === 'liquida') {
        finalScore = acertos - erros;
    }

    return { 
        finalScore: Math.max(0, finalScore), 
        newAcertos: acertos,
        newErros: erros
    };
};


const SimulateAnnulmentTab = ({ proof }) => {
    const [annulledQuestions, setAnnulledQuestions] = useState(new Set());

    const handleToggleAnnulment = (qNumber) => {
        setAnnulledQuestions(prev => {
            const newSet = new Set(prev);
            const qStr = String(qNumber);
            if (newSet.has(qStr)) {
                newSet.delete(qStr);
            } else {
                newSet.add(qStr);
            }
            return newSet;
        });
    };

    const originalPerformance = useMemo(() => calculatePerformance(proof), [proof]);
    const simulatedPerformance = useMemo(() => simulateScore(proof, annulledQuestions), [proof, annulledQuestions]);

    const questions = Array.from({ length: proof.totalQuestoes || 0 }, (_, i) => i + 1);

    return (
        <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Simulador de Anulações</h3>
            <p className="text-sm text-gray-500 mb-6">Selecione as questões que você acha que podem ser anuladas e veja o impacto na sua nota em tempo real. A regra é: uma questão anulada conta como um acerto.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Painel de Resultados */}
                <div className="md:col-span-1 space-y-4">
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <p className="font-bold text-gray-700">Pontuação Original</p>
                        <p className="text-3xl font-bold text-teal-600">{(originalPerformance.percentage * 100).toFixed(2).replace('.',',')}%</p>
                    </div>
                    <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
                        <p className="font-bold text-blue-800">Pontuação Simulada</p>
                        <p className="text-3xl font-bold text-blue-600">
                            {((simulatedPerformance.finalScore / proof.totalQuestoes) * 100).toFixed(2).replace('.',',')}%
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                            {simulatedPerformance.newAcertos} acertos, {simulatedPerformance.newErros} erros
                        </p>
                    </div>
                </div>

                {/* Seletor de Questões */}
                <div className="md:col-span-2 lg:col-span-3 p-4 border rounded-lg">
                    <p className="font-bold mb-4">Selecione as questões para simular a anulação:</p>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {questions.map(qNumber => (
                            <div key={qNumber} >
                                <label className={`flex items-center justify-center p-2 border-2 rounded-md cursor-pointer transition ${annulledQuestions.has(String(qNumber)) ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={annulledQuestions.has(String(qNumber))}
                                        onChange={() => handleToggleAnnulment(qNumber)}
                                    />
                                    {qNumber}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulateAnnulmentTab;