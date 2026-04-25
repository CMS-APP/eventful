"use client";

import HeaderButton from "@/components/HeaderButton";
import IconButton from "@/components/IconButton";
import { isMobileDevice } from "@/functions/IsMobileDevice.js";
import { useEffect, useState } from "react";

import { signOutUser } from "@/app/app/home/database/utils";
import "./WebAppHeader.css";

export default function WebAppHeader() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDevice = () => setIsMobile(isMobileDevice());

    checkDevice(); // Run once on mount
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  async function logout() {
    if (confirm("Are you sure you want to log out?")) {
      await signOutUser();
    }
  }

  return (
    <header
      className={`bg-white ${isMobile ? "shadow-md" : "md:shadow-none"} w-full sticky top-0 z-50`}
      style={{
        backgroundColor: "var(--primary)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex items-center p-4 flex-grow">
        <nav
          className={`${isMobile ? "hidden" : "flex"} flex-1 flex-row flex-grow items-center justify-end gap-5 pr-5`}
        >
          <IconButton />
          <div style={{ display: "flex", flex: 1 }} />
          <HeaderButton text={"Account"} pathName={"/app/home"} />
          <HeaderButton text={"Log Out"} onClickAction={logout} bold />
        </nav>
      </div>
    </header>
  );
}
