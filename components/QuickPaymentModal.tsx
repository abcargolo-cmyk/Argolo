import React, { useState, useEffect } from 'react';
import { Member, MONTHS, Payment } from '../types';
import { savePayment } from '../services/storageService';
import { X, Search, CheckCircle, DollarSign, Calendar, User, Phone } from 'lucide-react';

interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSuccess: () => void;
}

const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({ isOpen, onClose, members, onSuccess }) => {
  const [legendaryNumber, setLegendaryNumber] = useState('');
  const [foundMember, setFoundMember] = useState<Member | null>(null);
  
  // Payment Form State
  const [amount, setAmount] = useState('50.00');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setLegendaryNumber('');
      setFoundMember(null);
      setAmount('50.00');
      setSelectedMonth(new Date().getMonth() + 1);
      setPaidDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  // Auto-search when number changes
  useEffect(() => {
    const timer = setTimeout(() => {
        if (legendaryNumber.trim()) {
            const member = members.find(m => m.legendaryNumber === legendaryNumber.trim());
            setFoundMember(member || null);
        } else {
            setFoundMember(null);
        }
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [legendaryNumber, members]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundMember) return;

    const newPayment: Payment = {
        id: crypto.randomUUID(),
        memberId: foundMember.id,
        month: Number(selectedMonth),
        year: Number(selectedYear),
        amount: parseFloat(amount.replace(',', '.')),
        paidDate: paidDate
    };

    savePayment(newPayment);
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center">
            <DollarSign className="mr-2" /> Registrar Pagamento Rápido
          </h3>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Search Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número do Legendário</label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={legendaryNumber}
                onChange={(e) => setLegendaryNumber(e.target.value)}
                placeholder="Digite o número..."
                className="w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Member Details Card */}
          <div className={`transition-all duration-300 ${foundMember ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
             {foundMember && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col gap-2">
                    <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <User className="text-green-600 h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-lg leading-tight">{foundMember.fullName}</p>
                            <p className="text-sm text-green-700 flex items-center mt-1">
                                <Phone size={14} className="mr-1"/> {foundMember.phone}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide font-semibold">
                                {foundMember.status === 'active_paying' ? 'Pagante' : 'Dispensado/Inativo'}
                            </p>
                        </div>
                    </div>
                </div>
             )}
          </div>

          {/* Payment Details */}
          <div className={`space-y-4 ${!foundMember ? 'opacity-50 pointer-events-none' : ''}`}>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-2 border rounded-md font-bold text-gray-700"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Pagamento</label>
                    <input
                        type="date"
                        required
                        value={paidDate}
                        onChange={(e) => setPaidDate(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    />
                 </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mês Referência</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="w-full p-2 border rounded-md"
                    >
                        {MONTHS.map((m, idx) => (
                            <option key={idx} value={idx + 1}>{m}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full p-2 border rounded-md"
                    >
                         {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
             </div>

             <button 
                type="submit" 
                disabled={!foundMember}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center shadow-md disabled:bg-gray-300"
             >
                <CheckCircle className="mr-2" /> Confirmar Pagamento
             </button>
          </div>

          {!foundMember && legendaryNumber.length > 2 && (
             <p className="text-center text-sm text-red-500 animate-pulse">
                Legendário não encontrado...
             </p>
          )}

        </form>
      </div>
    </div>
  );
};

export default QuickPaymentModal;