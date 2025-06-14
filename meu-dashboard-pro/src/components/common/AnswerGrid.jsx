import React, { useMemo } from 'react';

const AnswerGrid = ({ totalQuestoes, answersString, onAnswerChange, readOnly = false }) => {
    // Transforma a string de respostas "1:A,2:B" em um objeto {1: 'A', 2: 'B'} para acesso rápido.
    // O useMemo evita que isso seja recalculado a cada renderização.
    const answersMap = useMemo(() => {
        if (!answersString) return {};
        return answersString.split(',').reduce((acc, pair) => {
            const [q, a] = pair.split(':');
            if (q && a) {
                acc[q] = a;
            }
            return acc;
        }, {});
    }, [answersString]);

    const handleInputChange = (qNumber, value) => {
        // Limita a um caractere e converte para maiúsculas
        const sanitizedValue = value.slice(0, 1).toUpperCase();
        onAnswerChange(qNumber, sanitizedValue);
    };

    // Gera um array de números de 1 até totalQuestoes
    const questions = Array.from({ length: totalQuestoes }, (_, i) => i + 1);

    return (
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-4">
            {questions.map(qNumber => (
                <div key={qNumber} className="text-center">
                    <label className="font-bold text-gray-700">{qNumber}</label>
                    <input
                        type="text"
                        maxLength="1"
                        value={answersMap[qNumber] || ''}
                        onChange={(e) => handleInputChange(qNumber, e.target.value)}
                        readOnly={readOnly}
                        className="w-full mt-1 p-2 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                    />
                </div>
            ))}
        </div>
    );
};

export default AnswerGrid;