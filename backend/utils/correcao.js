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

    const resultadoPorMateria = {};
    subjects.forEach(m => {
        resultadoPorMateria[m.nome] = { disciplina: m.nome, acertos: 0, erros: 0, brancos: 0, anuladas: 0 };
    });
    
    const detailedLog = [];

    for (let i = 1; i <= totalQuestoes; i++) {
        const iStr = String(i);
        const respostaUser = userMap.get(iStr);
        const respostaDefin = definMap.get(iStr);
        const respostaPrelim = prelimMap.get(iStr);
        const materiaInfo = subjects.find(s => i >= s.questaoInicio && i <= s.questaoFim);
        
        let logEntry = `Q${iStr.padStart(3, '0')}: User: ${respostaUser || '-'}, Defin: ${respostaDefin || '-'}, Prelim: ${respostaPrelim || '-'}`;

        if (!materiaInfo) {
            detailedLog.push(logEntry + ' -> ERRO: Sem matéria definida!');
            continue;
        }
        
        const materiaDaQuestao = resultadoPorMateria[materiaInfo.nome];
        
        const isAnnulled = (prelimMap.size > 0 && respostaPrelim && respostaDefin && prelimMap.get(iStr) !== respostaDefin) || (respostaDefin === 'N');

        // --- LÓGICA DE ANULAÇÃO CORRIGIDA ---
        if (isAnnulled) {
            materiaDaQuestao.anuladas++;
            // ADICIONA O PONTO DO ACERTO PARA A QUESTÃO ANULADA
            materiaDaQuestao.acertos++; 
            logEntry += ' -> Anulada (+1 Ponto)';
            detailedLog.push(logEntry);
            continue; // Pula para a próxima questão
        }

        if (!respostaUser) {
            materiaDaQuestao.brancos++;
            logEntry += ' -> Branco';
        } else if (respostaUser === respostaDefin) {
            materiaDaQuestao.acertos++;
            logEntry += ' -> Acerto';
        } else {
            materiaDaQuestao.erros++;
            logEntry += ' -> Erro';
        }
        detailedLog.push(logEntry);
    }

    return {
        resultados: Object.values(resultadoPorMateria),
        log: detailedLog
    };
}

// A função de cálculo da performance geral não precisa de mudanças,
// pois ela já usa os totais de acertos, erros e anuladas que a função acima produz.
function calculateOverallPerformance(proof, calculatedResults) {
    if (!proof || !proof.totalQuestoes || !calculatedResults) {
        return { percentage: 0 };
    }

    const totals = calculatedResults.reduce((acc, r) => {
        acc.acertos += r.acertos;
        acc.erros += r.erros;
        acc.brancos += r.brancos;
        acc.anuladas += r.anuladas;
        return acc;
    }, { acertos: 0, erros: 0, brancos: 0, anuladas: 0 });

    const totalQuestoesParaCalculo = proof.totalQuestoes;
    let pontuacaoFinal;

    if (proof.tipoPontuacao === 'liquida') {
        // A pontuação continua (Acertos - Erros), mas agora 'Acertos' já inclui os pontos das anuladas.
        pontuacaoFinal = totals.acertos - totals.erros;
    } else {
        pontuacaoFinal = totals.acertos;
    }

    const percentage = totalQuestoesParaCalculo > 0 ? (pontuacaoFinal / totalQuestoesParaCalculo) : 0;
    return { percentage: Math.max(0, percentage) };
}

module.exports = { corrigirProva, calculateOverallPerformance };