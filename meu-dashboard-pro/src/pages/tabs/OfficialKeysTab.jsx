import React, { useState } from 'react';
import * as api from '../../api/apiService';
import AnswerGrid from '../../components/common/AnswerGrid';

const OfficialKeysTab = ({ proof }) => {
    const [preliminar, setPreliminar] = useState(proof.gabaritoPreliminar || '');
    const [definitivo, setDefinitivo] = useState(proof.gabaritoDefinitivo || '');
    const [isSaving, setIsSaving] = useState(false);

    const updateAnswerString = (setter, qNumber, value) => {
        setter(prev => {
            const map = new Map(prev.split(',').map(p => p.split(':')));
            if (value) {
                map.set(String(qNumber), value);
            } else {
                map.delete(String(qNumber));
            }
            return Array.from(map.entries()).map(p => p.join(':')).join(',');
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.updateProofDetails(proof.id, {
                gabaritoPreliminar: preliminar,
                gabaritoDefinitivo: definitivo,
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
                    answersString={preliminar}
                    onAnswerChange={(q, v) => updateAnswerString(setPreliminar, q, v)}
                />
            </div>
            <div className="border-t my-6"></div>
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Gabarito Definitivo</h3>
                <p className="text-sm text-gray-500 mb-4">Insira o gabarito final, liberado após a análise dos recursos.</p>
                <AnswerGrid
                    totalQuestoes={proof.totalQuestoes}
                    answersString={definitivo}
                    onAnswerChange={(q, v) => updateAnswerString(setDefinitivo, q, v)}
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