export function isRequired(value: string) {
  return value.trim().length > 0;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateBirthDate(birthDate: string) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(birthDate.trim());
}
