import { NextRequest } from "next/server";

import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";

export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return false;

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const adminDoc = await getAdminFirestore()
      .collection("admin")
      .doc("admin")
      .get();
    const uids = (adminDoc.data()?.uids as string[] | undefined) ?? [];
    return uids.includes(decoded.uid);
  } catch {
    return false;
  }
}
