"use client";

import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

import React, { useState } from "react";

import Loading from "@/components/Loading";
import SimpleButton from "@/components/SimpleButton";
import SimpleTextInput from "@/components/SimpleTextInput";

import "./page.css";

declare global {
  interface Window {
    grecaptcha: {
      reset: () => void;
    };
  }
}

const RECAPTCHA_SITE_KEY = "6LfDpgQrAAAAAO0TSbcQban4TrA16CjelRzF_Urp";
const FORGOT_PASSWORD_URL = "https://forgotpassword-iuxeocrkta-uc.a.run.app";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recaptchaToken) {
      setMessage({
        text: "Please complete the reCAPTCHA verification",
        type: "error"
      });
      return;
    }

    if (!email) {
      setMessage({ text: "Please enter your email address", type: "error" });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch(FORGOT_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          recaptchaToken
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setMessage({
        text: "If your email is registered, you will receive a password reset link.",
        type: "success"
      });

      setEmail("");
      setRecaptchaToken("");

      if (window.grecaptcha) {
        window.grecaptcha.reset();
      }
    } catch (error: unknown) {
      console.error("Error sending password reset email:", error);

      if (
        error instanceof Error &&
        error.message &&
        error.message.includes("Too many requests")
      ) {
        setMessage({
          text: error.message,
          type: "error"
        });
      } else {
        setMessage({
          text: "An error occurred. Please try again later.",
          type: "error"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecaptchaChange = (token: string | null) => {
    if (token) {
      setRecaptchaToken(token);
    }
  };

  return (
    <>
      {isLoading && <Loading message="Sending..." />}
      <main className="forgot-password-page">
        <div className="forgot-password-card">
          <h1 className="forgot-password-title">Reset Your Password</h1>

          <p className="forgot-password-description">
            Enter your email address and we will send you a link to reset your
            password.
          </p>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <SimpleTextInput
              id="email"
              placeholder="Email Address"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />

            <div className="forgot-password-recaptcha">
              <ReCAPTCHA
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
                size="normal"
              />
            </div>

            {message.text && (
              <div
                className={`forgot-password-message ${
                  message.type === "error"
                    ? "forgot-password-message--error"
                    : "forgot-password-message--success"
                }`}
              >
                {message.text}
              </div>
            )}

            <SimpleButton type="submit" disabled={isLoading}>
              Send Reset Link
            </SimpleButton>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="forgot-password-back"
            >
              Back to Login
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
