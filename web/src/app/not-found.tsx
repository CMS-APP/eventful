"use client";

import { useRouter } from "next/navigation";

import AppShell from "@/components/AppShell";
import Button from "@/components/Button";

import "./not-found.css";

export default function NotFound() {
  const router = useRouter();

  return (
    <AppShell>
      <main className="not-found">
        <p className="not-found-eyebrow">Error 404</p>
        <h1 className="not-found-numeral">404</h1>
        <h2 className="not-found-title">Page not found</h2>
        <p className="not-found-text">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>
        <div className="not-found-actions">
          <Button
            className="not-found-primary"
            onClick={() => router.push("/")}
          >
            Return home
          </Button>
          <button
            type="button"
            className="not-found-secondary"
            onClick={() => router.back()}
          >
            Go back
          </button>
        </div>
      </main>
    </AppShell>
  );
}
