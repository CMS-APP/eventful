"use client";

import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";

import React, { useState } from "react";

import AuthShell from "@/components/AuthShell";
import Button from "@/components/Button";
import TextInput from "@/components/TextInput";

declare global {
  interface Window {
    grecaptcha: {
      reset: () => void;
    };
  }
}

const RECAPTCHA_SITE_KEY = "6LfDpgQrAAAAAO0TSbcQban4TrA16CjelRzF_Urp";
const FORGOT_PASSWORD_URL = "https://api.eventfulapp.com/forgotPassword";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [recaptchaToken, setRecaptchaToken] = useState("");

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
    <AuthShell
      eyebrow="Account Recovery"
      title={
        <>
          Back to the party
          <br />
          in a minute.
        </>
      }
      description="Your events, guests and galleries are all still here."
    >
      <h2 className="auth-form-title">Forgot password</h2>
      <p className="auth-form-subtitle">
        Enter your email address and we will send you a link to reset your
        password.
      </p>

      <form onSubmit={handleSubmit} className="auth-form-fields">
        <TextInput
          label="Email"
          id="email"
          placeholder="Email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
        />

        <ReCAPTCHA
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={handleRecaptchaChange}
          size="normal"
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
          loading={isLoading}
          variant="primary"
          icon={faPaperPlane}
        >
          Send Reset Link
        </Button>
      </form>

      <p className="auth-form-footer">
        Remembered it?{" "}
        <Link href="/" className="auth-form-footer-link">
          Back To Login
        </Link>
      </p>
    </AuthShell>
  );
}
