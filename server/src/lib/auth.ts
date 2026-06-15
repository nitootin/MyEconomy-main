import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../config.js";

type TokenPayload = {
  sub: string;
};

export function createToken(userId: string) {
  const options: SignOptions = {
    expiresIn: config.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign({}, config.JWT_SECRET, {
    ...options,
    subject: userId,
  });
}

export function verifyToken(token: string): TokenPayload {
  const payload = jwt.verify(token, config.JWT_SECRET);

  if (typeof payload === "string" || !payload.sub) {
    throw new Error("Token inválido.");
  }

  return { sub: payload.sub };
}
