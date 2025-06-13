const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3001;

// ROTA 1: Buscar todas as provas
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

// ROTA para buscar UMA prova pelo seu ID
app.get('/api/proofs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const proof = await prisma.proof.findUnique({
            where: { id: parseInt(id) },
            include: { results: true },
        });
        if (!proof) {
            return res.status(404).json({ error: "Prova não encontrada." });
        }
        res.json(proof);
    } catch (error) {
        res.status(500).json({ error: "Não foi possível buscar a prova." });
    }
});

// ROTA 2: Adicionar uma nova prova (VERSÃO FINAL E ROBUSTA)
app.post('/api/proofs', async (req, res) => {
    // Passo 1: Imprimir os dados recebidos para diagnóstico
    console.log("Dados recebidos no backend:", JSON.stringify(req.body, null, 2));

    try {
        const { titulo, banca, data, results } = req.body;

        // Passo 2: Validação básica dos dados e extração do ano
        if (!titulo || !banca || !data || !Array.isArray(results)) {
            return res.status(400).json({ error: "Dados inválidos ou faltando. Verifique o título, banca, data e resultados." });
        }

        // const ano = new Date(data).getFullYear(); // Removido ou comentado, pois 'ano' não é esperado pelo schema
        // if (isNaN(ano)) { 
        //     return res.status(400).json({ error: "Formato de data inválido, não foi possível extrair o ano." });
        // }

        // Passo 3: Criação da prova no banco de dados
        const newProof = await prisma.proof.create({
            data: {
                titulo: titulo,
                banca: banca,
                data: new Date(data), // Prisma converte a string de data (ex: "2025-06-13") para o formato DateTime
                results: {
                    create: results, // O array de resultados já vem formatado do frontend
                },
            },
            include: {
                results: true,
            },
        });

        // Passo 4: Enviar resposta de sucesso
        console.log("Prova salva com sucesso:", newProof.id);
        res.status(201).json(newProof);

    } catch (error) {
        // Passo 5: Capturar e registrar o erro detalhado do Prisma
        console.error("### ERRO DETALHADO DO PRISMA AO SALVAR PROVA ###");
        console.error(error);
        console.error("################################################");
        res.status(500).json({ 
            error: "O servidor encontrou um erro ao tentar salvar no banco de dados.",
            details: "Verifique o console do servidor backend para detalhes técnicos."
        });
    }
});

// ROTA 3: Deletar uma prova
app.delete('/api/proofs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.proof.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Não foi possível deletar a prova." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});