"use client";

import { useUser } from "@/contexts/UserContext";

import AppHeader from "./AppHeader";
import "./AppHeader.css";

type AppShellProps = {
  children: React.ReactNode;
  className?: string;
};

export default function AppShell({ children, className = "" }: AppShellProps) {
  const { user, loading } = useUser();
  const authenticated = !loading && !!user;

  return (
    <div className={`app-shell ${className}`.trim()}>
      <AppHeader authenticated={authenticated} />
      <div className="app-shell-content">{children}</div>
    </div>
  );
}
