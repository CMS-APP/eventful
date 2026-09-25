export interface AuthFormMessageState {
  text: string;
  type: "error" | "success" | "";
}

type AuthFormMessageProps = AuthFormMessageState;

export function AuthFormMessage({ text, type }: AuthFormMessageProps) {
  if (!text) return null;

  return (
    <div
      className={`auth-form-message ${
        type === "error"
          ? "auth-form-message--error"
          : "auth-form-message--success"
      }`}
    >
      {text}
    </div>
  );
}
