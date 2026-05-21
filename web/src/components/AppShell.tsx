import Sidebar from "./Sidebar";
import "./Sidebar.css";

type AppShellProps = {
  children: React.ReactNode;
  authenticated?: boolean;
  className?: string;
};

export default function AppShell({
  children,
  authenticated = false,
  className = "",
}: AppShellProps) {
  return (
    <div className={`app-shell ${className}`.trim()}>
      <Sidebar authenticated={authenticated} />
      <div className="app-shell-content">{children}</div>
    </div>
  );
}
