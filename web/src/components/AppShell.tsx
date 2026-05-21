"use client";

import { useUser } from "@/contexts/UserContext";

import Sidebar from "./Sidebar";
import "./Sidebar.css";

type AppShellProps = {
  children: React.ReactNode;
  className?: string;
};

export default function AppShell({ children, className = "" }: AppShellProps) {
  const { user, loading } = useUser();
  const authenticated = !loading && !!user;

  return (
    <div className={`app-shell ${className}`.trim()}>
      <Sidebar authenticated={authenticated} />
      <div className="app-shell-content">{children}</div>
    </div>
  );
}
