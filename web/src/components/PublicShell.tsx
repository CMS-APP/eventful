"use client";

import Image from "next/image";
import Link from "next/link";

import Footer from "@/components/Footer";

import "./PublicShell.css";

type PublicShellProps = {
  children: React.ReactNode;
};

export default function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="public-shell">
      <header className="public-header">
        <a
          href="https://www.eventfulapp.com"
          className="public-header-logo"
          aria-label="Eventful"
        >
          <Image
            src="/icon.png"
            alt=""
            width={36}
            height={36}
            className="public-header-logo-img"
          />
        </a>
        <Link href="/" className="public-header-account">
          Account
        </Link>
      </header>
      <div className="public-shell-content">{children}</div>
      <Footer />
    </div>
  );
}
