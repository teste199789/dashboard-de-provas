import React, { useState, useMemo } from 'react';

const SimulateAnnulmentTab = ({ proof }) => {
    const [selectedAnnulments, setSelectedAnnulments] = useState(new Set());

    const handleToggleAnnulment = (qNumber) => {
        setSelectedAnnulments(prev => {
            const newSet = new Set(prev);
            const qStr = String(qNumber);
            newSet.has(qStr) ? newSet.delete(qStr) : newSet.add(qStr);
            return newSet;
        });
    };

    const clearSelection = () => {
        setSelectedAnnulments(new Set());
    };
    
    // --- LÓGICA DE CÁLCULO CENTRALIZADA E CORRIGIDA ---
    const performanceData = useMemo(() => {
        if (!proof || !proof.userAnswers || !proof.gabaritoDefinitivo || !proof.totalQuestoes) {
            return {
                original: { score: 0, acertos: 0, erros: 0 },
                simulated: { score: 0, acertos: 0, erros: 0 },
                difference: 0
            };
        }

        const userMap = new Map(proof.userAnswers.split(',').map(p => p.split(':')));
        const definMap = new Map(proof.gabaritoDefinitivo.split(',').map(p => p.split(':')));
        const prelimMap = new Map(proof.gabaritoPreliminar?.split(',').map(p => p.split(':')));
        
        let originalAcertos = 0;
        let originalErros = 0;
        let simulatedAcertos = 0;
        let simulatedErros = 0;

        for (let i = 1; i <= proof.totalQuestoes; i++) {
            const iStr = String(i);
            const userAnswer = userMap.get(iStr);
            const definAnswer = definMap.get(iStr);
            const prelimAnswer = prelimMap.get(iStr);

            const isOfficiallyAnnulled = (prelimMap.size > 0 && prelimAnswer && definAnswer && prelimAnswer !== definAnswer) || (definAnswer === 'N');

            // --- Lógica para a Pontuação Original ---
            if (isOfficiallyAnnulled) {
                originalAcertos++;
            } else if (userAnswer === definAnswer) {
                originalAcertos++;
            } else if (userAnswer) {
                originalErros++;
            }

            // --- Lógica para a Pontuação Simulada ---
            const isSimulatedAsAnnulled = selectedAnnulments.has(iStr);
            if (isOfficiallyAnnulled || isSimulatedAsAnnulled) {
                simulatedAcertos++;
            } else {
                if (userAnswer === definAnswer) {
                    simulatedAcertos++;
                } else if (userAnswer) {
                    simulatedErros++;
                }
            }
        }

        let originalScore = 0;
        let simulatedScore = 0;

        if (proof.tipoPontuacao === 'liquida') {
            originalScore = originalAcertos - originalErros;
            simulatedScore = simulatedAcertos - simulatedErros;
        } else {
            originalScore = originalAcertos;
            simulatedScore = simulatedAcertos;
        }

        return {
            original: { score: originalScore, acertos: originalAcertos, erros: originalErros },
            simulated: { score: simulatedScore, acertos: simulatedAcertos, erros: simulatedErros },
            difference: simulatedScore - originalScore,
        };

    }, [proof, selectedAnnulments]);
    
    const userAnswersMap = useMemo(() => new Map(proof.userAnswers?.split(',').map(p => p.split(':'))), [proof.userAnswers]);
    const definitiveAnswersMap = useMemo(() => new Map(proof.gabaritoDefinitivo?.split(',').map(p => p.split(':'))), [proof.gabaritoDefinitivo]);
    const questions = Array.from({ length: proof.totalQuestoes || 0 }, (_, i) => i + 1);

    return (
        <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Simulador de Anulações</h3>
            <p className="text-sm text-gray-500 mb-6">Selecione questões para simular uma anulação e veja o impacto na sua nota. Cada questão anulada (oficial ou simulada) é contada como um acerto.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Painel de Resultados */}
                <div className="md:col-span-1 lg:col-span-1 space-y-4">
                    <div className="p-4 bg-gray-100 rounded-lg text-center">
                        <p className="font-bold text-gray-700">Pontuação Original</p>
                        <p className="text-4xl font-light text-gray-800">{performanceData.original.score.toFixed(2).replace('.',',')}</p>
                        <p className="text-sm text-gray-600 mt-1">
                            {performanceData.original.acertos} acertos, {performanceData.original.erros} erros
                        </p>
                    </div>
                    <div className="p-4 bg-blue-100 rounded-lg border border-blue-300 text-center">
                        <p className="font-bold text-blue-800">Pontuação Simulada</p>
                        <p className="text-4xl font-bold text-blue-600">{performanceData.simulated.score.toFixed(2).replace('.',',')}</p>
                        <p className="text-sm text-blue-600 mt-1">{performanceData.simulated.acertos} acertos, {performanceData.simulated.erros} erros</p>
                        <p className={`font-bold text-lg mt-1 ${performanceData.difference > 0 ? 'text-green-600' : (performanceData.difference < 0 ? 'text-red-600' : 'text-gray-600')}`}>
                            {performanceData.difference > 0 ? '+' : ''}{performanceData.difference.toFixed(2).replace('.',',')} pontos
                        </p>
                    </div>
                </div>

                {/* Seletor de Questões */}
                <div className="md:col-span-2 lg:col-span-3 p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <p className="font-bold">Selecione as questões para anular:</p>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                                {selectedAnnulments.size} selecionada(s)
                            </span>
                            <button onClick={clearSelection} className="text-sm font-semibold text-blue-600 hover:underline">Limpar</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {questions.map(qNumber => {
                            const qStr = String(qNumber);
                            const userAnswer = userAnswersMap.get(qStr);
                            const definitiveAnswer = definitiveAnswersMap.get(qStr);
                            let questionColor = 'bg-gray-100 border-gray-300 text-gray-600';

                            if (userAnswer && definitiveAnswer && definitiveAnswer !== 'N') {
                                if (userAnswer === definitiveAnswer) {
                                    questionColor = 'bg-green-200 border-green-400 text-green-800';
                                } else {
                                    questionColor = 'bg-red-200 border-red-400 text-red-800';
                                }
                            }
                            
                            const isSelectedForAnnulment = selectedAnnulments.has(qStr);
                            const labelClass = `flex items-center justify-center p-2 border-2 rounded-md cursor-pointer transition font-semibold ${isSelectedForAnnulment ? 'ring-4 ring-blue-400 ring-offset-0 bg-blue-500 border-blue-600 text-white' : questionColor}`;

                            return (
                                <div key={qNumber}>
                                    <label className={labelClass}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isSelectedForAnnulment}
                                            onChange={() => handleToggleAnnulment(qNumber)}
                                        />
                                        {qNumber}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulateAnnulmentTab;