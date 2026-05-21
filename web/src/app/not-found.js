"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons/faExclamationTriangle";

import AppShell from "@/components/AppShell";
import Footer from "@/components/Footer";
import StyledButton from "@/components/StyledButton";

export default function Custom404() {
  return (
    <AppShell className="bg-[var(--primary)]">
      <main className="flex flex-1 flex-col p-10 md:p-20 text-white items-center gap-5">
        <div
          className="flex flex-row justify-center items-center gap-5"
        >
          <div className="spacer" />
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            width={75}
            height={75}
            className="text-white text-[75px]"
          />
          <h1>Error 404</h1>
          <div className="spacer" />
        </div>
        <h3 className="text-center">Whoops! The page you are looking for doesn&apos;t exist.</h3>

        <StyledButton
          color="var(--secondary)"
          hoverColor="var(--secondaryTint)"
          text="Go to Account"
          onClickAction={() => (window.location = "/")}
        />
      </main>

      <Footer />
    </AppShell>
  );
}
