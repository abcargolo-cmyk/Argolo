export interface Child {
  name: string;
  age: string;
}

export interface AssistanceRecord {
  id: string;
  description: string;
  startDate: string;
  endDate?: string; // If undefined/empty, it is ongoing
}

export type MemberStatus = 'active_paying' | 'active_exempt' | 'inactive';

export interface Member {
  id: string;
  legendaryNumber: string;
  // Conquest details
  conquestDate?: string;
  topNumber?: string;
  trackName?: string;

  fullName: string;
  birthDate: string; // YYYY-MM-DD
  profession: string;
  address: string;
  neighborhood?: string;
  city: string;
  state?: string; // Added State field
  phone: string;
  email?: string; // Made optional
  
  // Family
  spouseName?: string;
  spousePhone?: string;
  children: Child[]; 
  
  // Church / Community
  churchName?: string;
  pastorName?: string;
  pastorPhone?: string;
  isCommunityActive: boolean;

  // System Status
  status: MemberStatus;
  inactiveReason?: string; // Required if status is inactive

  // Help / Assistance Context
  assistanceHistory: AssistanceRecord[];

  socioEconomicNotes?: string;
  joinedDate: string;
}

export interface Payment {
  id: string;
  memberId: string;
  month: number; // 1-12
  year: number;
  amount: number;
  paidDate: string;
}

// --- New Financial Types ---

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string; // e.g., "Mensalidade", "Doação", "Despesa Fixa", "Ajuda de Custo"
  date: string;
  memberId?: string; // Optional link to a member
}

export const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];