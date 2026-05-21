"use client";

import Footer from "@/components/Footer";
import StyledBigButton from "@/components/StyledBigButton";
import AppShell from "@/components/AppShell";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface UnauthorizedAccessProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export default function UnauthorizedAccess({
  title = "Access Denied",
  message = "You don't have permission to access this page.",
  showBackButton = true,
}: UnauthorizedAccessProps) {
  return (
    <AppShell authenticated className="bg-[var(--primary)]">
      <main className="flex flex-1 flex-col p-10 md:p-20 text-white items-center justify-center gap-5">
        <div className="flex flex-row justify-center items-center gap-5">
          <FontAwesomeIcon
            icon={faLock}
            width={75}
            height={75}
            className="text-white text-[75px]"
          />
          <h1>{title}</h1>
        </div>
        <h3 className="text-center max-w-2xl">{message}</h3>

        {showBackButton && (
          <StyledBigButton
            text="Go Back To Home"
            color="var(--secondary)"
            hoverColor="var(--secondaryTint)"
            onClickAction={() => (window.location.href = "/home")}
          />
        )}
      </main>
      <Footer />
    </AppShell>
  );
}
