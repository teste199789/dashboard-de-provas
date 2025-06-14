import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useProofs } from '../hooks/useProofs';
import { formatDate } from '../utils/formatters';

const MyContests = () => {
    const { proofsList } = useProofs();
    const [filterBanca, setFilterBanca] = useState('todas');
    const [filterAno, setFilterAno] = useState('');
    
    const uniqueBancas = useMemo(() => ['todas', ...new Set(proofsList.map(p => p.banca).filter(Boolean))], [proofsList]);

    const chartData = useMemo(() => {
        // Filtra apenas provas que já foram corrigidas (possuem um aproveitamento)
        let filteredProofs = proofsList.filter(p => typeof p.aproveitamento === 'number');

        if (filterBanca !== 'todas') {
            filteredProofs = filteredProofs.filter(p => p.banca.toLowerCase() === filterBanca.toLowerCase());
        }
        if (filterAno.trim() !== '') {
            filteredProofs = filteredProofs.filter(p => new Date(p.data).getUTCFullYear().toString() === filterAno.trim());
        }

        return filteredProofs
            .map(proof => {
                const shortTitle = proof.titulo.split(' ')[0];
                const formattedDate = formatDate(proof.data);

                return { 
                    id: proof.id,
                    name: `${shortTitle} (${formattedDate})`,
                    // Usa diretamente o aproveitamento calculado e salvo no banco de dados
                    aproveitamento: parseFloat((proof.aproveitamento * 100).toFixed(2)),
                    full_name: proof.titulo,
                    date: new Date(proof.data),
                };
            })
            .sort((a,b) => a.date - b.date); // Ordena pela data da prova para uma linha do tempo correta
    }, [proofsList, filterBanca, filterAno]);
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">{chartData.length} Concurso(s) Analisado(s)</h2>
                <p className="text-lg text-gray-500">Evolução do seu desempenho</p>
            </div>
            
             <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                {/* Filtros */}
             </div>

            {chartData.length === 0 ? (
                <p className="text-gray-500 text-center py-10">Nenhum concurso corrigido encontrado com os filtros aplicados.</p>
            ) : (
                <div style={{ width: '100%', height: 400 }}>
                     <ResponsiveContainer>
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.7}/>
                                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize: 12}} />
                            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`}/>
                            <Tooltip
                                contentStyle={{backgroundColor: '#ffffff', border: '1px solid #cccccc', borderRadius: '0.5rem'}}
                                labelStyle={{fontWeight: 'bold'}}
                                formatter={(value, name, props) => [`${value.toFixed(2)}%`, `Aproveitamento em ${props.payload.full_name}`]}
                            />
                            <Area type="monotone" dataKey="aproveitamento" stroke="#0d9488" fillOpacity={1} fill="url(#colorUv)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default MyContests;