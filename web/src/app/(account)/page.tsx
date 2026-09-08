"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";

import { FIREBASE_AUTH } from "@/app/Firebase.js";
import Loading from "@/components/Loading";
import SimpleButton from "@/components/SimpleButton";
import SimpleTextInput from "@/components/SimpleTextInput";
import { useUser } from "@/contexts/UserContext";

import "./page.css";

export default function WebApp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/account");
    }
  }, [loading, user, router]);

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  async function checkLogin() {
    setSubmitting(true);
    const auth = FIREBASE_AUTH;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/account");
    } catch {
      alert("Invalid email or password");
      setEmail("");
      setPassword("");
      setSubmitting(false);
    }
  }

  if (loading || user) {
    return <Loading />;
  }

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-grid">
          <h1 className="login-title">Welcome Back</h1>

          <SimpleTextInput
            placeholder="Email"
            onChange={handleEmailChange}
            value={email}
            id="email"
          />

          <SimpleTextInput
            placeholder="Password"
            onChange={handlePasswordChange}
            value={password}
            password
            id="password"
          />

          <SimpleButton onClick={checkLogin} disabled={submitting}>
            Login
          </SimpleButton>

          <Link href="/forgot-password" className="login-forgot-link">
            Forgot password?
          </Link>
        </div>
      </div>
    </main>
  );
}
