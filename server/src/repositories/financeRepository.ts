import { pool } from "../database/pool.js";

export type ExpenseRecord = {
  id: string;
  user_id: string;
  description: string;
  value: string;
  month_ref: string;
  created_at: Date;
};

export type LimitRecord = {
  id: string;
  user_id: string;
  value: string;
  month_ref: string;
  created_at: Date;
};

const expenseFields =
  "id, user_id, description, value, month_ref, created_at";
const limitFields = "id, user_id, value, month_ref, created_at";

export const financeRepository = {
  async findAllByUser(userId: string) {
    const [expensesResult, limitsResult] = await Promise.all([
      pool.query<ExpenseRecord>(
        `SELECT ${expenseFields}
         FROM expenses WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      ),
      pool.query<LimitRecord>(
        `SELECT ${limitFields}
         FROM monthly_limits WHERE user_id = $1 ORDER BY month_ref`,
        [userId]
      ),
    ]);

    return {
      expenses: expensesResult.rows,
      monthlyLimits: limitsResult.rows,
    };
  },

  async createExpense(
    userId: string,
    data: { description: string; value: number; monthRef: string }
  ) {
    const result = await pool.query<ExpenseRecord>(
      `INSERT INTO expenses (user_id, description, value, month_ref)
       VALUES ($1, $2, $3, $4)
       RETURNING ${expenseFields}`,
      [userId, data.description, data.value, data.monthRef]
    );

    return result.rows[0];
  },

  async updateExpense(
    userId: string,
    id: string,
    data: { description: string; value: number }
  ) {
    const result = await pool.query<ExpenseRecord>(
      `UPDATE expenses SET description = $1, value = $2
       WHERE id = $3 AND user_id = $4
       RETURNING ${expenseFields}`,
      [data.description, data.value, id, userId]
    );

    return result.rows[0] ?? null;
  },

  async deleteExpense(userId: string, id: string) {
    const result = await pool.query(
      "DELETE FROM expenses WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    return Boolean(result.rowCount);
  },

  async createLimit(
    userId: string,
    data: { value: number; monthRef: string }
  ) {
    const result = await pool.query<LimitRecord>(
      `INSERT INTO monthly_limits (user_id, value, month_ref)
       VALUES ($1, $2, $3)
       RETURNING ${limitFields}`,
      [userId, data.value, data.monthRef]
    );

    return result.rows[0];
  },

  async updateLimit(userId: string, id: string, value: number) {
    const result = await pool.query<LimitRecord>(
      `UPDATE monthly_limits SET value = $1
       WHERE id = $2 AND user_id = $3
       RETURNING ${limitFields}`,
      [value, id, userId]
    );

    return result.rows[0] ?? null;
  },

  async deleteLimit(userId: string, id: string) {
    const result = await pool.query(
      "DELETE FROM monthly_limits WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    return Boolean(result.rowCount);
  },
};
