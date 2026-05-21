"use client";

import { useUser } from "@/contexts/UserContext";
import { isMobileDevice } from "@/functions/IsMobileDevice.js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const { user, loading } = useUser();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => setIsMobile(isMobileDevice());
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (isMobile) {
      router.push("/");
      return;
    }

    if (!user) {
      router.push("/");
    }
  }, [router, isMobile, user, loading]);

  if (isMobile || loading) {
    return null;
  }

  return <>{children}</>;
}
