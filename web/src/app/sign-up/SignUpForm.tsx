"use client";

import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useState } from "react";

import { Button } from "@/components/buttons/Button";
import { TextButton } from "@/components/buttons/TextButton";
import { TextInput } from "@/components/inputs/TextInput";

import "./SignUpForm.css";
import { signUp } from "./api";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    try {
      setError("");
      setLoading(true);

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      await signUp(email, password);
      window.alert("Verify your email to continue.");
      window.location.href = `/sign-in?email=${encodeURIComponent(email)}`;
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-up-form">
      <h1>Welcome to Eventful! </h1>
      <p>Sign up to get started.</p>

      <div className="text-input-container">
        <TextInput placeholder="Email" value={email} onChange={setEmail} />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChange={setPassword}
        />
        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        <Button
          text="Sign Up"
          onClick={handleSignUp}
          type="primary"
          loading={loading}
        />

        {error && (
          <p className="sign-up-form-text error">
            <FontAwesomeIcon
              icon={faCircleExclamation}
              style={{ width: 20, height: 20 }}
            />
            {error}
          </p>
        )}
        <p className="sign-up-form-text">
          Already have an account?{" "}
          <TextButton
            text="Sign in"
            onClick={() => (window.location.href = "/sign-in")}
            color="primary"
          />
        </p>
      </div>
    </div>
  );
}
