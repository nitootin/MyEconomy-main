import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import {
  financeRepository,
  type ExpenseRecord,
  type LimitRecord,
} from "../repositories/financeRepository.js";

const monthRefSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mês de referência inválido.");

const expenseSchema = z.object({
  description: z.string().trim().min(1, "Informe a descrição.").max(255),
  value: z.number().positive("Informe um valor maior que zero."),
  monthRef: monthRefSchema,
});

const expenseUpdateSchema = expenseSchema.pick({
  description: true,
  value: true,
});

const limitSchema = z.object({
  value: z.number().positive("Informe um valor maior que zero."),
  monthRef: monthRefSchema,
});

const limitUpdateSchema = limitSchema.pick({ value: true });

function serializeExpense(expense: ExpenseRecord) {
  return {
    id: expense.id,
    userId: expense.user_id,
    description: expense.description,
    value: Number(expense.value),
    monthRef: expense.month_ref.trim(),
    createdAt: expense.created_at.toISOString(),
  };
}

function serializeLimit(limit: LimitRecord) {
  return {
    id: limit.id,
    userId: limit.user_id,
    value: Number(limit.value),
    monthRef: limit.month_ref.trim(),
    createdAt: limit.created_at.toISOString(),
  };
}

export const financeRoutes = Router();
financeRoutes.use(authenticate);

financeRoutes.get("/", async (request, response) => {
  const result = await financeRepository.findAllByUser(request.userId!);

  response.json({
    expenses: result.expenses.map(serializeExpense),
    monthlyLimits: result.monthlyLimits.map(serializeLimit),
  });
});

financeRoutes.post("/expenses", async (request, response) => {
  const data = expenseSchema.parse(request.body);
  const expense = await financeRepository.createExpense(request.userId!, data);

  response.status(201).json({ expense: serializeExpense(expense) });
});

financeRoutes.put("/expenses/:id", async (request, response) => {
  const data = expenseUpdateSchema.parse(request.body);
  const expense = await financeRepository.updateExpense(
    request.userId!,
    request.params.id,
    data
  );

  if (!expense) {
    response.status(404).json({ message: "Despesa não encontrada." });
    return;
  }

  response.json({ expense: serializeExpense(expense) });
});

financeRoutes.delete("/expenses/:id", async (request, response) => {
  const deleted = await financeRepository.deleteExpense(
    request.userId!,
    request.params.id
  );

  if (!deleted) {
    response.status(404).json({ message: "Despesa não encontrada." });
    return;
  }

  response.status(204).send();
});

financeRoutes.post("/limits", async (request, response) => {
  const data = limitSchema.parse(request.body);

  try {
    const monthlyLimit = await financeRepository.createLimit(
      request.userId!,
      data
    );
    response.status(201).json({
      monthlyLimit: serializeLimit(monthlyLimit),
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      response.status(409).json({ message: "Já existe um limite para este mês." });
      return;
    }

    throw error;
  }
});

financeRoutes.put("/limits/:id", async (request, response) => {
  const data = limitUpdateSchema.parse(request.body);
  const monthlyLimit = await financeRepository.updateLimit(
    request.userId!,
    request.params.id,
    data.value
  );

  if (!monthlyLimit) {
    response.status(404).json({ message: "Limite não encontrado." });
    return;
  }

  response.json({ monthlyLimit: serializeLimit(monthlyLimit) });
});

financeRoutes.delete("/limits/:id", async (request, response) => {
  const deleted = await financeRepository.deleteLimit(
    request.userId!,
    request.params.id
  );

  if (!deleted) {
    response.status(404).json({ message: "Limite não encontrado." });
    return;
  }

  response.status(204).send();
});
