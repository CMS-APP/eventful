"use client";

import { FIREBASE_AUTH } from "@/app/Firebase.js";
import { checkAdmin, getUserData } from "@/app/home/database/utils";
import { User, onAuthStateChanged } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserData {
  email?: string;
  name?: string;
  username?: string;
}

interface UserContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userData: null,
  loading: true,
  isAdmin: false,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      FIREBASE_AUTH,
      async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          // Fetch additional user data from Firestore
          try {
            const data = await getUserData(firebaseUser);
            setUserData(data);
            const isAdmin = await checkAdmin(firebaseUser.uid);
            setIsAdmin(isAdmin);
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUserData(null);
          }
        } else {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, userData, loading, isAdmin }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
