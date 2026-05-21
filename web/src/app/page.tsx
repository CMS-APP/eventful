"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import Image from "next/image.js";
import React, { useEffect, useState } from "react";

import { FIREBASE_AUTH } from "@/app/Firebase.js";
import SimpleButton from "@/components/SimpleButton";
import SimpleTextInput from "@/components/SimpleTextInput";
import { isMobileDevice } from "@/functions/IsMobileDevice.js";

import AppShell from "@/components/AppShell";
import Footer from "@/components/Footer";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import Loading from "./components/Loading";
import "./page.css";

export default function WebApp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      window.location.href = "/home";
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDevice = () => setIsMobile(isMobileDevice());

    checkDevice(); // Run once on mount
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value); // Ensure the value is a string
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value); // Ensure the value is a string
  }

  async function checkLogin() {
    setLoading(true);
    const auth = FIREBASE_AUTH;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch {
      alert("Invalid email or password");
      setEmail("");
      setPassword("");
      setLoading(false);
    }
  }

  return (
    <AppShell className="bg-[var(--primary)]">
      {loading && <Loading />}
      <main
        className={`${isMobile ? "flex" : "hidden md:flex"} flex flex-1 flex-row grid grid-cols-[2fr_3fr]`}
      >
        <div className="screenshot-container" onClick={() => {}}>
          <Image
            src="/screenshot.png"
            alt="screenshot"
            height={350}
            width={350}
            className="screenshot"
          />
        </div>

        <div className="login-container">
          <main className="login-grid">
            <h1 className="text-black">Welcome Back</h1>

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

            <SimpleButton onClick={checkLogin} disabled={loading}>
              Login
            </SimpleButton>
          </main>
        </div>
      </main>

      <Footer />
    </AppShell>
  );
}
