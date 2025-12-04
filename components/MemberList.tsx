import React, { useState } from 'react';
import { Member } from '../types';
import { Edit, Trash2, FileSpreadsheet, FileText, File, Search, BrainCircuit, CheckCircle, XCircle, HeartHandshake, AlertCircle } from 'lucide-react';
import { exportToCSV, exportToWord } from '../services/exportService';
import { analyzeSocioEconomicProfile } from '../services/geminiService';

interface MemberListProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
}

const MemberList: React.FC<MemberListProps> = ({ members, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [professionFilter, setProfessionFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{id: string, text: string} | null>(null);

  const uniqueProfessions = Array.from(new Set(members.map(m => m.profession).filter(Boolean)));

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.legendaryNumber.includes(searchTerm) ||
                          member.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (member.neighborhood && member.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesProfession = professionFilter ? member.profession === professionFilter : true;
    
    const matchesMonth = monthFilter ? new Date(member.birthDate).getMonth() + 1 === parseInt(monthFilter) : true;

    return matchesSearch && matchesProfession && matchesMonth;
  });

  const handleAnalysis = async (member: Member) => {
    setAnalyzingId(member.id);
    setAnalysisResult(null);
    const result = await analyzeSocioEconomicProfile(member);
    setAnalysisResult({ id: member.id, text: result });
    setAnalyzingId(null);
  };

  const getStatusBadge = (member: Member) => {
    switch (member.status) {
        case 'active_paying':
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Ativo (Pagante)</span>;
        case 'active_exempt':
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Ativo (Dispensado)</span>;
        case 'inactive':
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Inativo</span>;
        default:
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Desconhecido</span>;
    }
  };

  const isBeingHelped = (member: Member) => {
      // Retorna verdadeiro se existir algum registro de ajuda sem data de fim (endDate vazio ou undefined)
      return member.assistanceHistory && member.assistanceHistory.some(r => !r.endDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nome, Nº, Bairro, Cidade..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="w-full md:w-48">
             <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
             <select 
               className="w-full border rounded-md p-2"
               value={professionFilter}
               onChange={(e) => setProfessionFilter(e.target.value)}
             >
               <option value="">Todas</option>
               {uniqueProfessions.map(p => <option key={p} value={p}>{p}</option>)}
             </select>
          </div>

          <div className="w-full md:w-48">
             <label className="block text-sm font-medium text-gray-700 mb-1">Mês Nasc.</label>
             <select 
               className="w-full border rounded-md p-2"
               value={monthFilter}
               onChange={(e) => setMonthFilter(e.target.value)}
             >
               <option value="">Todos</option>
               {Array.from({length: 12}, (_, i) => (
                 <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>
               ))}
             </select>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={() => exportToCSV(filteredMembers)} className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
          <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel (CSV)
        </button>
        <button onClick={() => exportToWord(filteredMembers)} className="flex items-center px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm">
          <FileText className="w-4 h-4 mr-2" /> Word
        </button>
        <button onClick={() => window.print()} className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
          <File className="w-4 h-4 mr-2" /> PDF (Imprimir)
        </button>
      </div>

      {analysisResult && (
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-4 rounded relative">
           <button onClick={() => setAnalysisResult(null)} className="absolute top-2 right-2 text-indigo-400 hover:text-indigo-600"><Trash2 size={16}/></button>
           <h3 className="text-lg font-bold text-indigo-900 flex items-center mb-2">
             <BrainCircuit className="w-5 h-5 mr-2"/> Análise IA
           </h3>
           <div className="prose prose-sm text-indigo-800 max-w-none">
             <pre className="whitespace-pre-wrap font-sans">{analysisResult.text}</pre>
           </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profissão</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMembers.map(member => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div>{member.legendaryNumber}</div>
                    {member.topNumber && <div className="text-xs text-blue-600 font-bold">TOP {member.topNumber}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    {member.fullName}
                    {isBeingHelped(member) && (
                        <span className="ml-2 text-amber-600" title="Recebendo Assistência Atualmente">
                            <HeartHandshake size={18} />
                        </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                      {member.neighborhood ? `${member.neighborhood}, ` : ''}{member.city} {member.state ? `- ${member.state}` : ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.profession}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{member.phone}</div>
                  {member.spousePhone && (
                    <div className="text-xs text-gray-400 mt-1">
                      Esposa: {member.spousePhone}
                    </div>
                  )}
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <div className="flex flex-col gap-1">
                        {getStatusBadge(member)}
                        {member.isCommunityActive ? 
                            <span className="flex items-center text-green-600 text-[10px]"><CheckCircle size={10} className="mr-1"/> Com. Ativo</span> : 
                            <span className="flex items-center text-gray-400 text-[10px]"><XCircle size={10} className="mr-1"/> Com. Inativo</span>
                        }
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                   <button 
                    onClick={() => handleAnalysis(member)} 
                    disabled={analyzingId === member.id}
                    className="text-indigo-600 hover:text-indigo-900 p-1"
                    title="Análise IA Socioeconômica"
                  >
                    {analyzingId === member.id ? <span className="animate-spin">⌛</span> : <BrainCircuit size={18} />}
                  </button>
                  <button onClick={() => onEdit(member)} className="text-blue-600 hover:text-blue-900 p-1">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => onDelete(member.id)} className="text-red-600 hover:text-red-900 p-1">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Nenhum legendário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberList;