import { Platform } from "react-native";

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;

const API_URL =
  configuredApiUrl && configuredApiUrl !== "auto"
    ? configuredApiUrl
    : Platform.select({
        android: "http://10.0.2.2:3333",
        default: "http://localhost:3333",
        web: "http://localhost:3333",
      });

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

type ErrorResponse = {
  message?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar à API. Verifique o endereço e se o servidor está ativo.",
      0
    );
  }

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ErrorResponse;
    throw new ApiError(
      error.message ?? "Não foi possível concluir a operação.",
      response.status
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
