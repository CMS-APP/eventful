"use client";

import { useRouter } from "next/navigation";

import AppShell from "@/components/AppShell";
import SimpleButton from "@/components/SimpleButton";

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
          <SimpleButton
            className="not-found-primary"
            onClick={() => router.push("/")}
          >
            Return home
          </SimpleButton>
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
