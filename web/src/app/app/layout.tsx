"use client";

import { UserProvider, useUser } from "@/contexts/UserContext";
import { isMobileDevice } from "@/functions/IsMobileDevice.js";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const { user, loading } = useUser();

  useEffect(() => {
    // Check if user is on mobile device
    if (typeof window !== "undefined") {
      const checkMobile = () => setIsMobile(isMobileDevice());
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  useEffect(() => {
    // Wait for auth state to load
    if (loading) {
      return;
    }

    // Block mobile users from accessing /app section
    if (isMobile) {
      router.push("/");
      return;
    }

    // Allow access to the login page (/app) without authentication
    if (pathname === "/app") {
      return;
    }

    // For all other routes under /app, check authentication
    if (!user) {
      // User is not authenticated, redirect to login
      router.push("/app");
    }
  }, [pathname, router, isMobile, user, loading]);

  // Don't render children if on mobile (will redirect)
  if (isMobile) {
    return null;
  }

  // Show loading state while checking auth
  if (loading) {
    return null;
  }

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </UserProvider>
  );
}
