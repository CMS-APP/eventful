export const validateEmail = (email) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
};
