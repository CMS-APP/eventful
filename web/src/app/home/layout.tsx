import AccountAuthGuard from "@/components/AccountAuthGuard";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountAuthGuard>{children}</AccountAuthGuard>;
}
