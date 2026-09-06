"use client";

import Loading from "@/components/Loading";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.push("/");
    }
  }, [router, user, loading]);

  if (loading) {
    return <Loading />;
  }

  return <>{children}</>;
}
