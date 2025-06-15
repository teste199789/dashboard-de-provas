const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { corrigirProva, calculateOverallPerformance } = require('./utils/correcao');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const PORT = 3001;

// --- ROTAS DE PROVAS (GET, POST, DELETE) ---
// ... (Estas rotas estão corretas, o código completo está abaixo para garantir)

// --- ROTA PARA SALVAR DETALHES (INCLUINDO EDIÇÃO) ---
app.put('/api/proofs/:id/details', async (req, res) => {
    try {
        const { id } = req.params;
        // Pega todos os possíveis campos do corpo da requisição
        const { 
            gabaritoPreliminar, gabaritoDefinitivo, userAnswers, 
            subjects, totalQuestoes, titulo, banca, data, inscritos 
        } = req.body;

        console.log(`[Backend] Recebido PUT para ID ${id} com dados:`, req.body); // Log de depuração

        const dataToUpdate = {};

        // Adiciona ao objeto de atualização apenas os campos que foram enviados
        if (titulo !== undefined) dataToUpdate.titulo = titulo;
        if (banca !== undefined) dataToUpdate.banca = banca;
        if (data !== undefined) dataToUpdate.data = new Date(data);
        if (gabaritoPreliminar !== undefined) dataToUpdate.gabaritoPreliminar = gabaritoPreliminar;
        if (gabaritoDefinitivo !== undefined) dataToUpdate.gabaritoDefinitivo = gabaritoDefinitivo;
        if (userAnswers !== undefined) dataToUpdate.userAnswers = userAnswers;
        if (totalQuestoes !== undefined) dataToUpdate.totalQuestoes = parseInt(totalQuestoes);
        if (inscritos !== undefined) dataToUpdate.inscritos = parseInt(inscritos);
        
        if (subjects) {
            let currentQuestion = 1;
            const subjectsWithRanges = subjects.map(s => {
                const start = currentQuestion;
                const end = currentQuestion + (parseInt(s.questoes) || 0) - 1;
                currentQuestion = end + 1;
                return {
                    nome: s.nome,
                    questoes: parseInt(s.questoes) || 0,
                    questaoInicio: start,
                    questaoFim: end
                };
            });
            await prisma.subject.deleteMany({ where: { proofId: parseInt(id) } });
            dataToUpdate.subjects = { create: subjectsWithRanges };
        }

        const updatedProof = await prisma.proof.update({
            where: { id: parseInt(id) },
            data: dataToUpdate // Salva apenas os campos que foram modificados
        });

        res.json(updatedProof);
    } catch (error) {
        console.error("ERRO AO SALVAR DETALHES:", error);
        res.status(500).json({ error: "Não foi possível salvar os detalhes da prova." });
    }
});


// O resto do arquivo server.js completo para garantir...
app.post('/api/proofs', async (req, res) => {
    try {
        const { titulo, banca, data, totalQuestoes, tipoPontuacao } = req.body;
        const newProof = await prisma.proof.create({
            data: { 
                titulo, banca, data: new Date(data),
                totalQuestoes: parseInt(totalQuestoes),
                tipoPontuacao
            },
        });
        res.status(201).json(newProof);
    } catch (error) {
        res.status(500).json({ error: "Não foi possível criar a prova." });
    }
});
app.get('/api/proofs', async (req, res) => {
    try {
        const proofs = await prisma.proof.findMany({
            include: { results: true, subjects: true },
            orderBy: { data: 'desc' },
        });
        res.json(proofs);
    } catch (error) {
        res.status(500).json({ error: "Não foi possível buscar as provas." });
    }
});
app.get('/api/proofs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const proof = await prisma.proof.findUnique({
            where: { id: parseInt(id) },
            include: { results: { orderBy: { id: 'asc' } }, subjects: { orderBy: { id: 'asc' } } },
        });
        if (!proof) { return res.status(404).json({ error: "Prova não encontrada." }); }
        res.json(proof);
    } catch (error) {
        res.status(500).json({ error: "Não foi possível buscar a prova." });
    }
});
app.delete('/api/proofs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.proof.delete({ where: { id: parseInt(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Não foi possível deletar a prova." });
    }
});
app.post('/api/proofs/:id/grade', async (req, res) => {
    try {
        const { id } = req.params;
        const proofId = parseInt(id);
        const proofData = await prisma.proof.findUnique({
            where: { id: proofId },
            include: { subjects: true },
        });
        if (!proofData || !proofData.userAnswers || !proofData.gabaritoDefinitivo) {
            return res.status(400).json({ error: "Gabarito do usuário, da banca ou dados da prova não preenchidos." });
        }
        if (!proofData.subjects || proofData.subjects.length === 0) {
            return res.status(400).json({ error: "As matérias do concurso não foram definidas." });
        }
        const { resultados: resultadosPorMateria } = corrigirProva(proofData);
        const performanceGeral = calculateOverallPerformance(proofData, resultadosPorMateria);
        await prisma.proof.update({
            where: { id: proofId },
            data: { aproveitamento: performanceGeral.percentage }
        });
        const dataToCreate = resultadosPorMateria.map(r => ({ ...r, proofId }));
        await prisma.$transaction([
            prisma.result.deleteMany({ where: { proofId: proofId } }),
            prisma.result.createMany({ data: dataToCreate }),
        ]);
        res.status(200).json({ message: "Prova corrigida com sucesso!" });
    } catch(error) {
        res.status(500).json({ error: "Falha no processo de correção." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});