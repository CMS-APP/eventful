import "./layout.css";

export default function HeaderlessLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <div className="headerless-layout">{children}</div>;
}
