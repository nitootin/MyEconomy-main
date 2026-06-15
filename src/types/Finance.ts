export type Expense = {
  id: string;
  userId: string;
  description: string;
  value: number;
  monthRef: string;
  createdAt: string;
};

export type MonthlyLimit = {
  id: string;
  userId: string;
  value: number;
  monthRef: string;
  createdAt: string;
};

export type MonthlySummary = {
  monthRef: string;
  totalExpenses: number;
  limit: number | null;
  balance: number | null;
  progress: number;
  status: "without-limit" | "saved" | "over-limit";
  expensesCount: number;
};
