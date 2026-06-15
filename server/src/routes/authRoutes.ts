import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { createToken } from "../lib/auth.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  userRepository,
  type UserRecord,
} from "../repositories/userRepository.js";

const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome.").max(120),
    email: z
      .string()
      .email("Informe um e-mail válido.")
      .transform((email) => email.trim().toLowerCase()),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string(),
    birthDate: z
      .string()
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use o formato DD/MM/AAAA."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

const signinSchema = z.object({
  email: z
    .string()
    .email("Informe um e-mail válido.")
    .transform((email) => email.trim().toLowerCase()),
  password: z.string().min(1, "Informe a senha."),
});

function serializeUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    birthDate: user.birth_date,
  };
}

export const authRoutes = Router();

authRoutes.post("/signup", async (request, response) => {
  const data = signupSchema.parse(request.body);

  if (await userRepository.findByEmail(data.email)) {
    response.status(409).json({ message: "Este e-mail já está cadastrado." });
    return;
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  try {
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      birthDate: data.birthDate,
    });

    response.status(201).json({ user: serializeUser(user) });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      response.status(409).json({ message: "Este e-mail já está cadastrado." });
      return;
    }

    throw error;
  }
});

authRoutes.post("/signin", async (request, response) => {
  const data = signinSchema.parse(request.body);
  const user = await userRepository.findByEmail(data.email);

  if (
    !user?.password_hash ||
    !(await bcrypt.compare(data.password, user.password_hash))
  ) {
    response.status(401).json({ message: "E-mail ou senha inválidos." });
    return;
  }

  response.json({
    token: createToken(user.id),
    user: serializeUser(user),
  });
});

authRoutes.get("/me", authenticate, async (request, response) => {
  const user = await userRepository.findById(request.userId!);

  if (!user) {
    response.status(404).json({ message: "Usuário não encontrado." });
    return;
  }

  response.json({ user: serializeUser(user) });
});
