"use client";

import AppHeader from "@/components/AppHeader";
import { useUser } from "@/contexts/UserContext";

import "./PublicShell.css";

type PublicShellProps = {
  children: React.ReactNode;
};

export default function PublicShell({ children }: PublicShellProps) {
  const { user, loading } = useUser();
  const authenticated = !loading && !!user;

  return (
    <div className="public-shell">
      <AppHeader authenticated={authenticated} />
      <div className="public-shell-content">{children}</div>
    </div>
  );
}
