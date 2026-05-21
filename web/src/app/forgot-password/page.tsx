"use client";

import AppShell from "@/components/AppShell";
import Footer from "@/components/Footer";
import SimpleButton from "@/components/SimpleButton";
import SimpleTextInput from "@/components/SimpleTextInput";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

// Add type declaration for grecaptcha
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
        type: "error",
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          recaptchaToken,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setMessage({
        text: "If your email is registered, you will receive a password reset link.",
        type: "success",
      });

      // Reset the form
      setEmail("");
      setRecaptchaToken("");

      // Reset reCAPTCHA
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
          type: "error",
        });
      } else {
        setMessage({
          text: "An error occurred. Please try again later.",
          type: "error",
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
    <AppShell>
      <main className="flex-1 flex items-center justify-center p-4 bg-[var(--primary)]">
        <div className="w-full max-w-md bg-white rounded-[25px] shadow-md p-8 h-auto">
          <h1 className="text-center mb-6 text-black">Reset Your Password</h1>

          <p className="text-gray-600 mb-6 text-center">
            Enter your email address and we will send you a link to reset your
            password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <SimpleTextInput
              id="email"
              placeholder="Email Address"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />

            <div className="flex justify-center mb-4">
              <ReCAPTCHA
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
                size="normal"
              />
            </div>

            {message.text && (
              <div
                className={`p-3 rounded-md text-center ${
                  message.type === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <SimpleButton type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </SimpleButton>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-center text-gray-600 hover:text-gray-800"
              >
                Back to Account
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </AppShell>
  );
}
