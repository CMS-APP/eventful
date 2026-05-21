import "./layout.css";

/** WebView / mobile: no site header or footer */
export default function HeaderlessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="headerless-layout">{children}</div>;
}
