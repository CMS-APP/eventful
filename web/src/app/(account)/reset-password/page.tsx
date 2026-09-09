"use client";

import { faLock } from "@fortawesome/free-solid-svg-icons";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Suspense, useEffect, useState } from "react";

import { FIREBASE_AUTH } from "@/services/firebase/firebase";
import AuthShell from "@/components/AuthShell";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import TextInput from "@/components/TextInput";

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
    return <Loading message="Checking your reset link…" />;
  }

  if (codeStatus === "invalid") {
    return (
      <AuthShell
        eyebrow="Account Security"
        title={
          <>
            Link Expired,
            <br />
            Let&apos;s Try Again.
          </>
        }
        description="Password reset links only work once and expire after a while, for your security."
      >
        <h2 className="auth-form-title">Link expired</h2>
        <p className="auth-form-subtitle">{codeError}</p>

        <p className="auth-form-footer">
          <Link href="/forgot-password" className="auth-form-footer-link">
            Request a new link
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Account Security"
      title={
        <>
          Fresh Start,
          <br />
          Same Great Party.
        </>
      }
      description="Choose a new password to get back into your account on all your devices."
    >
      {resetComplete ? (
        <>
          <h2 className="auth-form-title">Password updated</h2>
          <p className="auth-form-subtitle">
            You can now sign in with your new password.
          </p>

          <p className="auth-form-footer">
            <Link href="/" className="auth-form-footer-link">
              Back To Login
            </Link>
          </p>
        </>
      ) : (
        <>
          <h2 className="auth-form-title">Reset password</h2>
          <p className="auth-form-subtitle">
            Choose a new password for your account
          </p>

          <form onSubmit={handleSubmit} className="auth-form-fields">
            <TextInput
              id="password"
              label="New Password"
              placeholder="New password"
              password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <TextInput
              id="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm new password"
              password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {message.text && (
              <div
                className={`auth-form-message ${
                  message.type === "error"
                    ? "auth-form-message--error"
                    : "auth-form-message--success"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              loading={isSubmitting}
              variant="primary"
              icon={faLock}
            >
              Set New Password
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
