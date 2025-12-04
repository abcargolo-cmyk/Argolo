import React, { useState, useEffect } from 'react';
import { saveTransaction } from '../services/storageService';
import { X, DollarSign, FileText, Tag, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft } from 'lucide-react';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      setType('expense');
      setDescription('');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    saveTransaction({
      id: crypto.randomUUID(),
      description,
      amount: parseFloat(amount),
      type,
      category: category || 'Geral',
      date
    });

    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  const isExpense = type === 'expense';
  const themeColor = isExpense ? 'red' : 'green';
  const bgColor = isExpense ? 'bg-red-600' : 'bg-green-600';
  const hoverColor = isExpense ? 'hover:bg-red-700' : 'hover:bg-green-700';
  const focusRing = isExpense ? 'focus:ring-red-500' : 'focus:ring-green-500';
  const focusBorder = isExpense ? 'focus:border-red-500' : 'focus:border-green-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div className={`${bgColor} p-4 flex justify-between items-center text-white transition-colors duration-300`}>
          <h3 className="font-bold text-lg flex items-center">
            {isExpense ? <ArrowDownCircle className="mr-2" /> : <ArrowUpCircle className="mr-2" />}
            {isExpense ? 'Registrar Saída (Despesa)' : 'Registrar Entrada (Receita)'}
          </h3>
          <button onClick={onClose} className={`${hoverColor} p-1 rounded`}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Transaction Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimentação</label>
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex items-center justify-center py-2 px-4 rounded-md border ${isExpense ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    <ArrowDownCircle size={18} className="mr-2" /> Saída
                </button>
                <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex items-center justify-center py-2 px-4 rounded-md border ${!isExpense ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    <ArrowUpCircle size={18} className="mr-2" /> Entrada
                </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <div className="relative">
               <input
                type="text"
                required
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isExpense ? "Ex: Conta de Luz" : "Ex: Doação Anônima"}
                className={`w-full pl-10 pr-4 py-2 border rounded-md ${focusRing} ${focusBorder}`}
              />
              <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                 <div className="relative">
                    <input
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={`w-full pl-8 pr-4 py-2 border rounded-md ${focusRing} ${focusBorder}`}
                    />
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                 </div>
            </div>
             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                 <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full p-2 border rounded-md ${focusRing} ${focusBorder}`}
                />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
             <div className="relative">
                <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Administrativo"
                    list={isExpense ? "expense-categories" : "income-categories"}
                    className={`w-full pl-10 pr-4 py-2 border rounded-md ${focusRing} ${focusBorder}`}
                />
                <Tag className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                
                <datalist id="expense-categories">
                    <option value="Administrativo" />
                    <option value="Alimentação" />
                    <option value="Transporte" />
                    <option value="Infraestrutura" />
                    <option value="Doação/Ajuda" />
                    <option value="Eventos" />
                </datalist>

                <datalist id="income-categories">
                    <option value="Doação" />
                    <option value="Oferta" />
                    <option value="Evento" />
                    <option value="Venda" />
                    <option value="Outros" />
                </datalist>
             </div>
          </div>

          <button 
            type="submit" 
            className={`w-full ${bgColor} text-white font-bold py-3 rounded-lg ${hoverColor} transition-colors flex justify-center items-center shadow-md mt-6`}
          >
            {isExpense ? <ArrowDownCircle className="mr-2" /> : <ArrowUpCircle className="mr-2" />} 
            {isExpense ? 'Confirmar Saída' : 'Confirmar Entrada'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickExpenseModal;