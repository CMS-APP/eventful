"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { isMobileDevice } from "@/functions/IsMobileDevice.js";
import { useEffect, useState } from "react";
import ContactButtons from "./ContactButtons";
import ContactForm from "./ContactForm";

export default function About() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDevice = () => setIsMobile(isMobileDevice());

    checkDevice(); // Run once on mount
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[--primary]">
      <Header />
      <main
        className={`flex flex-grow flex-col ${isMobile ? "flex-col" : "md:flex-row"} gap-10 p-10`}
      >
        <div className="flex flex-col flex-2 gap-5" style={{ flex: 1 }}>
          <h1 style={{ textAlign: "center" }}>Contact Us</h1>
          <h2 className="text-[var(--secondary)] uppercase text-center">
            We Would Love to Hear From You
          </h2>

          <ContactForm />
        </div>

        <ContactButtons />
      </main>
      <Footer />
    </div>
  );
}
