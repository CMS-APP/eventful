"use client";

import { applyActionCode } from "firebase/auth";
import { useSearchParams } from "next/navigation";

import { Suspense, useEffect, useState } from "react";

import { FIREBASE_AUTH } from "@/app/Firebase";

type Status = "verifying" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");

    if (!oobCode) {
      setStatus("error");
      setErrorMessage("This verification link is invalid.");
      return;
    }

    applyActionCode(FIREBASE_AUTH, oobCode)
      .then(() => setStatus("success"))
      .catch((error: unknown) => {
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "This verification link has expired or was already used."
        );
      });
  }, [searchParams]);

  return (
    <main className="flex flex-1 flex-col p-10 md:p-20">
      <div className="text-center">
        {status === "verifying" && (
          <>
            <h1 className="text-2xl font-bold text-white">Verifying…</h1>
            <p className="mt-4 text-lg text-white">
              Hang on while we verify your email address.
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
            <p className="mt-4 text-lg text-white">
              Your email has been successfully verified. You can now go back to
              the app and start using it.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-white">
              Verification Failed
            </h1>
            <p className="mt-4 text-lg text-white">{errorMessage}</p>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
