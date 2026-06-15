import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/auth.js";

export function authenticate(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({ message: "Token de autenticação ausente." });
    return;
  }

  try {
    const token = authorization.slice("Bearer ".length);
    request.userId = verifyToken(token).sub;
    next();
  } catch {
    response.status(401).json({ message: "Token inválido ou expirado." });
  }
}
