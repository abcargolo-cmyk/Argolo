import React, { useState, useEffect } from 'react';
import { Member, Child, AssistanceRecord, MemberStatus } from '../types';
import { Save, X, Plus, Trash2, Home, Users, HeartHandshake, AlertCircle } from 'lucide-react';

interface MemberFormProps {
  initialData?: Member;
  onSave: (member: Member) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ initialData, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState<Member>({
    id: crypto.randomUUID(),
    legendaryNumber: '',
    conquestDate: '',
    topNumber: '',
    trackName: '',
    fullName: '',
    birthDate: '',
    profession: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    spouseName: '',
    spousePhone: '',
    children: [],
    churchName: '',
    pastorName: '',
    pastorPhone: '',
    isCommunityActive: true,
    status: 'active_paying',
    inactiveReason: '',
    assistanceHistory: [],
    socioEconomicNotes: '',
    joinedDate: new Date().toISOString().split('T')[0],
  });

  // Temporary state for adding a new child
  const [newChild, setNewChild] = useState<Child>({ name: '', age: '' });

  // Temporary state for adding assistance
  const [newAssistance, setNewAssistance] = useState<{description: string, startDate: string, endDate: string}>({
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (initialData) {
      setFormData({
        ...initialData,
        conquestDate: initialData.conquestDate || '',
        topNumber: initialData.topNumber || '',
        trackName: initialData.trackName || '',
        neighborhood: initialData.neighborhood || '',
        state: initialData.state || '',
        email: initialData.email || '',
        children: initialData.children || [],
        assistanceHistory: initialData.assistanceHistory || [],
        isCommunityActive: initialData.isCommunityActive ?? true,
        spousePhone: initialData.spousePhone || '',
        churchName: initialData.churchName || '',
        pastorName: initialData.pastorName || '',
        pastorPhone: initialData.pastorPhone || '',
        status: initialData.status || 'active_paying',
        inactiveReason: initialData.inactiveReason || ''
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddChild = () => {
    if (newChild.name.trim()) {
      setFormData(prev => ({
        ...prev,
        children: [...prev.children, newChild]
      }));
      setNewChild({ name: '', age: '' });
    }
  };

  const handleRemoveChild = (index: number) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const handleAddAssistance = () => {
    if (newAssistance.description.trim() && newAssistance.startDate) {
      const record: AssistanceRecord = {
        id: crypto.randomUUID(),
        description: newAssistance.description,
        startDate: newAssistance.startDate,
        endDate: newAssistance.endDate || undefined
      };
      
      setFormData(prev => ({
        ...prev,
        assistanceHistory: [...prev.assistanceHistory, record]
      }));

      setNewAssistance({
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
    }
  };

  const handleRemoveAssistance = (id: string) => {
    setFormData(prev => ({
      ...prev,
      assistanceHistory: prev.assistanceHistory.filter(r => r.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          {initialData ? 'Editar Legendário' : 'Novo Legendário'}
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-red-500">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Dados Pessoais e Conquista */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Users className="mr-2 w-5 h-5"/> Dados Pessoais & Conquista
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Nº Legendário</label>
                  <input
                  type="text"
                  name="legendaryNumber"
                  required
                  value={formData.legendaryNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
              </div>
              <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Data da Conquista</label>
                  <input
                  type="date"
                  name="conquestDate"
                  value={formData.conquestDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
              </div>
              <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Número do TOP</label>
                  <input
                  type="text"
                  name="topNumber"
                  value={formData.topNumber}
                  onChange={handleChange}
                  placeholder="Ex: 50"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
              </div>
              <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Nome da Pista</label>
                  <input
                  type="text"
                  name="trackName"
                  value={formData.trackName}
                  onChange={handleChange}
                  placeholder="Ex: Pico Agudo"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
              </div>

              <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                  <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
              </div>
              <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                  <input
                  type="date"
                  name="birthDate"
                  required
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
              </div>
               <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
                  <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
              </div>

              <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Profissão</label>
                  <input
                  type="text"
                  name="profession"
                  required
                  value={formData.profession}
                  onChange={handleChange}
                  placeholder="Ex: Médico, Advogado, Pedreiro"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
              </div>
              <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="opcional@email.com"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
              </div>

              <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-4 mt-2">
                 <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Endereço Completo</label>
                    <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                 </div>
                 <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Bairro</label>
                    <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                 </div>
                 <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Cidade</label>
                    <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                 </div>
                 <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Estado (UF)</label>
                    <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    maxLength={2}
                    placeholder="SP"
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 uppercase"
                    />
                 </div>
              </div>
            </div>
        </div>

        {/* Dados Familiares */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
             <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Users className="mr-2 w-5 h-5"/> Dados Familiares
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome da Esposa</label>
                    <input
                    type="text"
                    name="spouseName"
                    value={formData.spouseName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone da Esposa</label>
                    <input
                    type="text"
                    name="spousePhone"
                    value={formData.spousePhone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filhos ({formData.children.length})</label>
                
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        placeholder="Nome do Filho(a)"
                        value={newChild.name}
                        onChange={(e) => setNewChild({...newChild, name: e.target.value})}
                        className="flex-1 rounded-md border border-gray-300 p-2 text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Idade"
                        value={newChild.age}
                        onChange={(e) => setNewChild({...newChild, age: e.target.value})}
                        className="w-24 rounded-md border border-gray-300 p-2 text-sm"
                    />
                    <button 
                        type="button" 
                        onClick={handleAddChild}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="space-y-2 mt-2">
                    {formData.children.map((child, index) => (
                        <div key={index} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                            <span className="text-sm text-gray-700">
                                <strong>{child.name}</strong> - {child.age} {isNaN(Number(child.age)) ? '' : 'anos'}
                            </span>
                            <button 
                                type="button" 
                                onClick={() => handleRemoveChild(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {formData.children.length === 0 && (
                        <p className="text-sm text-gray-400 italic">Nenhum filho cadastrado.</p>
                    )}
                </div>
            </div>
        </div>

        {/* Dados Eclesiásticos e Status */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
             <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Home className="mr-2 w-5 h-5"/> Dados Eclesiásticos & Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Igreja que Participa</label>
                    <input
                    type="text"
                    name="churchName"
                    value={formData.churchName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Nome do Pastor/Líder</label>
                    <input
                    type="text"
                    name="pastorName"
                    value={formData.pastorName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone do Pastor/Líder</label>
                    <input
                    type="text"
                    name="pastorPhone"
                    value={formData.pastorPhone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                
                <div className="md:col-span-2 mt-2 p-3 bg-white rounded border border-gray-200 flex flex-col gap-3">
                     <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isCommunityActive"
                            name="isCommunityActive"
                            checked={formData.isCommunityActive}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isCommunityActive" className="ml-2 block text-sm text-gray-900 font-bold">
                            Membro Ativo na Comunidade Legendário?
                        </label>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status do Sistema</label>
                            <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm font-medium"
                            >
                            <option value="active_paying">Ativo (Pagante)</option>
                            <option value="active_exempt">Ativo (Dispensado)</option>
                            <option value="inactive">Inativo</option>
                            </select>
                        </div>
                        {formData.status === 'inactive' && (
                            <div>
                                <label className="block text-sm font-medium text-red-600 mb-1">Motivo da Inatividade</label>
                                <input
                                type="text"
                                name="inactiveReason"
                                required
                                value={formData.inactiveReason}
                                onChange={handleChange}
                                placeholder="Por que está inativo?"
                                className="block w-full rounded-md border border-red-300 p-2 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Histórico de Assistência */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
             <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                <HeartHandshake className="mr-2 w-5 h-5"/> Histórico de Assistência & Apoio
            </h3>
            
            <div className="mb-4 bg-white p-3 rounded border border-yellow-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Registrar Nova Ajuda</label>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                    <div className="md:col-span-6">
                        <label className="block text-xs text-gray-600">Descrição da Ajuda</label>
                        <input
                            type="text"
                            placeholder="Ex: Cesta básica, Medicamentos, Apoio Jurídico"
                            value={newAssistance.description}
                            onChange={(e) => setNewAssistance({...newAssistance, description: e.target.value})}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs text-gray-600">Data Início</label>
                        <input
                            type="date"
                            value={newAssistance.startDate}
                            onChange={(e) => setNewAssistance({...newAssistance, startDate: e.target.value})}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs text-gray-600">Data Fim (Opcional)</label>
                        <input
                            type="date"
                            value={newAssistance.endDate}
                            onChange={(e) => setNewAssistance({...newAssistance, endDate: e.target.value})}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <button 
                            type="button" 
                            onClick={handleAddAssistance}
                            className="w-full bg-yellow-600 text-white p-2 rounded hover:bg-yellow-700 text-sm flex items-center justify-center"
                        >
                            <Plus size={16} className="mr-1"/> Adicionar
                        </button>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">* Se deixar a Data Fim em branco, a ajuda será considerada "Em andamento".</p>
            </div>

            <div className="space-y-2">
                {formData.assistanceHistory.length > 0 ? (
                    formData.assistanceHistory.map(record => {
                        const isOngoing = !record.endDate;
                        return (
                            <div key={record.id} className={`flex justify-between items-center p-3 rounded border ${isOngoing ? 'bg-white border-green-200 border-l-4 border-l-green-500' : 'bg-gray-50 border-gray-200'}`}>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">{record.description}</p>
                                    <p className="text-xs text-gray-500">
                                        De: {new Date(record.startDate).toLocaleDateString('pt-BR')} 
                                        {record.endDate ? ` até ${new Date(record.endDate).toLocaleDateString('pt-BR')}` : <span className="text-green-600 font-bold ml-1"> - Atualmente (Sendo Ajudado)</span>}
                                    </p>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveAssistance(record.id)}
                                    className="text-red-400 hover:text-red-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-yellow-700 italic flex items-center bg-yellow-100/50 p-2 rounded">
                        <AlertCircle size={16} className="mr-2"/> Nenhuma assistência registrada para este membro.
                    </p>
                )}
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notas Socioeconômicas</label>
          <textarea
            name="socioEconomicNotes"
            rows={4}
            value={formData.socioEconomicNotes}
            onChange={handleChange}
            placeholder="Detalhes adicionais sobre a situação familiar, necessidades, etc."
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
           <div>
               {initialData && onDelete && (
                 <button
                   type="button"
                   onClick={() => onDelete(initialData.id)}
                   className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 text-sm font-medium transition-colors"
                 >
                   <Trash2 className="mr-2 h-4 w-4" />
                   Excluir Membro
                 </button>
               )}
           </div>

           <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;