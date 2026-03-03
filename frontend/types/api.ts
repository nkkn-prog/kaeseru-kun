// lib 層の関数シグネチャ定義
// 各 lib ファイルはこの型に従って実装する

import type {
  Debt,
  DebtInsert,
  DebtUpdate,
  Transaction,
  TransactionInsert,
  TransactionUpdate,
  Income,
  IncomeInsert,
  IncomeUpdate,
  MonthlyAnalysis,
  SourceType,
} from "./database";

// --- Debts (lib/api/debts.ts) ---
// Server Component から呼ぶため userId を明示的に渡す（RLS バイパス対策）

export type DebtsApi = {
  getDebts: (userId: string) => Promise<Debt[]>;
  getDebtById: (userId: string, id: string) => Promise<Debt | null>;
  createDebt: (data: DebtInsert) => Promise<Debt>;
  updateDebt: (userId: string, id: string, data: DebtUpdate) => Promise<Debt>;
  deleteDebt: (userId: string, id: string) => Promise<void>;
  getTotalDebtBalance: (userId: string) => Promise<number>;
};

// --- Transactions (lib/api/transactions.ts) ---

export type TransactionsApi = {
  getTransactions: (userId: string, yearMonth?: string, category?: string) => Promise<Transaction[]>;
  createTransaction: (data: TransactionInsert) => Promise<Transaction>;
  updateTransaction: (userId: string, id: string, data: TransactionUpdate) => Promise<Transaction>;
  deleteTransaction: (userId: string, id: string) => Promise<void>;
};

// --- Incomes (lib/api/incomes.ts) ---

export type IncomesApi = {
  getIncomes: (userId: string, yearMonth?: string) => Promise<Income[]>;
  createIncome: (data: IncomeInsert) => Promise<Income>;
  updateIncome: (userId: string, id: string, data: IncomeUpdate) => Promise<Income>;
  deleteIncome: (userId: string, id: string) => Promise<void>;
};

// --- Monthly Analyses (lib/api/analyses.ts) ---

export type AnalysesApi = {
  getAnalysis: (userId: string, yearMonth: string) => Promise<MonthlyAnalysis | null>;
  generateAnalysis: (userId: string, yearMonth: string) => Promise<MonthlyAnalysis>;
};

// --- Upload (FastAPI backend 経由) ---

export type UploadResult = {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  file_type: "screenshot" | "csv";
  source_type: SourceType;
};

export type ExtractedItem = {
  amount: number;
  description: string;
  category: string;
  date: string;
  is_essential: boolean;
  type: "transaction" | "income";
};

export type UploadAnalysisResult = {
  upload_id: string;
  file_type: "screenshot" | "csv";
  source_type: SourceType;
  column_mapping_required: boolean;
  detected_columns: string[];
  extracted_items: ExtractedItem[];
};

// --- Dashboard (集約型。Server Component で直接 Prisma を叩く) ---

export type DashboardData = {
  yearMonth: string;
  totalDebt: number;
  monthlyIncome: number;
  monthlyExpense: number;
  debtRatio: number;
  recommendations: MonthlyAnalysis["recommendations"];
};
