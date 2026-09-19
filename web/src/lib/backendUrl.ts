export const BACKEND_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5050"
    : "https://api.eventfulapp.com";
