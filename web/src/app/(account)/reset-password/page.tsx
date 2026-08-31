"use client";

import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { useSearchParams } from "next/navigation";

import { Suspense, useEffect, useState } from "react";

import { FIREBASE_AUTH } from "@/app/Firebase";
import Loading from "@/components/Loading";
import SimpleButton from "@/components/SimpleButton";
import SimpleTextInput from "@/components/SimpleTextInput";

import "./page.css";

type CodeStatus = "checking" | "valid" | "invalid";

const PASSWORD_RULES_MESSAGE =
  "Password must be at least 8 characters and contain one number, letter, and special character.";

function passwordValid(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_-])[A-Za-z\d!@#$%^&*(),.?":{}|<>_-]{8,}$/.test(
    password
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [codeStatus, setCodeStatus] = useState<CodeStatus>("checking");
  const [codeError, setCodeError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (!oobCode) {
      setCodeStatus("invalid");
      setCodeError("This password reset link is invalid.");
      return;
    }

    verifyPasswordResetCode(FIREBASE_AUTH, oobCode)
      .then(() => setCodeStatus("valid"))
      .catch((error: unknown) => {
        setCodeStatus("invalid");
        setCodeError(
          error instanceof Error
            ? error.message
            : "This password reset link has expired or was already used."
        );
      });
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oobCode) return;

    if (!passwordValid(password)) {
      setMessage({
        text: PASSWORD_RULES_MESSAGE,
        type: "error"
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      await confirmPasswordReset(FIREBASE_AUTH, oobCode, password);
      setResetComplete(true);
    } catch (error: unknown) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Could not reset your password. Please request a new link.",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (codeStatus === "checking") {
    return (
      <main className="reset-password-page">
        <p className="text-white">Checking your reset link…</p>
      </main>
    );
  }

  if (codeStatus === "invalid") {
    return (
      <main className="reset-password-page">
        <div className="reset-password-card">
          <h1 className="reset-password-title">Link Expired</h1>
          <p className="reset-password-description">{codeError}</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {isSubmitting && <Loading message="Updating password..." />}
      <main className="reset-password-page">
        <div className="reset-password-card">
          {resetComplete ? (
            <>
              <h1 className="reset-password-title">Password Updated</h1>
              <p className="reset-password-description">
                Your password has been changed. You can now sign in to Eventful
                with your new password.
              </p>
            </>
          ) : (
            <>
              <h1 className="reset-password-title">Reset Your Password</h1>
              <p className="reset-password-description">
                Choose a new password for your account.
              </p>

              <form onSubmit={handleSubmit} className="reset-password-form">
                <SimpleTextInput
                  id="password"
                  placeholder="New password"
                  password
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <SimpleTextInput
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  password
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {message.text && (
                  <div
                    className={`reset-password-message ${
                      message.type === "error"
                        ? "reset-password-message--error"
                        : "reset-password-message--success"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <SimpleButton type="submit" disabled={isSubmitting}>
                  Set New Password
                </SimpleButton>
              </form>
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
