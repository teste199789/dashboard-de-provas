import React, { useState } from 'react';
import * as api from '../../api/apiService';
import AnswerGrid from '../../components/common/AnswerGrid';

const UserAnswersTab = ({ proof }) => {
    const [userAnswers, setUserAnswers] = useState(proof.userAnswers || '');
    const [isSaving, setIsSaving] = useState(false);

    const updateAnswerString = (qNumber, value) => {
        setUserAnswers(prev => {
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
            await api.updateProofDetails(proof.id, { userAnswers });
            alert('Seu gabarito foi salvo com sucesso!');
        } catch (error) {
            alert('Falha ao salvar seu gabarito.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Meu Gabarito</h3>
                <p className="text-sm text-gray-500 mb-4">Preencha com as respostas que você marcou na prova. Deixe em branco as questões não respondidas.</p>
                <AnswerGrid
                    totalQuestoes={proof.totalQuestoes}
                    answersString={userAnswers}
                    onAnswerChange={updateAnswerString}
                />
            </div>
            <div className="mt-6 border-t pt-4 flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50">
                    {isSaving ? 'Salvando...' : 'Salvar Meu Gabarito'}
                </button>
            </div>
        </div>
    );
};

export default UserAnswersTab;