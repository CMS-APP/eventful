import { Header2 } from "./Header2";
import "./Page.css";

export function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <Header2 />
      <main className="page-content">{children}</main>
    </div>
  );
}
