"use client";

import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import "@/components/EmptyState.css";

import "./not-found.css";

export default function NotFound() {
  const router = useRouter();

  return (
    <AppShell>
      <main className="empty-state">
        <p className="empty-state-eyebrow">Error 404</p>
        <h1 className="not-found-numeral">404</h1>
        <h2 className="empty-state-title">Page not found</h2>
        <p className="empty-state-text">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>
        <div className="empty-state-actions">
          <Button
            className="empty-state-primary"
            onClick={() => router.push("/")}
          >
            Return home
          </Button>
          <button
            type="button"
            className="empty-state-secondary"
            onClick={() => router.back()}
          >
            Go back
          </button>
        </div>
      </main>
    </AppShell>
  );
}
