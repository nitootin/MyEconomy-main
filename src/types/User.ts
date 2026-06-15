export type User = {
  id: string;
  name: string;
  email: string;
  birthDate: string;
};

export type AuthResult = {
  success: boolean;
  error?: string;
};
