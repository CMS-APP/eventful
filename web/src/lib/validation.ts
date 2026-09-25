export const PASSWORD_RULES_MESSAGE =
  "Password must be at least 8 characters and contain one number, letter, and special character.";

export function passwordValid(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_-])[A-Za-z\d!@#$%^&*(),.?":{}|<>_-]{8,}$/.test(
    password
  );
}
