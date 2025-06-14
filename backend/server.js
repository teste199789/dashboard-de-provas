const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { corrigirProva } = require('./utils/correcao');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3001;

// --- ROTAS DE PROVAS ---
app.post('/api/proofs', async (req, res) => {
    try {
        const { titulo, banca, data, totalQuestoes, tipoPontuacao } = req.body;
        const newProof = await prisma.proof.create({
            data: { 
                titulo, 
                banca, 
                data: new Date(data),
                totalQuestoes: parseInt(totalQuestoes),
                tipoPontuacao
            },
        });
        res.status(201).json(newProof);
    } catch (error) {
        console.error("ERRO AO CRIAR PROVA:", error);
        res.status(500).json({ error: "Não foi possível criar a prova." });
    }
});

app.get('/api/proofs', async (req, res) => {
    try {
        const proofs = await prisma.proof.findMany({
            include: { results: true },
            orderBy: { data: 'desc' },
        });
        res.json(proofs);
    } catch (error) {
        res.status(500).json({ error: "Não foi possível buscar as provas." });
    }
});

// GET /api/proofs/:id
app.get('/api/proofs/:id', async (req, res) => {
    const { id } = req.params; // Movemos a declaração do 'id' para fora do 'try'
    console.log(`[Backend] Rota GET /api/proofs/:id chamada. Buscando ID: ${id}`);
    try {
        const proof = await prisma.proof.findUnique({
            where: { id: parseInt(id) },
            include: { results: true, subjects: { orderBy: { id: 'asc' } } },
        });
        if (!proof) { 
            console.warn(`[Backend] Prova com ID ${id} não encontrada no banco de dados.`);
            return res.status(404).json({ error: "Prova não encontrada." }); 
        }
        console.log(`[Backend] Prova com ID ${id} encontrada e retornada.`);
        res.json(proof);
    } catch (error) {
        // AGORA A VARIÁVEL 'id' ESTÁ ACESSÍVEL AQUI
        console.error(`[Backend] Erro ao buscar prova com ID ${id}:`, error);
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

// --- ROTAS PARA SALVAR DETALHES ---
app.put('/api/proofs/:id/details', async (req, res) => {
    try {
        const { id } = req.params;
        const { gabaritoPreliminar, gabaritoDefinitivo, userAnswers, subjects } = req.body;
        const dataToUpdate = {};
        if (gabaritoPreliminar !== undefined) dataToUpdate.gabaritoPreliminar = gabaritoPreliminar;
        if (gabaritoDefinitivo !== undefined) dataToUpdate.gabaritoDefinitivo = gabaritoDefinitivo;
        if (userAnswers !== undefined) dataToUpdate.userAnswers = userAnswers;
        
        if (subjects) {
            let currentQuestion = 1;
            const subjectsWithRanges = subjects.map(s => {
                const start = currentQuestion;
                const end = currentQuestion + parseInt(s.questoes) - 1;
                currentQuestion = end + 1;
                return {
                    nome: s.nome,
                    questoes: parseInt(s.questoes),
                    questaoInicio: start,
                    questaoFim: end
                };
            });

            await prisma.subject.deleteMany({ where: { proofId: parseInt(id) } });
            dataToUpdate.subjects = { create: subjectsWithRanges };
        }

        const updatedProof = await prisma.proof.update({ where: { id: parseInt(id) }, data: dataToUpdate });
        res.json(updatedProof);
    } catch (error) {
        console.error("ERRO AO SALVAR DETALHES:", error);
        res.status(500).json({ error: "Não foi possível salvar os detalhes da prova." });
    }
});


// --- ROTA DE CORREÇÃO ---
app.post('/api/proofs/:id/grade', async (req, res) => {
    try {
        const { id } = req.params;
        const proofId = parseInt(id);
        const proofData = await prisma.proof.findUnique({
            where: { id: proofId },
            include: { subjects: true },
        });

        if (!proofData.userAnswers || !proofData.gabaritoDefinitivo) {
            return res.status(400).json({ error: "Gabarito do usuário ou da banca não preenchido." });
        }
        
        const resultadosPorMateria = corrigirProva(proofData);

        await prisma.$transaction([
            prisma.result.deleteMany({ where: { proofId: proofId } }),
            prisma.result.createMany({ data: resultadosPorMateria.map(r => ({ ...r, proofId })) }),
        ]);

        res.status(200).json({ message: "Prova corrigida com sucesso!" });

    } catch(error) {
        console.error("ERRO AO CORRIGIR PROVA:", error);
        res.status(500).json({ error: "Falha no processo de correção." });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});