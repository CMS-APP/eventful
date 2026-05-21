"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons/faExclamationTriangle";

import AppShell from "@/components/AppShell";
import SimpleButton from "@/components/SimpleButton";

export default function NotFound() {
  return (
    <AppShell>
      <main className="flex flex-1 flex-col items-center gap-5 p-10 text-white md:p-20">
        <div className="flex flex-row items-center justify-center gap-5">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-[75px] text-white"
          />
          <h1>Error 404</h1>
        </div>
        <h3 className="text-center">
          Whoops! The page you are looking for doesn&apos;t exist.
        </h3>
        <SimpleButton onClick={() => (window.location.href = "/")}>
          Go to Login
        </SimpleButton>
      </main>
    </AppShell>
  );
}
