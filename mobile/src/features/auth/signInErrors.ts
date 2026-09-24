export interface SignInErrorDetail {
  field: "email" | "password";
  message: string;
}

export const SIGN_IN_ERROR_DETAILS: Record<string, SignInErrorDetail> = {
  "auth/user-not-found": {
    field: "email",
    message: "No account found with this email"
  },
  "auth/wrong-password": {
    field: "password",
    message: "Wrong password"
  },
  "auth/too-many-requests": {
    field: "password",
    message: "Too many requests"
  },
  "auth/invalid-email": { field: "email", message: "Invalid email" },
  "auth/user-disabled": { field: "email", message: "User disabled" },
  "auth/network-request-failed": {
    field: "password",
    message: "Network request failed"
  },
  "auth/invalid-credential": {
    field: "password",
    message: "Invalid credentials"
  }
};
