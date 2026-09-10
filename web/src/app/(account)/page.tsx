"use client";

import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";

import { FIREBASE_AUTH } from "@/services/firebase/firebase";
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
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [appleSubmitting, setAppleSubmitting] = useState(false);
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

  async function signInWithGoogle() {
    setGoogleSubmitting(true);
    try {
      await signInWithPopup(FIREBASE_AUTH, new GoogleAuthProvider());
      router.push("/account");
    } catch {
      alert("Unable to sign in with Google");
      setGoogleSubmitting(false);
    }
  }

  async function signInWithApple() {
    setAppleSubmitting(true);
    try {
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");
      await signInWithPopup(FIREBASE_AUTH, provider);
      router.push("/account");
    } catch {
      alert("Unable to sign in with Apple");
      setAppleSubmitting(false);
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

      <div className="auth-divider">
        <span>Or continue with</span>
      </div>

      <div className="oauth-buttons">
        <Button
          variant="outline"
          onClick={signInWithApple}
          loading={appleSubmitting}
        >
          <span className="oauth-button-content">
            <svg className="oauth-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M16.365 1.43c0 1.14-.417 2.203-1.244 3.15-.995 1.144-2.197 1.804-3.499 1.697-.036-1.1.433-2.264 1.269-3.158.436-.467 1.02-.858 1.633-1.115.617-.256 1.184-.401 1.687-.415.043.246.107.554.154.841zM20.895 17.55c-.354.816-.775 1.606-1.297 2.33-.719 1.005-1.309 1.7-1.767 2.083-.708.633-1.466.958-2.278.976-.583.014-1.286-.166-2.11-.532-.827-.365-1.588-.548-2.284-.548-.73 0-1.514.183-2.353.548-.84.366-1.518.556-2.037.573-.777.033-1.552-.301-2.33-1.005-.5-.422-1.122-1.147-1.868-2.176-.802-1.099-1.464-2.373-1.985-3.822C.256 14.71 0 13.288 0 11.913c0-1.585.343-2.951 1.03-4.096.545-.918 1.264-1.646 2.166-2.183.9-.537 1.875-.813 2.917-.83.617 0 1.43.19 2.44.567.99.376 1.628.567 1.913.567.213 0 .887-.224 2.021-.67 1.077-.418 1.986-.59 2.732-.518 2.017.162 3.534.958 4.545 2.39-1.804 1.093-2.697 2.622-2.68 4.587.017 1.529.559 2.804 1.628 3.817.487.462 1.03.82 1.635 1.073-.13.379-.27.75-.42 1.114z"
              />
            </svg>
            Apple
          </span>
        </Button>

        <Button
          variant="outline"
          onClick={signInWithGoogle}
          loading={googleSubmitting}
        >
          <span className="oauth-button-content">
            <svg className="oauth-icon" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
              />
              <path
                fill="#34A853"
                d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7A22 22 0 0 0 24 46z"
              />
              <path
                fill="#FBBC05"
                d="M11.69 28.18A13.2 13.2 0 0 1 11 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A22 22 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88z"
              />
              <path
                fill="#EA4335"
                d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2a22 22 0 0 0-19.66 12.12l7.35 5.7C13.42 14.62 18.27 10.75 24 10.75z"
              />
            </svg>
            Google
          </span>
        </Button>
      </div>
    </AuthShell>
  );
}
