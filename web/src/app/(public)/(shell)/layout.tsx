import PublicShell from "@/components/PublicShell";

export default function PublicShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}
