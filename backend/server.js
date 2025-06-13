const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors()); // Permite que o frontend acesse o backend
app.use(express.json()); // Permite que o servidor entenda JSON

const PORT = 3001;

// ROTA 1: Buscar todas as provas
app.get('/api/proofs', async (req, res) => {
    try {
        const proofs = await prisma.proof.findMany({
            include: { results: true }, // Inclui os resultados de cada prova na resposta
            orderBy: { createdAt: 'desc' }, // Ordena pelas mais recentes
        });
        res.json(proofs);
    } catch (error) {
        res.status(500).json({ error: "Não foi possível buscar as provas." });
    }
});

// ROTA 2: Adicionar uma nova prova
app.post('/api/proofs', async (req, res) => {
    try {
        const { titulo, banca, ano, results } = req.body;
        const newProof = await prisma.proof.create({
            data: {
                titulo,
                banca,
                ano,
                results: {
                    create: results, // O Prisma cria os resultados relacionados automaticamente
                },
            },
            include: {
                results: true,
            },
        });
        res.status(201).json(newProof);
    } catch (error) {
        res.status(500).json({ error: "Não foi possível adicionar a prova." });
    }
});

// ROTA 3: Deletar uma prova
app.delete('/api/proofs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.proof.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send(); // Resposta de sucesso sem conteúdo
    } catch (error) {
        res.status(500).json({ error: "Não foi possível deletar a prova." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});