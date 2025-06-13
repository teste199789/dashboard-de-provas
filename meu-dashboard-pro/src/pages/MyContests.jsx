import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useProofs } from '../hooks/useProofs';
import { formatDate } from '../utils/formatters'; // Importa a função

const MyContests = () => {
    const { proofsList } = useProofs();
    const [filterBanca, setFilterBanca] = useState('todas');
    const [filterAno, setFilterAno] = useState('');
    
    const uniqueBancas = useMemo(() => ['todas', ...new Set(proofsList.map(p => p.banca).filter(Boolean))], [proofsList]);

    const chartData = useMemo(() => {
        let filteredProofs = proofsList;

        if (filterBanca !== 'todas') {
            filteredProofs = filteredProofs.filter(p => p.banca.toLowerCase() === filterBanca.toLowerCase());
        }
        if (filterAno.trim() !== '') {
            filteredProofs = filteredProofs.filter(p => new Date(p.data).getUTCFullYear().toString() === filterAno.trim());
        }

        return filteredProofs
            .map(proof => {
                const totals = proof.results.reduce((acc, r) => {
                    acc.acertos += r.acertos;
                    acc.erros += r.erros;
                    acc.brancos += r.brancos;
                    return acc;
                }, { acertos: 0, erros: 0, brancos: 0 });
                const totalQuestoes = totals.acertos + totals.erros + totals.brancos;
                const acertosLiquidos = totals.acertos - totals.erros;
                const percentage = totalQuestoes > 0 ? (acertosLiquidos / totalQuestoes) * 100 : 0;
                
                const shortTitle = proof.titulo.split(' ')[0];
                const formattedDate = formatDate(proof.data);

                return { 
                    id: proof.id,
                    name: `${shortTitle} (${formattedDate})`,
                    aproveitamento: parseFloat(percentage.toFixed(2)),
                    full_name: proof.titulo,
                    date: new Date(proof.data),
                };
            })
            .sort((a,b) => a.date - b.date); // Ordena pela data da prova
    }, [proofsList, filterBanca, filterAno]);
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">{chartData.length} Concurso(s)</h2>
                <p className="text-lg text-gray-500">Evolução do seu desempenho</p>
            </div>
            
             <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="chart-banca-filter" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Banca</label>
                        <select id="chart-banca-filter" value={filterBanca} onChange={e => setFilterBanca(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white shadow-sm">
                             {uniqueBancas.map(banca => <option key={banca} value={banca}>{banca.charAt(0).toUpperCase() + banca.slice(1)}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="chart-ano-filter" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Ano</label>
                        <input type="number" id="chart-ano-filter" value={filterAno} onChange={e => setFilterAno(e.target.value)} placeholder="Ex: 2023" className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                </div>
            </div>

            {chartData.length === 0 ? (
                <p className="text-gray-500 text-center py-10">Nenhum concurso encontrado com os filtros aplicados.</p>
            ) : (
                <div style={{ width: '100%', height: 400 }}>
                     <ResponsiveContainer>
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
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
                                formatter={(value, name, props) => [`${value.toFixed(2)}%`, `Aproveitamento Líquido em ${props.payload.full_name}`]}
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