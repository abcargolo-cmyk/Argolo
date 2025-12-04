import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MemberList from './components/MemberList';
import MemberForm from './components/MemberForm';
import PaymentManager from './components/PaymentManager';
import ServiceFinder from './components/ServiceFinder';
import QuickPaymentModal from './components/QuickPaymentModal';
import QuickExpenseModal from './components/QuickExpenseModal';
import { Member, Payment, Transaction, MONTHS } from './types';
import { getMembers, saveMember, deleteMember, getPayments, getFullDatabase, restoreDatabase, getTransactions } from './services/storageService';
import { Plus, Users, Wallet, Activity, Phone, DollarSign, Database, Download, Upload, CheckCircle, X, ArrowUpCircle, ArrowDownCircle, Scale, HeartHandshake, ArrowRightLeft, ShieldCheck, XCircle, Briefcase } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
  const [showQuickPayModal, setShowQuickPayModal] = useState(false);
  const [showQuickExpenseModal, setShowQuickExpenseModal] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState<string | null>(null);

  // File Input Ref for Restore
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadData = () => {
    setMembers(getMembers());
    setPayments(getPayments());
    setTransactions(getTransactions());
  };

  const showToast = (message: string) => {
    setNotification(message);
  };

  const handleSaveMember = (member: Member) => {
    saveMember(member);
    loadData();
    setIsEditing(false);
    setEditingMember(undefined);
    showToast('Dados do legendário salvos com sucesso!');
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este legendário?')) {
      deleteMember(id);
      loadData();
      setIsEditing(false);
      setEditingMember(undefined);
      showToast('Legendário excluído com sucesso.');
    }
  };

  const handleEditClick = (member: Member) => {
    setEditingMember(member);
    setIsEditing(true);
    setActiveTab('members');
  };

  // --- Backup & Restore Logic ---
  const handleBackup = () => {
    const data = getFullDatabase();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legendarios_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup realizado! Arquivo baixado.');
  };

  const handleRestoreClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target?.result as string;
        if (restoreDatabase(content)) {
            loadData();
            showToast('Banco de dados restaurado com sucesso!');
        } else {
            alert('Erro ao ler arquivo de backup. Verifique se é um arquivo JSON válido do sistema.');
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // --- Financial Calculations for Dashboard ---
  const calculateFinancials = () => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    
    // Create a date object for the first day of the current month
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    // Determine the month name
    const monthName = MONTHS[currentMonth];

    let previousBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    // Process Payments (Fee Incomes)
    payments.forEach(p => {
        const pDate = new Date(p.paidDate);
        // Reset time to avoid timezone issues affecting day comparison strictly
        pDate.setHours(0,0,0,0);
        
        if (pDate < startOfCurrentMonth) {
            previousBalance += p.amount;
        } else if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
            monthlyIncome += p.amount;
        }
    });

    // Process Transactions (Income/Expense)
    transactions.forEach(t => {
        const tDate = new Date(t.date);
        tDate.setHours(0,0,0,0);

        if (tDate < startOfCurrentMonth) {
            if (t.type === 'income') previousBalance += t.amount;
            else previousBalance -= t.amount;
        } else if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
            if (t.type === 'income') monthlyIncome += t.amount;
            else monthlyExpense += t.amount;
        }
    });

    const currentBalance = previousBalance + monthlyIncome - monthlyExpense;

    return {
        monthName,
        currentYear,
        previousBalance,
        monthlyIncome,
        monthlyExpense,
        currentBalance
    };
  };

  const financials = calculateFinancials();

  // --- Census Calculations ---
  const census = {
    paying: members.filter(m => m.status === 'active_paying').length,
    exempt: members.filter(m => m.status === 'active_exempt').length,
    inactive: members.filter(m => m.status === 'inactive').length,
    beingHelped: members.filter(m => m.assistanceHistory && m.assistanceHistory.some(h => !h.endDate)).length
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <MemberForm
          initialData={editingMember}
          onSave={handleSaveMember}
          onCancel={() => {
            setIsEditing(false);
            setEditingMember(undefined);
          }}
          onDelete={handleDeleteMember}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
            
            {/* Financial Dashboard Row */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h3 className="text-lg font-bold text-gray-700 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-indigo-600"/>
                        Resumo Financeiro: <span className="text-indigo-600 ml-1">{financials.monthName}/{financials.currentYear}</span>
                    </h3>
                    <button onClick={() => setActiveTab('payments')} className="text-sm text-blue-600 hover:underline">Ver Detalhes</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Previous Balance */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Saldo Anterior</p>
                        <p className="text-xl font-bold text-gray-700">R$ {financials.previousBalance.toFixed(2)}</p>
                        <p className="text-[10px] text-gray-400">Acumulado até o mês passado</p>
                    </div>

                    {/* Monthly Income */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Receitas (Mês)</p>
                            <ArrowUpCircle size={16} className="text-green-500"/>
                        </div>
                        <p className="text-xl font-bold text-green-700">+ R$ {financials.monthlyIncome.toFixed(2)}</p>
                    </div>

                    {/* Monthly Expense */}
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex justify-between items-start">
                             <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Despesas (Mês)</p>
                             <ArrowDownCircle size={16} className="text-red-500"/>
                        </div>
                        <p className="text-xl font-bold text-red-700">- R$ {financials.monthlyExpense.toFixed(2)}</p>
                    </div>

                    {/* Current Balance */}
                    <div className={`p-4 rounded-lg border ${financials.currentBalance >= 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex justify-between items-start">
                             <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${financials.currentBalance >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>Saldo Atual (Caixa)</p>
                             <Scale size={16} className={financials.currentBalance >= 0 ? 'text-indigo-500' : 'text-red-500'}/>
                        </div>
                        <p className={`text-2xl font-extrabold ${financials.currentBalance >= 0 ? 'text-indigo-800' : 'text-red-800'}`}>
                            R$ {financials.currentBalance.toFixed(2)}
                        </p>
                         <p className="text-[10px] text-gray-500 mt-1">
                             (Ant. + Rec. - Desp.)
                         </p>
                    </div>
                </div>
            </div>

            {/* Detailed Member Census Row */}
            <div className="space-y-4">
               <h3 className="font-bold text-gray-700 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Censo Legendários <span className="text-gray-400 text-sm font-normal ml-2">(Total: {members.length})</span>
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Card: Active Paying */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center border-l-4 border-l-green-500">
                    <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Ativos (Pagantes)</p>
                        <p className="text-2xl font-bold text-gray-800">{census.paying}</p>
                    </div>
                  </div>
                  
                  {/* Card: Active Exempt */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center border-l-4 border-l-blue-500">
                    <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Ativos (Dispensados)</p>
                        <p className="text-2xl font-bold text-gray-800">{census.exempt}</p>
                    </div>
                  </div>

                  {/* Card: Inactive */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center border-l-4 border-l-gray-400">
                    <div className="p-3 rounded-full bg-gray-50 text-gray-500 mr-4">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Inativos</p>
                        <p className="text-2xl font-bold text-gray-800">{census.inactive}</p>
                    </div>
                  </div>

                  {/* Card: Being Helped */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center border-l-4 border-l-amber-500">
                    <div className="p-3 rounded-full bg-amber-50 text-amber-600 mr-4">
                      <HeartHandshake size={24} />
                    </div>
                    <div>
                      <p className="text-amber-700 text-xs font-bold uppercase">Recebendo Ajuda</p>
                      <p className="text-2xl font-bold text-gray-800">{census.beingHelped}</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Aniversariantes */}
               <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                 <h3 className="font-bold text-gray-700 mb-4">Aniversariantes do Mês</h3>
                 {members.filter(m => new Date(m.birthDate).getMonth() === new Date().getMonth()).length > 0 ? (
                    <ul className="space-y-0 divide-y divide-gray-100">
                      {members.filter(m => new Date(m.birthDate).getMonth() === new Date().getMonth()).map(m => (
                        <li key={m.id} className="py-3 px-2 hover:bg-gray-50 flex items-center justify-between">
                           <div>
                              <div className="font-medium text-gray-800 text-sm">
                                <span className="text-blue-600 font-bold mr-1">#{m.legendaryNumber}</span> 
                                {m.fullName}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <Phone size={12} className="mr-1" />
                                {m.phone}
                              </div>
                           </div>
                           <div className="text-right">
                             <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                               {new Date(m.birthDate).getDate()}/{new Date(m.birthDate).getMonth()+1}
                             </span>
                           </div>
                        </li>
                      ))}
                    </ul>
                 ) : (
                   <p className="text-gray-400 text-sm italic py-4 text-center">Nenhum aniversariante este mês.</p>
                 )}
               </div>
               
               <div className="space-y-6">
                  {/* Acesso Rápido */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4">Acesso Rápido</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <button onClick={() => { setIsEditing(true); setEditingMember(undefined); }} className="py-4 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 text-sm transition-colors flex flex-col items-center justify-center gap-2 border border-blue-100 shadow-sm">
                          <Plus size={24} />
                          Novo Membro
                        </button>
                        <button onClick={() => setShowQuickPayModal(true)} className="py-4 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 text-sm transition-colors flex flex-col items-center justify-center gap-2 border border-green-100 shadow-sm">
                          <DollarSign size={24} />
                          Registrar Pagamento
                        </button>
                        <button onClick={() => setShowQuickExpenseModal(true)} className="py-4 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 text-sm transition-colors flex flex-col items-center justify-center gap-2 border border-purple-100 shadow-sm">
                          <ArrowRightLeft size={24} />
                          Lançamento Caixa
                        </button>
                    </div>
                    <button onClick={() => setActiveTab('ecosystem')} className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 text-sm transition-colors flex items-center justify-center gap-2 border border-indigo-100">
                          <HeartHandshake size={18} /> Buscar Profissional (Ecossistema)
                    </button>
                  </div>

                  {/* Database Actions */}
                  <div className="bg-slate-50 p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center">
                        <Database className="w-5 h-5 mr-2" /> Segurança dos Dados
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleBackup}
                            className="flex items-center justify-center px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-sm font-medium"
                        >
                            <Download size={16} className="mr-2" /> Backup
                        </button>
                        <button 
                            onClick={handleRestoreClick}
                            className="flex items-center justify-center px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-sm font-medium"
                        >
                            <Upload size={16} className="mr-2" /> Restaurar
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json"
                            className="hidden"
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        Faça download do backup regularmente para garantir a segurança dos dados.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'members':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Gestão de Legendários</h2>
              <button
                onClick={() => {
                  setEditingMember(undefined);
                  setIsEditing(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Novo Cadastro
              </button>
            </div>
            <MemberList members={members} onEdit={handleEditClick} onDelete={handleDeleteMember} />
          </div>
        );
      case 'payments':
        return (
            <PaymentManager 
                members={members} 
                payments={payments} 
                transactions={transactions} 
                onUpdate={loadData} 
            />
        );
      case 'ecosystem':
        return <ServiceFinder members={members} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setIsEditing(false); }} />
      <main className="flex-1 overflow-y-auto p-8 relative">
        
        {/* Toast Notification */}
        {notification && (
            <div className="absolute top-4 right-4 z-50 animate-fadeIn">
                <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                    <CheckCircle size={20} />
                    <span className="font-medium">{notification}</span>
                    <button onClick={() => setNotification(null)} className="ml-2 hover:bg-green-700 rounded p-1">
                        <X size={16} />
                    </button>
                </div>
            </div>
        )}

        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Quick Payment Modal */}
      <QuickPaymentModal 
        isOpen={showQuickPayModal} 
        onClose={() => setShowQuickPayModal(false)}
        members={members}
        onSuccess={() => {
            loadData();
            showToast('Pagamento registrado com sucesso!');
        }}
      />
      
       {/* Quick Expense Modal (Now Quick Transaction) */}
       <QuickExpenseModal 
        isOpen={showQuickExpenseModal} 
        onClose={() => setShowQuickExpenseModal(false)}
        onSuccess={() => {
            loadData();
            showToast('Movimentação registrada com sucesso!');
        }}
      />
    </div>
  );
};

export default App;