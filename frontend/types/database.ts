// Database types based on docs/database-schema.md
// TODO: supabase gen types typescript で自動生成した型に置き換える

// --- Enums ---

export type DebtType =
  | "card_loan"
  | "mortgage"
  | "student_loan"
  | "credit_card"
  | "other";

export type SourceType = "bank" | "credit_card" | "salary" | "other";

export type ScreenshotStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type TransactionCategory =
  | "food"
  | "subscription"
  | "entertainment"
  | "transport"
  | "utility"
  | "other";

export type IncomeType = "salary" | "side_job" | "other";

export type RecommendationPriority = "high" | "medium" | "low";

// --- Row types ---

export type Profile = {
  id: string;
  name: string | null;
  created_at: string;
  updated_at: string;
};

export type Debt = {
  id: string;
  user_id: string;
  name: string;
  lender: string | null;
  current_balance: number;
  interest_rate: number | null;
  monthly_payment: number | null;
  due_day: number | null;
  debt_type: DebtType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Screenshot = {
  id: string;
  user_id: string;
  storage_path: string;
  source_type: SourceType;
  status: ScreenshotStatus;
  processed_at: string | null;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  screenshot_id: string | null;
  amount: number;
  description: string | null;
  category: TransactionCategory | null;
  transaction_date: string;
  is_essential: boolean | null;
  created_at: string;
};

export type Income = {
  id: string;
  user_id: string;
  screenshot_id: string | null;
  amount: number;
  income_type: IncomeType;
  income_date: string;
  description: string | null;
  created_at: string;
};

export type Recommendation = {
  category: string;
  description: string;
  saving_amount: number;
  priority: RecommendationPriority;
};

export type MonthlyAnalysis = {
  id: string;
  user_id: string;
  year_month: string;
  total_income: number | null;
  total_expenses: number | null;
  total_debt: number | null;
  debt_ratio: number | null;
  unnecessary_total: number | null;
  potential_savings: number | null;
  recommendations: Recommendation[] | null;
  created_at: string;
};

// --- Insert types (id, created_at, updated_at は DB 側で自動生成) ---

export type DebtInsert = Omit<Debt, "id" | "created_at" | "updated_at">;

export type TransactionInsert = Omit<Transaction, "id" | "created_at">;

export type IncomeInsert = Omit<Income, "id" | "created_at">;

export type ScreenshotInsert = Omit<
  Screenshot,
  "id" | "created_at" | "processed_at"
>;

// --- Update types (部分更新用) ---

export type DebtUpdate = Partial<
  Omit<Debt, "id" | "user_id" | "created_at" | "updated_at">
>;

export type TransactionUpdate = Partial<
  Omit<Transaction, "id" | "user_id" | "created_at">
>;

export type IncomeUpdate = Partial<
  Omit<Income, "id" | "user_id" | "created_at">
>;
