import AccountAuthGuard from "@/components/AccountAuthGuard";

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountAuthGuard>{children}</AccountAuthGuard>;
}
