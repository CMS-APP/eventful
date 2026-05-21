"use client";

import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useState } from "react";

import { Button } from "@/components/buttons/Button";
import { TextButton } from "@/components/buttons/TextButton";
import { TextInput } from "@/components/inputs/TextInput";

import "./SignInForm.css";

type SignInFormProps = {
  searchParams?: {
    email?: string | string[];
  };
};

export function SignInForm({ searchParams }: SignInFormProps) {
  const prefetchedEmail = Array.isArray(searchParams?.email) ?
    searchParams?.email[0] || "" :
    searchParams?.email || "";

  const [email, setEmail] = useState(prefetchedEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      // Sign-in integration can be wired here next.
      console.log("Sign in requested", { email });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-in-form">
      <h1>Welcome back!</h1>
      <p>Sign in to continue.</p>

      <div className="text-input-container">
        <TextInput placeholder="Email" value={email} onChange={setEmail} />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChange={setPassword}
        />

        <Button
          text="Sign In"
          onClick={handleSignIn}
          type="primary"
          loading={loading}
        />

        {error && (
          <p className="sign-in-form-text error">
            <FontAwesomeIcon
              icon={faCircleExclamation}
              style={{ width: 20, height: 20 }}
            />
            {error}
          </p>
        )}

        <p className="sign-in-form-text">
          Don&apos;t have an account?{" "}
          <TextButton
            text="Sign up"
            onClick={() => (window.location.href = "/sign-up")}
            color="primary"
          />
        </p>
      </div>
    </div>
  );
}
