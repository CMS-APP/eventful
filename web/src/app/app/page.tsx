"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import Image from "next/image.js";
import React, { useEffect, useState } from "react";

import { FIREBASE_AUTH } from "@/app/Firebase.js";
import StyledBigButton from "@/components/StyledBigButton.js";
import StyledTextInput from "@/components/StyledTextInput.js";
import { isMobileDevice } from "@/functions/IsMobileDevice.js";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
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
      window.location.href = "/app/home";
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
      router.push("/app/home");
    } catch {
      alert("Invalid email or password");
      setEmail("");
      setPassword("");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--primary)]">
      {loading && <Loading />}
      <Header />
      <main
        className={`${isMobile ? "flex" : "hidden md:flex"} flex flex-row flex-grow grid grid-cols-[2fr_3fr]`}
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

            <StyledTextInput
              placeholder={"Email"}
              onChange={handleEmailChange}
              value={email}
              id="email"
            />

            <StyledTextInput
              placeholder={"Password"}
              onChange={handlePasswordChange}
              value={password}
              password
              id="password"
            />

            <StyledBigButton
              text="Login"
              color={"var(--secondary)"}
              hoverColor={"var(--secondaryTint)"}
              onClickAction={checkLogin}
            />
          </main>
        </div>
      </main>

      <Footer />
    </div>
  );
}
