import { create } from "zustand";
import { apiRequest, ApiError } from "../services/api";
import { Expense, MonthlyLimit, MonthlySummary } from "../types/Finance";
import { useAuthStore } from "./authStore";

type OperationResult = {
  success: boolean;
  error?: string;
};

type FinanceResponse = {
  expenses: Expense[];
  monthlyLimits: MonthlyLimit[];
};

type ExpenseResponse = {
  expense: Expense;
};

type LimitResponse = {
  monthlyLimit: MonthlyLimit;
};

type FinanceState = {
  expenses: Expense[];
  monthlyLimits: MonthlyLimit[];
  isLoading: boolean;
  loadFinanceData: () => Promise<OperationResult>;
  clear: () => void;
  getMonthlySummary: (userId: string, monthRef: string) => MonthlySummary;
  addExpense: (
    data: Pick<Expense, "description" | "value" | "monthRef">
  ) => Promise<OperationResult>;
  updateExpense: (
    id: string,
    data: Pick<Expense, "description" | "value">
  ) => Promise<OperationResult>;
  deleteExpense: (id: string) => Promise<OperationResult>;
  addMonthlyLimit: (
    data: Pick<MonthlyLimit, "value" | "monthRef">
  ) => Promise<OperationResult>;
  updateMonthlyLimit: (id: string, value: number) => Promise<OperationResult>;
  deleteMonthlyLimit: (id: string) => Promise<OperationResult>;
};

function getToken() {
  return useAuthStore.getState().token;
}

function errorResult(error: unknown): OperationResult {
  return {
    success: false,
    error:
      error instanceof ApiError
        ? error.message
        : "Não foi possível concluir a operação.",
  };
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  expenses: [],
  monthlyLimits: [],
  isLoading: false,

  loadFinanceData: async () => {
    const token = getToken();

    if (!token) {
      set({ expenses: [], monthlyLimits: [] });
      return { success: false, error: "Sessão inválida." };
    }

    set({ isLoading: true });

    try {
      const result = await apiRequest<FinanceResponse>("/finance", { token });
      set({
        expenses: result.expenses,
        monthlyLimits: result.monthlyLimits,
      });
      return { success: true };
    } catch (error) {
      return errorResult(error);
    } finally {
      set({ isLoading: false });
    }
  },

  clear: () => set({ expenses: [], monthlyLimits: [] }),

  getMonthlySummary: (userId, monthRef) => {
    const expenses = get().expenses.filter(
      (expense) => expense.userId === userId && expense.monthRef === monthRef
    );
    const monthlyLimit = get().monthlyLimits.find(
      (limit) => limit.userId === userId && limit.monthRef === monthRef
    );
    const totalExpenses = expenses.reduce(
      (total, expense) => total + expense.value,
      0
    );
    const limit = monthlyLimit?.value ?? null;
    const balance = limit === null ? null : limit - totalExpenses;
    const progress =
      limit && limit > 0
        ? Math.min(totalExpenses / limit, 1)
        : totalExpenses > 0
          ? 1
          : 0;

    return {
      monthRef,
      totalExpenses,
      limit,
      balance,
      progress,
      status:
        limit === null
          ? "without-limit"
          : totalExpenses > limit
            ? "over-limit"
            : "saved",
      expensesCount: expenses.length,
    };
  },

  addExpense: async (data) => {
    try {
      const result = await apiRequest<ExpenseResponse>("/finance/expenses", {
        method: "POST",
        token: getToken(),
        body: data,
      });
      set((state) => ({ expenses: [result.expense, ...state.expenses] }));
      return { success: true };
    } catch (error) {
      return errorResult(error);
    }
  },

  updateExpense: async (id, data) => {
    try {
      const result = await apiRequest<ExpenseResponse>(
        `/finance/expenses/${id}`,
        {
          method: "PUT",
          token: getToken(),
          body: data,
        }
      );
      set((state) => ({
        expenses: state.expenses.map((expense) =>
          expense.id === id ? result.expense : expense
        ),
      }));
      return { success: true };
    } catch (error) {
      return errorResult(error);
    }
  },

  deleteExpense: async (id) => {
    try {
      await apiRequest<void>(`/finance/expenses/${id}`, {
        method: "DELETE",
        token: getToken(),
      });
      set((state) => ({
        expenses: state.expenses.filter((expense) => expense.id !== id),
      }));
      return { success: true };
    } catch (error) {
      return errorResult(error);
    }
  },

  addMonthlyLimit: async (data) => {
    try {
      const result = await apiRequest<LimitResponse>("/finance/limits", {
        method: "POST",
        token: getToken(),
        body: data,
      });
      set((state) => ({
        monthlyLimits: [...state.monthlyLimits, result.monthlyLimit],
      }));
      return { success: true };
    } catch (error) {
      return errorResult(error);
    }
  },

  updateMonthlyLimit: async (id, value) => {
    try {
      const result = await apiRequest<LimitResponse>(`/finance/limits/${id}`, {
        method: "PUT",
        token: getToken(),
        body: { value },
      });
      set((state) => ({
        monthlyLimits: state.monthlyLimits.map((limit) =>
          limit.id === id ? result.monthlyLimit : limit
        ),
      }));
      return { success: true };
    } catch (error) {
      return errorResult(error);
    }
  },

  deleteMonthlyLimit: async (id) => {
    try {
      await apiRequest<void>(`/finance/limits/${id}`, {
        method: "DELETE",
        token: getToken(),
      });
      set((state) => ({
        monthlyLimits: state.monthlyLimits.filter((limit) => limit.id !== id),
      }));
      return { success: true };
    } catch (error) {
      return errorResult(error);
    }
  },
}));
