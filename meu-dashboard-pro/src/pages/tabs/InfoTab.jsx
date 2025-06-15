import React, { useState, useEffect } from 'react';
import * as api from '../../api/apiService';
import TrashIcon from '../../components/icons/TrashIcon';
import toast from 'react-hot-toast';

const InfoTab = ({ proof, refreshProof }) => {
    const [subjects, setSubjects] = useState(proof.subjects || [{ nome: '', questoes: '' }]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSubjects(proof.subjects.length > 0 ? proof.subjects.map(s => ({...s})) : [{ nome: '', questoes: '' }]);
    }, [proof.subjects]);

    const handleAddSubject = () => {
        setSubjects([...subjects, { nome: '', questoes: '' }]);
    };

    const handleSubjectChange = (index, field, value) => {
        const updatedSubjects = [...subjects];
        updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
        setSubjects(updatedSubjects);
    };

    const handleRemoveSubject = (index) => {
        if (subjects.length > 1) {
            const updatedSubjects = subjects.filter((_, i) => i !== index);
            setSubjects(updatedSubjects);
        }
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        const subjectsToSave = subjects
            .filter(s => s.nome && s.questoes)
            .map(s => ({ nome: s.nome, questoes: parseInt(s.questoes) || 0 }));
        const newTotalQuestoes = subjectsToSave.reduce((sum, s) => sum + s.questoes, 0);

        try {
            await api.updateProofDetails(proof.id, { 
                subjects: subjectsToSave,
                totalQuestoes: newTotalQuestoes 
            });
            toast.success('Informações salvas com sucesso!');
            refreshProof();
        } catch (error) {
            toast.error('Falha ao salvar as informações.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Matérias do Concurso</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Defina as matérias e a quantidade de questões de cada uma.</p>
            <div className="space-y-3">
                {subjects.map((subject, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <input type="text" placeholder="Nome da Matéria" value={subject.nome} onChange={e => handleSubjectChange(index, 'nome', e.target.value)} className="flex-grow p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded"/>
                        <input type="number" placeholder="Nº de Questões" value={subject.questoes} onChange={e => handleSubjectChange(index, 'questoes', e.target.value)} className="w-40 p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded"/>
                        <button onClick={() => handleRemoveSubject(index)} disabled={subjects.length <= 1} className="text-red-500 p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full disabled:opacity-30"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                ))}
            </div>
            <button onClick={handleAddSubject} className="mt-4 text-teal-600 dark:text-teal-400 font-semibold">+ Adicionar Matéria</button>
            <div className="mt-6 border-t dark:border-gray-700 pt-4 flex justify-end">
                <button onClick={handleSaveChanges} disabled={isSaving} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50">
                    {isSaving ? 'Salvando...' : 'Salvar Matérias'}
                </button>
            </div>
        </div>
    );
};

export default InfoTab;