import React, { useState, useMemo } from 'react';
import * as api from '../../api/apiService';
import AnswerGrid from '../../components/common/AnswerGrid';

// Função auxiliar para converter "1:A,2:B" para {1: 'A', 2: 'B'}
const stringToMap = (str) => {
    if (!str) return {};
    return str.split(',').reduce((acc, pair) => {
        const [q, a] = pair.split(':');
        if (q && a) acc[q] = a;
        return acc;
    }, {});
};

// Função auxiliar para converter {1: 'A', 2: 'B'} para "1:A,2:B"
const mapToString = (map) => {
    return Object.entries(map)
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .map(entry => entry.join(':'))
        .join(',');
};

const OfficialKeysTab = ({ proof }) => {
    // O estado agora é um objeto, não uma string!
    const [preliminarMap, setPreliminarMap] = useState(() => stringToMap(proof.gabaritoPreliminar));
    const [definitivoMap, setDefinitivoMap] = useState(() => stringToMap(proof.gabaritoDefinitivo));
    const [isSaving, setIsSaving] = useState(false);

    // Função de atualização de estado, agora muito mais rápida
    const handleAnswerChange = (setter, qNumber, value) => {
        setter(prev => {
            const newAnswers = { ...prev };
            const qStr = String(qNumber);
            if (value) {
                newAnswers[qStr] = value;
            } else {
                delete newAnswers[qStr];
            }
            return newAnswers;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Converte para string apenas no momento de salvar
            await api.updateProofDetails(proof.id, {
                gabaritoPreliminar: mapToString(preliminarMap),
                gabaritoDefinitivo: mapToString(definitivoMap),
            });
            alert('Gabaritos da banca salvos com sucesso!');
        } catch (error) {
            alert('Falha ao salvar os gabaritos.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Gabarito Preliminar</h3>
                <p className="text-sm text-gray-500 mb-4">Insira o gabarito oficial liberado antes dos recursos.</p>
                <AnswerGrid
                    totalQuestoes={proof.totalQuestoes}
                    answersMap={preliminarMap}
                    onAnswerChange={(q, v) => handleAnswerChange(setPreliminarMap, q, v)}
                />
            </div>
            <div className="border-t my-6"></div>
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Gabarito Definitivo</h3>
                <p className="text-sm text-gray-500 mb-4">Insira o gabarito final. Questões alteradas ou anuladas serão destacadas.</p>
                <AnswerGrid
                    totalQuestoes={proof.totalQuestoes}
                    answersMap={definitivoMap}
                    onAnswerChange={(q, v) => handleAnswerChange(setDefinitivoMap, q, v)}
                    comparisonMap={preliminarMap}
                />
            </div>
            <div className="mt-6 border-t pt-4 flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50">
                    {isSaving ? 'Salvando...' : 'Salvar Gabaritos'}
                </button>
            </div>
        </div>
    );
};

export default OfficialKeysTab;