import React, { useState } from 'react';
import { Member } from '../types';
import { Phone, MapPin, Briefcase, Stethoscope, Hammer, Gavel, User, HeartHandshake, Calendar, CheckCircle, Clock } from 'lucide-react';

interface ServiceFinderProps {
  members: Member[];
}

type TabType = 'services' | 'assistance';

const ServiceFinder: React.FC<ServiceFinderProps> = ({ members }) => {
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [selectedProfession, setSelectedProfession] = useState<string>('');

  // --- Logic for Services ---
  const professionStats = members.reduce((acc, member) => {
    if (member.profession) {
      acc[member.profession] = (acc[member.profession] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedProfessions = Object.entries(professionStats).sort((a, b) => (b[1] as number) - (a[1] as number));

  const filteredServiceMembers = selectedProfession
    ? members.filter(m => m.profession === selectedProfession)
    : [];

  const getIconForProfession = (prof: string) => {
    const p = prof.toLowerCase();
    if (p.includes('médico') || p.includes('saúde') || p.includes('enfermeiro')) return <Stethoscope className="w-5 h-5" />;
    if (p.includes('advogado') || p.includes('jurídico')) return <Gavel className="w-5 h-5" />;
    if (p.includes('pedreiro') || p.includes('engenheiro') || p.includes('obra')) return <Hammer className="w-5 h-5" />;
    return <Briefcase className="w-5 h-5" />;
  };

  // --- Logic for Assistance ---
  const assistedMembers = members.filter(m => m.assistanceHistory && m.assistanceHistory.length > 0);
  
  // Sort: Members with active assistance first
  assistedMembers.sort((a, b) => {
      const aActive = a.assistanceHistory.some(h => !h.endDate);
      const bActive = b.assistanceHistory.some(h => !h.endDate);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return 0;
  });

  const totalAssistanceCount = assistedMembers.reduce((acc, m) => acc + m.assistanceHistory.length, 0);
  const activeAssistanceCount = assistedMembers.reduce((acc, m) => acc + m.assistanceHistory.filter(h => !h.endDate).length, 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-slate-800 rounded-lg p-6 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Ecossistema Legendários</h2>
        <p className="text-slate-300">Uma irmandade forte se constrói com trabalho e ajuda mútua.</p>
        
        <div className="flex gap-4 mt-6">
            <button 
                onClick={() => setActiveTab('services')}
                className={`flex items-center px-4 py-2 rounded-lg font-bold transition-all ${
                    activeTab === 'services' 
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400' 
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
            >
                <Briefcase className="mr-2 w-5 h-5"/> Rede de Profissionais
            </button>
            <button 
                onClick={() => setActiveTab('assistance')}
                className={`flex items-center px-4 py-2 rounded-lg font-bold transition-all ${
                    activeTab === 'assistance' 
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400' 
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
            >
                <HeartHandshake className="mr-2 w-5 h-5"/> Rede de Apoio
            </button>
        </div>
      </div>

      {/* --- SERVICES TAB --- */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {/* Sidebar of Professions */}
            <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 uppercase text-sm tracking-wider">Profissões Disponíveis</h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {sortedProfessions.map(([prof, count]) => (
                    <button
                    key={prof}
                    onClick={() => setSelectedProfession(prof)}
                    className={`w-full flex justify-between items-center px-4 py-3 rounded-md transition-all ${
                        selectedProfession === prof 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                        : 'hover:bg-gray-50 text-gray-600 border border-transparent'
                    }`}
                    >
                    <span className="flex items-center gap-2">
                        {getIconForProfession(prof)}
                        <span className="font-medium text-sm">{prof}</span>
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-xs py-0.5 px-2 rounded-full">{count}</span>
                    </button>
                ))}
                {sortedProfessions.length === 0 && <p className="text-gray-500 text-sm">Nenhuma profissão cadastrada.</p>}
                </div>
            </div>
            </div>

            {/* Results Area */}
            <div className="md:col-span-2">
            {!selectedProfession ? (
                <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <User className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Selecione uma profissão ao lado para buscar especialistas.</p>
                </div>
            ) : (
                <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    {getIconForProfession(selectedProfession)}
                    Profissionais: <span className="text-blue-600">{selectedProfession}</span>
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                    {filteredServiceMembers.map(member => (
                    <div key={member.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                        <div>
                            <h4 className="text-lg font-bold text-gray-900">{member.fullName}</h4>
                            <div className="flex flex-col gap-1 mb-2">
                                <p className="text-sm text-gray-600 font-medium">Legendário #{member.legendaryNumber}</p>
                                <p className="text-sm text-blue-600 flex items-center">
                                <Briefcase className="w-3 h-3 mr-1" />
                                {member.profession}
                                </p>
                            </div>
                            
                            <div className="space-y-1 mt-3">
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                {member.address}, {member.city}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                {member.phone}
                            </div>
                            </div>
                        </div>
                        <a 
                            href={`https://wa.me/55${member.phone.replace(/\D/g, '')}`} 
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 flex items-center shadow-sm"
                        >
                            WhatsApp
                        </a>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            )}
            </div>
        </div>
      )}

      {/* --- ASSISTANCE TAB --- */}
      {activeTab === 'assistance' && (
        <div className="space-y-6 animate-fadeIn">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100 flex items-center">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-full mr-3">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Membros Beneficiados</p>
                        <p className="text-2xl font-bold text-gray-800">{assistedMembers.length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100 flex items-center">
                     <div className="p-3 bg-green-100 text-green-600 rounded-full mr-3">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Ajudas em Andamento</p>
                        <p className="text-2xl font-bold text-gray-800">{activeAssistanceCount}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 flex items-center">
                     <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-3">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Total de Ações</p>
                        <p className="text-2xl font-bold text-gray-800">{totalAssistanceCount}</p>
                    </div>
                </div>
            </div>

            {/* List of Assisted Members */}
            <div className="grid grid-cols-1 gap-4">
                {assistedMembers.length === 0 ? (
                     <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <HeartHandshake className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                        <p className="text-gray-500">Nenhum registro de ajuda encontrado no sistema.</p>
                     </div>
                ) : (
                    assistedMembers.map(member => (
                        <div key={member.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 flex items-center">
                                        {member.fullName}
                                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">#{member.legendaryNumber}</span>
                                    </h3>
                                    <p className="text-sm text-gray-500 flex items-center mt-1">
                                        <MapPin size={12} className="mr-1"/> {member.city}, {member.state}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        member.status === 'active_paying' ? 'bg-green-100 text-green-800' :
                                        member.status === 'active_exempt' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {member.status === 'active_paying' ? 'Ativo' : 
                                         member.status === 'active_exempt' ? 'Dispensado' : 'Inativo'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Histórico de Ajudas</h4>
                                <div className="space-y-3">
                                    {member.assistanceHistory.map(record => {
                                        const isActive = !record.endDate;
                                        return (
                                            <div key={record.id} className={`flex items-start p-3 rounded-md border ${isActive ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
                                                <div className={`mt-0.5 mr-3 p-1.5 rounded-full ${isActive ? 'bg-amber-200 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>
                                                    {isActive ? <Clock size={16}/> : <CheckCircle size={16}/>}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`font-medium text-sm ${isActive ? 'text-amber-900' : 'text-gray-700'}`}>
                                                        {record.description}
                                                    </p>
                                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                                        <Calendar size={12} className="mr-1"/>
                                                        {new Date(record.startDate).toLocaleDateString('pt-BR')}
                                                        <span className="mx-1">até</span>
                                                        {isActive ? (
                                                            <span className="font-bold text-amber-600">EM ANDAMENTO</span>
                                                        ) : (
                                                            new Date(record.endDate!).toLocaleDateString('pt-BR')
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ServiceFinder;