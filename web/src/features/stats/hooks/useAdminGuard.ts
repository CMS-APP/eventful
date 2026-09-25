"use client";

import { useEffect, useState } from "react";

import { useUser } from "@/contexts/UserContext";
import { checkAdmin } from "@/services/firebase/user";

export function useAdminGuard() {
  const { user, loading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    async function verifyAdmin() {
      if (loading || !user) return;
      try {
        const adminStatus = await checkAdmin(user.uid);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    }
    verifyAdmin();
  }, [user, loading]);

  return { user, loading, isAdmin, checkingAdmin };
}
