"use client";

import DeleteAccountModal from "@/components/DeleteAccountModal.js";
import Footer from "@/components/Footer.js";
import StyledBigButton from "@/components/StyledBigButton.js";
import AppShell from "@/components/AppShell";
import { useUser } from "@/contexts/UserContext";
import { isMobileDevice } from "@/functions/IsMobileDevice.js";
import { useEffect, useState } from "react";
import { deleteUserAccount } from "./database/utils";
import "./page.css";

export default function Home() {
  const { user, userData, isAdmin } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDevice = () => setIsMobile(isMobileDevice());

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  function deleteAccountAlert() {
    if (confirm("Are you sure you want to delete your account?")) {
      setIsModalOpen(true);
    }
  }

  async function passwordInputAccountDeletion() {
    setIsModalOpen(false);

    if (!user || !user.email) {
      throw new Error("No user found");
    }

    await deleteUserAccount(user, password);
  }

  // Get user data from context
  const email = userData?.email ?? "";
  const name = userData?.name ?? "";
  const username = userData?.username ?? "";

  return (
    <AppShell authenticated className="bg-[var(--primary)]">
      <main
        className={`flex flex-grow flex-col ${isMobile ? "flex-col" : "md:flex-row"} gap-10 p-10`}
      >
        <div className="profile-container">
          <div className="profile-header">
            <h1>Welcome to your profile</h1>
            <p className="profile-subtitle">
              Manage your account and preferences
            </p>
          </div>

          <div className="profile-content">
            {/* Profile Info Card */}
            <div className="profile-card">
              <h2 className="profile-card-title">Profile Information</h2>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="profile-info-label">Email</span>
                  <span className="profile-info-value">
                    {email || "Not set"}
                  </span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Name</span>
                  <span className="profile-info-value">
                    {name || "Not set"}
                  </span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Username</span>
                  <span className="profile-info-value">
                    {username || "Not set"}
                  </span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="profile-section">
                <div className="profile-buttons-grid">
                  <StyledBigButton
                    text={"Admin Panel"}
                    color={"var(--secondary)"}
                    hoverColor={"var(--secondaryTint)"}
                    onClickAction={() => {
                      window.location.href = "/stats";
                    }}
                  />
                </div>
              </div>
            )}

            <div className="profile-section danger-zone">
              <h2 className="profile-section-title">Danger Zone</h2>
              <div className="profile-buttons-grid">
                <StyledBigButton
                  text={"Delete Account"}
                  color={"var(--color-danger)"}
                  hoverColor={"var(--color-danger-dark)"}
                  onClickAction={deleteAccountAlert}
                />
              </div>
            </div>
          </div>
        </div>

        <DeleteAccountModal
          isOpen={isModalOpen}
          password={password}
          setPassword={setPassword}
          onClose={() => setIsModalOpen(false)}
          onDelete={passwordInputAccountDeletion}
        />
      </main>
      <Footer />
    </AppShell>
  );
}
