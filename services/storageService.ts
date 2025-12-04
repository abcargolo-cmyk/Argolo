import { Member, Payment, Transaction } from '../types';

const MEMBERS_KEY = 'legendarios_members';
const PAYMENTS_KEY = 'legendarios_payments';
const TRANSACTIONS_KEY = 'legendarios_transactions';

export const getMembers = (): Member[] => {
  const data = localStorage.getItem(MEMBERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveMember = (member: Member): void => {
  const members = getMembers();
  const index = members.findIndex(m => m.id === member.id);
  if (index >= 0) {
    members[index] = member;
  } else {
    members.push(member);
  }
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
};

export const deleteMember = (id: string): void => {
  const members = getMembers().filter(m => m.id !== id);
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
};

export const getPayments = (): Payment[] => {
  const data = localStorage.getItem(PAYMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const savePayment = (payment: Payment): void => {
  const payments = getPayments();
  const index = payments.findIndex(p => p.id === payment.id);
  if (index >= 0) {
    payments[index] = payment;
  } else {
    payments.push(payment);
  }
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
};

export const deletePayment = (id: string): void => {
  const payments = getPayments().filter(p => p.id !== id);
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
};

// --- Transaction Storage (Cash Book) ---

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === transaction.id);
  if (index >= 0) {
    transactions[index] = transaction;
  } else {
    transactions.push(transaction);
  }
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const deleteTransaction = (id: string): void => {
  const transactions = getTransactions().filter(t => t.id !== id);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

// --- Database Management Functions ---

export const getFullDatabase = () => {
  return {
    members: getMembers(),
    payments: getPayments(),
    transactions: getTransactions(),
    exportedAt: new Date().toISOString(),
    version: '1.1'
  };
};

export const restoreDatabase = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    // Validate basic structure
    if (!Array.isArray(data.members) || !Array.isArray(data.payments)) {
        throw new Error("Formato de arquivo inválido.");
    }

    localStorage.setItem(MEMBERS_KEY, JSON.stringify(data.members));
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(data.payments));
    
    // Handle version compatibility for transactions
    if (Array.isArray(data.transactions)) {
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(data.transactions));
    } else {
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
    }
    
    return true;
  } catch (e) {
    console.error("Erro ao restaurar backup:", e);
    return false;
  }
};