function parseGabarito(gabaritoString) {
    if (!gabaritoString || gabaritoString.trim() === '') return new Map();
    return new Map(gabaritoString.split(',').map(pair => {
        const [q, a] = pair.split(':');
        return [q, a];
    }));
}

function corrigirProva(proof) {
    const { totalQuestoes, userAnswers, gabaritoDefinitivo, gabaritoPreliminar, subjects } = proof;

    const userMap = parseGabarito(userAnswers);
    const definMap = parseGabarito(gabaritoDefinitivo);
    const prelimMap = parseGabarito(gabaritoPreliminar);

    // Inicializa o objeto de resultados usando o nome da matéria como chave para acesso fácil
    const resultadoPorMateria = {};
    subjects.forEach(m => {
        resultadoPorMateria[m.nome] = { disciplina: m.nome, acertos: 0, erros: 0, brancos: 0, anuladas: 0 };
    });

    for (let i = 1; i <= totalQuestoes; i++) {
        const iStr = String(i);
        const respostaUser = userMap.get(iStr);
        const respostaDefin = definMap.get(iStr);
        const respostaPrelim = prelimMap.get(iStr);

        // Encontra a qual matéria a questão pertence
        const materiaInfo = subjects.find(s => i >= s.questaoInicio && i <= s.questaoFim);
        
        // Se a questão não pertence a nenhuma matéria cadastrada, pula para a próxima
        if (!materiaInfo) continue;
        
        const materiaDaQuestao = resultadoPorMateria[materiaInfo.nome];

        // 1. Verifica se foi anulada
        if (prelimMap.size > 0 && respostaPrelim && respostaDefin && respostaPrelim !== respostaDefin) {
            materiaDaQuestao.anuladas++;
            continue;
        }

        // 2. Verifica se ficou em branco
        if (!respostaUser) {
            materiaDaQuestao.brancos++;
            continue;
        }

        // 3. Verifica se acertou
        if (respostaUser === respostaDefin) {
            materiaDaQuestao.acertos++;
        } else {
        // 4. Se não, errou
            materiaDaQuestao.erros++;
        }
    }

    // Retorna um array de objetos, como o Prisma espera
    return Object.values(resultadoPorMateria);
}

module.exports = { corrigirProva };