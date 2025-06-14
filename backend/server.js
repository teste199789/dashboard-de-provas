const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3001;

// --- ROTAS DE PROVAS ---

// POST /api/proofs (AGORA MAIS SIMPLES)
// Apenas cria o "contêiner" do concurso.
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

// GET /api/proofs (sem alterações)
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

// GET /api/proofs/:id (agora inclui as matérias)
app.get('/api/proofs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const proof = await prisma.proof.findUnique({
            where: { id: parseInt(id) },
            include: { results: true, subjects: true }, // <-- Inclui as matérias
        });
        if (!proof) { return res.status(404).json({ error: "Prova não encontrada." }); }
        res.json(proof);
    } catch (error) {
        res.status(500).json({ error: "Não foi possível buscar a prova." });
    }
});

// DELETE /api/proofs/:id (sem alterações)
app.delete('/api/proofs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.proof.delete({ where: { id: parseInt(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Não foi possível deletar a prova." });
    }
});


// --- NOVAS ROTAS PARA SALVAR DETALHES ---

// PUT /api/proofs/:id/details
// Salva os gabaritos e as matérias de uma vez
app.put('/api/proofs/:id/details', async (req, res) => {
    try {
        const { id } = req.params;
        const { gabaritoPreliminar, gabaritoDefinitivo, userAnswers, subjects } = req.body;
        
        const dataToUpdate = {};
        if (gabaritoPreliminar !== undefined) dataToUpdate.gabaritoPreliminar = gabaritoPreliminar;
        if (gabaritoDefinitivo !== undefined) dataToUpdate.gabaritoDefinitivo = gabaritoDefinitivo;
        if (userAnswers !== undefined) dataToUpdate.userAnswers = userAnswers;
        
        if (subjects) {
            await prisma.subject.deleteMany({ where: { proofId: parseInt(id) } });
            dataToUpdate.subjects = { create: subjects };
        }

        const updatedProof = await prisma.proof.update({
            where: { id: parseInt(id) },
            data: dataToUpdate,
        });
        res.json(updatedProof);
    } catch (error) {
        console.error("ERRO AO SALVAR DETALHES:", error);
        res.status(500).json({ error: "Não foi possível salvar os detalhes da prova." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});