"use client";

import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";

import { FIREBASE_AUTH } from "@/app/Firebase.js";
import AuthShell from "@/components/AuthShell";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import TextInput from "@/components/TextInput";
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
    <AuthShell
      eyebrow="The Ultimate Event Planner"
      title={
        <>
          Plan with Ease,
          <br />
          Connect with Joy.
        </>
      }
      description="Eventful lives in the app - get the full experience, from invites to the photo booth, on your phone."
      showDownloadLinks
    >
      <h2 className="auth-form-title">Welcome Back</h2>
      <p className="auth-form-subtitle">Sign in to access your account</p>

      <div className="auth-form-fields">
        <TextInput
          label="Email"
          placeholder="Email"
          onChange={handleEmailChange}
          value={email}
          id="email"
        />

        <TextInput
          label="Password"
          placeholder="Password"
          onChange={handlePasswordChange}
          value={password}
          password
          id="password"
        />
      </div>

      <Link href="/forgot-password" className="login-forgot-link">
        Forgot Password?
      </Link>

      <Button
        onClick={checkLogin}
        loading={submitting}
        variant="primary"
        icon={faRightToBracket}
      >
        Sign In
      </Button>
    </AuthShell>
  );
}
