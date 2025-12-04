import React, { useState, useEffect } from 'react';
import { Member, Payment, Transaction, MONTHS } from '../types';
import { savePayment, deletePayment, saveTransaction, deleteTransaction } from '../services/storageService';
import { exportFinancialReportToWord, exportFinancialReportToCSV } from '../services/exportService';
import { Check, DollarSign, LayoutList, Calendar, Grid, Search, ArrowUpCircle, ArrowDownCircle, Plus, Wallet, Trash2, FileText, Download, Edit } from 'lucide-react';

interface PaymentManagerProps {
  members: Member[];
  payments: Payment[];
  transactions: Transaction[]; // New transactions prop
  onUpdate: () => void;
}

const PaymentManager: React.FC<PaymentManagerProps> = ({ members, payments, transactions, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'cashbook' | 'fees' | 'reports'>('cashbook');
  
  // State for Cash Book Form
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingItem, setEditingItem] = useState<{id: string, isFee: boolean} | null>(null);
  
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    category: 'Despesa'
  });

  // State for Fees (Existing Logic)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridFilterText, setGridFilterText] = useState('');
  const [listMemberId, setListMemberId] = useState('');
  const [listMonth, setListMonth] = useState('');
  const [searchLegendaryNumber, setSearchLegendaryNumber] = useState('');

  // State for Reports
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  // --- Cash Book Logic ---
  
  // Combine Payments (Fees) + Transactions into a single Ledger
  const getLedger = () => {
    const feeTransactions = payments.map(p => {
        const member = members.find(m => m.id === p.memberId);
        return {
            id: `fee_${p.id}`,
            date: p.paidDate,
            description: `Mensalidade - ${member ? member.fullName : 'Membro Excluído'} (${MONTHS[p.month-1]}/${p.year})`,
            category: 'Mensalidade',
            type: 'income' as const,
            amount: p.amount,
            originalId: p.id,
            isFee: true
        };
    });

    const manualTransactions = transactions.map(t => ({
        ...t,
        originalId: t.id,
        isFee: false
    }));

    return [...feeTransactions, ...manualTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const ledger = getLedger();

  const totalIncome = ledger.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = ledger.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const resetForm = () => {
      setShowTransactionForm(false);
      setEditingItem(null);
      setNewTransaction({
          type: 'expense',
          date: new Date().toISOString().split('T')[0],
          amount: 0,
          description: '',
          category: 'Despesa'
      });
  };

  const handleEditLedgerItem = (item: any) => {
      setEditingItem({ id: item.originalId, isFee: item.isFee });
      setNewTransaction({
          type: item.type,
          category: item.category,
          date: item.date,
          amount: item.amount,
          description: item.description
      });
      setShowTransactionForm(true);
      
      // Scroll to top of list to see form
      const formElement = document.getElementById('transaction-form');
      if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
        // --- UPDATING EXISTING ITEM ---
        if (editingItem.isFee) {
            // Updating a Fee (Payment) - Only Amount and Date are editable usually
            const originalPayment = payments.find(p => p.id === editingItem.id);
            if (originalPayment) {
                savePayment({
                    ...originalPayment,
                    amount: Number(newTransaction.amount),
                    paidDate: newTransaction.date || originalPayment.paidDate
                });
            }
        } else {
            // Updating a Manual Transaction
            if (newTransaction.description && newTransaction.amount) {
                saveTransaction({
                    id: editingItem.id,
                    description: newTransaction.description,
                    amount: Number(newTransaction.amount),
                    type: newTransaction.type as 'income' | 'expense',
                    category: newTransaction.category || 'Geral',
                    date: newTransaction.date || new Date().toISOString().split('T')[0]
                });
            }
        }
    } else {
        // --- CREATING NEW ITEM ---
        if (newTransaction.description && newTransaction.amount) {
            saveTransaction({
                id: crypto.randomUUID(),
                description: newTransaction.description,
                amount: Number(newTransaction.amount),
                type: newTransaction.type as 'income' | 'expense',
                category: newTransaction.category || 'Geral',
                date: newTransaction.date || new Date().toISOString().split('T')[0]
            });
        }
    }
    
    resetForm();
    onUpdate();
  };

  const handleDeleteLedgerItem = (item: any) => {
      if (confirm('Tem certeza que deseja excluir este registro financeiro?')) {
          if (item.isFee) {
              deletePayment(item.originalId);
          } else {
              deleteTransaction(item.originalId);
          }
          onUpdate();
      }
  };


  // --- Fees Logic (Grid) ---
  const handleTogglePayment = (memberId: string, monthIndex: number) => {
    const existingPayment = payments.find(
      p => p.memberId === memberId && p.month === monthIndex + 1 && p.year === selectedYear
    );

    if (existingPayment) {
      if (confirm('Deseja remover este pagamento?')) {
        deletePayment(existingPayment.id);
        onUpdate();
      }
    } else {
      const amountStr = prompt('Informe o valor da mensalidade:', '50');
      if (amountStr) {
        const amount = parseFloat(amountStr.replace(',', '.'));
        if (!isNaN(amount)) {
          const newPayment: Payment = {
            id: crypto.randomUUID(),
            memberId,
            month: monthIndex + 1,
            year: selectedYear,
            amount,
            paidDate: new Date().toISOString().split('T')[0]
          };
          savePayment(newPayment);
          onUpdate();
        }
      }
    }
  };

  const getPaymentStatus = (memberId: string, monthIndex: number) => {
    return payments.find(p => p.memberId === memberId && p.month === monthIndex + 1 && p.year === selectedYear);
  };

  const calculateMonthlyTotal = (monthIndex: number) => {
    return payments
      .filter(p => p.month === monthIndex + 1 && p.year === selectedYear)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const calculateMemberTotal = (memberId: string) => {
     return payments
      .filter(p => p.memberId === memberId && p.year === selectedYear)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const filteredGridMembers = members.filter(m => m.fullName.toLowerCase().includes(gridFilterText.toLowerCase()));

  // --- Fees Logic (List) ---
  const handleLegendaryNumberSearch = (val: string) => {
      setSearchLegendaryNumber(val);
      if (val.trim()) {
          const found = members.find(m => m.legendaryNumber === val.trim());
          if (found) {
              setListMemberId(found.id);
          } else {
              setListMemberId('not_found');
          }
      } else {
          setListMemberId('');
      }
  };

  const getFilteredListPayments = () => {
    return payments.filter(p => {
        const matchYear = p.year === selectedYear;
        const matchMember = listMemberId ? p.memberId === listMemberId : true;
        const matchMonth = listMonth ? p.month === Number(listMonth) : true;
        return matchYear && matchMember && matchMonth;
    }).sort((a, b) => b.month - a.month);
  };

  const listPayments = getFilteredListPayments();
  const listTotal = listPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const getMemberName = (id: string) => members.find(m => m.id === id)?.fullName || 'Desconhecido';

  // --- Reports Logic ---
  const getReportData = () => {
      return ledger.filter(t => {
          const tDate = new Date(t.date);
          // Fix timezone issues by using getUTCMonth/FullYear or just simple string parsing if date is YYYY-MM-DD
          // Here we use the local date object constructed from YYYY-MM-DD string, which defaults to 00:00 local time
          // However, to be safe with the string format YYYY-MM-DD:
          const [y, m] = t.date.split('-').map(Number);
          return m === reportMonth && y === reportYear;
      });
  };

  const reportData = getReportData();
  const reportIncome = reportData.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const reportExpense = reportData.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const reportBalance = reportIncome - reportExpense;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <DollarSign className="mr-2" /> Gestão Financeira
            </h2>
            <div className="flex space-x-2 mt-4 md:mt-0">
                <button 
                    onClick={() => setActiveTab('cashbook')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${activeTab === 'cashbook' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <Wallet size={18} className="mr-2"/> Livro Caixa
                </button>
                <button 
                    onClick={() => setActiveTab('fees')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${activeTab === 'fees' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <Grid size={18} className="mr-2"/> Mensalidades
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <FileText size={18} className="mr-2"/> Relatórios
                </button>
            </div>
          </div>

          {/* Cash Book Tab */}
          {activeTab === 'cashbook' && (
              <div className="animate-fadeIn">
                  {/* Financial Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center justify-between">
                          <div>
                              <p className="text-green-700 text-sm font-bold uppercase">Entradas Totais</p>
                              <p className="text-2xl font-bold text-green-800">R$ {totalIncome.toFixed(2)}</p>
                          </div>
                          <ArrowUpCircle className="text-green-500 w-10 h-10" />
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-center justify-between">
                          <div>
                              <p className="text-red-700 text-sm font-bold uppercase">Saídas Totais</p>
                              <p className="text-2xl font-bold text-red-800">R$ {totalExpense.toFixed(2)}</p>
                          </div>
                          <ArrowDownCircle className="text-red-500 w-10 h-10" />
                      </div>
                      <div className={`p-4 rounded-lg border flex items-center justify-between ${balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                          <div>
                              <p className={`${balance >= 0 ? 'text-blue-700' : 'text-red-700'} text-sm font-bold uppercase`}>Saldo Atual</p>
                              <p className={`${balance >= 0 ? 'text-blue-800' : 'text-red-800'} text-2xl font-bold`}>R$ {balance.toFixed(2)}</p>
                          </div>
                          <Wallet className={`${balance >= 0 ? 'text-blue-500' : 'text-red-500'} w-10 h-10`} />
                      </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-700">Fluxo de Caixa (Todas as Movimentações)</h3>
                      {!showTransactionForm && (
                        <button 
                            onClick={() => { resetForm(); setShowTransactionForm(true); }}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition"
                        >
                            <Plus size={18} className="mr-2"/> Nova Movimentação
                        </button>
                      )}
                  </div>

                  {/* Transaction Form (Inline) */}
                  {showTransactionForm && (
                      <div id="transaction-form" className="bg-gray-50 border-2 border-indigo-100 rounded-lg p-4 mb-6 animate-slideDown shadow-sm">
                          <h4 className="font-bold text-indigo-800 mb-3 flex items-center">
                              {editingItem ? <Edit className="mr-2" size={18}/> : <Plus className="mr-2" size={18}/>}
                              {editingItem ? 'Editar Lançamento' : 'Registrar Entrada ou Saída'}
                          </h4>
                          <form onSubmit={handleSaveTransaction} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                              <div className="md:col-span-1">
                                  <label className="block text-xs font-bold text-gray-600 mb-1">Tipo</label>
                                  <select 
                                    className="w-full p-2 border rounded disabled:bg-gray-200 disabled:text-gray-500"
                                    value={newTransaction.type}
                                    onChange={e => setNewTransaction({...newTransaction, type: e.target.value as 'income' | 'expense'})}
                                    disabled={editingItem?.isFee} // Cannot change type of a Fee
                                  >
                                      <option value="expense">Saída (Despesa)</option>
                                      <option value="income">Entrada (Receita)</option>
                                  </select>
                              </div>
                              <div className="md:col-span-1">
                                  <label className="block text-xs font-bold text-gray-600 mb-1">Categoria</label>
                                  <input 
                                    type="text" 
                                    placeholder="Ex: Doação, Luz, Água"
                                    className="w-full p-2 border rounded disabled:bg-gray-200 disabled:text-gray-500"
                                    value={newTransaction.category}
                                    onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}
                                    required
                                    disabled={editingItem?.isFee} // Cannot change category of a Fee
                                  />
                              </div>
                              <div className="md:col-span-1">
                                  <label className="block text-xs font-bold text-gray-600 mb-1">Data</label>
                                  <input 
                                    type="date" 
                                    className="w-full p-2 border rounded"
                                    value={newTransaction.date}
                                    onChange={e => setNewTransaction({...newTransaction, date: e.target.value})}
                                    required
                                  />
                              </div>
                              <div className="md:col-span-1">
                                  <label className="block text-xs font-bold text-gray-600 mb-1">Valor</label>
                                  <input 
                                    type="number" 
                                    step="0.01" 
                                    className="w-full p-2 border rounded"
                                    value={newTransaction.amount}
                                    onChange={e => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})}
                                    required
                                  />
                              </div>
                              <div className="md:col-span-5">
                                  <label className="block text-xs font-bold text-gray-600 mb-1">Descrição</label>
                                  <input 
                                    type="text" 
                                    placeholder="Detalhes da transação..."
                                    className="w-full p-2 border rounded disabled:bg-gray-200 disabled:text-gray-500"
                                    value={newTransaction.description}
                                    onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                                    required
                                    disabled={editingItem?.isFee} // Cannot change description of a Fee
                                  />
                                  {editingItem?.isFee && <span className="text-[10px] text-orange-600">Descrição e Categoria de mensalidades são geradas automaticamente.</span>}
                              </div>
                              <div className="md:col-span-5 flex justify-end space-x-2 mt-2">
                                  <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold shadow-sm">
                                      {editingItem ? 'Salvar Alterações' : 'Registrar'}
                                  </button>
                              </div>
                          </form>
                      </div>
                  )}

                  {/* Transaction Table */}
                  <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                              <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                              {ledger.map((item) => (
                                  <tr key={item.id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                          {new Date(item.date).toLocaleDateString('pt-BR')}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                          {item.description}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{item.category}</span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-center">
                                          {item.type === 'income' ? (
                                              <span className="flex items-center justify-center text-green-600 text-xs font-bold uppercase"><ArrowUpCircle size={14} className="mr-1"/> Entrada</span>
                                          ) : (
                                              <span className="flex items-center justify-center text-red-600 text-xs font-bold uppercase"><ArrowDownCircle size={14} className="mr-1"/> Saída</span>
                                          )}
                                      </td>
                                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-bold ${item.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                                          {item.type === 'expense' ? '-' : '+'} R$ {item.amount.toFixed(2)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-center flex justify-center space-x-2">
                                          <button 
                                            onClick={() => handleEditLedgerItem(item)}
                                            className="text-blue-400 hover:text-blue-600 transition p-1"
                                            title="Editar registro"
                                          >
                                              <Edit size={16} />
                                          </button>
                                          <button 
                                            onClick={() => handleDeleteLedgerItem(item)}
                                            className="text-gray-400 hover:text-red-500 transition p-1"
                                            title="Excluir registro"
                                          >
                                              <Trash2 size={16} />
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                              {ledger.length === 0 && (
                                  <tr>
                                      <td colSpan={6} className="text-center py-8 text-gray-500">Nenhuma movimentação registrada.</td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {/* Monthly Fees Tab (Original) */}
          {activeTab === 'fees' && (
             <div className="animate-fadeIn">
                 {/* Filters Row */}
                 <div className="flex flex-col md:flex-row justify-between items-center mb-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex gap-2 mb-2 md:mb-0">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1 text-sm rounded-md flex items-center ${viewMode === 'grid' ? 'bg-white border border-blue-200 text-blue-700 font-bold shadow-sm' : 'text-gray-600'}`}
                        >
                            <Grid size={14} className="mr-1"/> Grade Anual
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1 text-sm rounded-md flex items-center ${viewMode === 'list' ? 'bg-white border border-blue-200 text-blue-700 font-bold shadow-sm' : 'text-gray-600'}`}
                        >
                            <LayoutList size={14} className="mr-1"/> Extrato Detalhado
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <label className="text-sm font-bold text-gray-600">Ano de Referência:</label>
                       <select 
                        value={selectedYear} 
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        className="border rounded px-3 py-2 font-bold bg-white"
                      >
                        {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                 </div>

                 {viewMode === 'grid' ? (
                    <>
                        <div className="flex justify-end mb-2">
                            <input 
                                type="text" 
                                placeholder="Filtrar membro na grade..." 
                                className="border rounded px-3 py-2 w-full md:w-64"
                                value={gridFilterText}
                                onChange={e => setGridFilterText(e.target.value)}
                            />
                        </div>
                        <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-800 text-white">
                                <tr>
                                <th className="px-4 py-3 text-left sticky left-0 bg-gray-800 z-10">Membro</th>
                                {MONTHS.map(m => (
                                    <th key={m} className="px-2 py-3 text-center">{m.substring(0, 3)}</th>
                                ))}
                                <th className="px-4 py-3 text-center font-bold bg-gray-900">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredGridMembers.map(member => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium text-gray-900 sticky left-0 bg-white border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    <div className="truncate max-w-[150px]" title={member.fullName}>
                                        {member.legendaryNumber} - {member.fullName}
                                    </div>
                                    </td>
                                    {MONTHS.map((_, idx) => {
                                    const payment = getPaymentStatus(member.id, idx);
                                    return (
                                        <td key={idx} className="px-2 py-2 text-center border-l border-gray-100">
                                        <button
                                            onClick={() => handleTogglePayment(member.id, idx)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors mx-auto ${
                                            payment 
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                : 'bg-gray-50 text-gray-200 hover:bg-gray-200'
                                            }`}
                                            title={payment ? `Pago: R$ ${payment.amount.toFixed(2)}` : 'Não pago'}
                                        >
                                            {payment ? <Check size={16} /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                                        </button>
                                        </td>
                                    );
                                    })}
                                    <td className="px-4 py-2 text-center font-bold text-gray-800 bg-gray-50 border-l">
                                    R$ {calculateMemberTotal(member.id).toFixed(2)}
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-100 font-bold">
                                <tr>
                                <td className="px-4 py-3 sticky left-0 bg-gray-100 border-r">TOTAL MENSAL</td>
                                {MONTHS.map((_, idx) => (
                                    <td key={idx} className="px-2 py-3 text-center text-xs text-blue-800 border-l">
                                    R$ {calculateMonthlyTotal(idx).toFixed(2)}
                                    </td>
                                ))}
                                <td className="px-4 py-3 text-center text-green-800 bg-green-100 border-l">
                                    R$ {payments.filter(p => p.year === selectedYear).reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                                </td>
                                </tr>
                            </tfoot>
                            </table>
                        </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Nº Legendário</label>
                                 <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Digite o número..."
                                        value={searchLegendaryNumber}
                                        onChange={(e) => handleLegendaryNumberSearch(e.target.value)}
                                        className="w-full border rounded-md pl-8 pr-2 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                 </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Membro</label>
                                <select 
                                    value={listMemberId}
                                    onChange={(e) => {
                                        setListMemberId(e.target.value);
                                        if(e.target.value === '') setSearchLegendaryNumber('');
                                        const m = members.find(mem => mem.id === e.target.value);
                                        if(m) setSearchLegendaryNumber(m.legendaryNumber);
                                    }}
                                    className="w-full border rounded-md p-2"
                                >
                                    <option value="">Todos os Membros</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.legendaryNumber} - {m.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Mês</label>
                                <select 
                                    value={listMonth}
                                    onChange={(e) => setListMonth(e.target.value)}
                                    className="w-full border rounded-md p-2"
                                >
                                    <option value="">Todos os Meses</option>
                                    {MONTHS.map((m, idx) => (
                                        <option key={idx} value={idx+1}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Pagamento</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Membro</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referência</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {listPayments.length > 0 ? (
                                        listPayments.map(p => (
                                            <tr key={p.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(p.paidDate).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {getMemberName(p.memberId)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {MONTHS[p.month - 1]}/{p.year}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-700">
                                                    R$ {p.amount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                Nenhum pagamento encontrado para os filtros selecionados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-blue-50">
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-right font-bold text-blue-900">
                                            TOTAL ANUAL {selectedYear} ({listMemberId && listMemberId !== 'not_found' ? 'Membro Selecionado' : 'Geral'}):
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-blue-900 text-lg">
                                            R$ {listTotal.toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                  )}
             </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
              <div className="animate-fadeIn">
                  <div className="bg-white rounded-lg shadow p-8 border border-gray-200">
                      <div className="text-center mb-8">
                          <h3 className="text-xl font-bold text-gray-800">Emissão de Relatório Executivo Mensal</h3>
                          <p className="text-gray-500">Selecione o período para gerar um relatório detalhado para reuniões de diretoria.</p>
                      </div>

                      <div className="max-w-xl mx-auto bg-gray-50 p-6 rounded-lg border border-gray-200">
                          <div className="grid grid-cols-2 gap-4 mb-6">
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-2">Mês</label>
                                  <select 
                                      value={reportMonth}
                                      onChange={(e) => setReportMonth(Number(e.target.value))}
                                      className="w-full p-3 border rounded-lg bg-white shadow-sm"
                                  >
                                      {MONTHS.map((m, idx) => (
                                          <option key={idx} value={idx+1}>{m}</option>
                                      ))}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-2">Ano</label>
                                  <select 
                                      value={reportYear}
                                      onChange={(e) => setReportYear(Number(e.target.value))}
                                      className="w-full p-3 border rounded-lg bg-white shadow-sm"
                                  >
                                      {[2023, 2024, 2025, 2026].map(y => (
                                          <option key={y} value={y}>{y}</option>
                                      ))}
                                  </select>
                              </div>
                          </div>

                          {/* Report Preview Summary */}
                          <div className="bg-white p-4 rounded border border-gray-200 mb-6">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b pb-2">Prévia - {MONTHS[reportMonth-1]}/{reportYear}</h4>
                              <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                      <span className="text-green-700">Entradas:</span>
                                      <span className="font-bold">R$ {reportIncome.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-red-700">Saídas:</span>
                                      <span className="font-bold">R$ {reportExpense.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between border-t pt-2 mt-2">
                                      <span className="text-blue-900 font-bold">Saldo do Período:</span>
                                      <span className={`font-bold ${reportBalance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>R$ {reportBalance.toFixed(2)}</span>
                                  </div>
                              </div>
                          </div>

                          <div className="flex gap-4">
                              <button 
                                  onClick={() => exportFinancialReportToCSV(reportMonth, reportYear, reportData)}
                                  disabled={reportData.length === 0}
                                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  <Grid className="mr-2" size={20}/>
                                  Baixar Excel (CSV)
                              </button>
                              <button 
                                  onClick={() => exportFinancialReportToWord(reportMonth, reportYear, reportData)}
                                  disabled={reportData.length === 0}
                                  className="flex-1 py-3 px-4 bg-blue-800 text-white rounded-lg font-bold hover:bg-blue-900 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  <FileText className="mr-2" size={20}/>
                                  Baixar Word (DOC)
                              </button>
                          </div>
                          {reportData.length === 0 && (
                              <p className="text-center text-xs text-red-500 mt-2">Nenhuma transação encontrada neste período.</p>
                          )}
                      </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default PaymentManager;