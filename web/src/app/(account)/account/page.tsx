"use client";

import { useEffect, useState } from "react";

import { deleteUserAccount } from "@/app/account/database/utils";
import DeleteAccountModal from "@/components/DeleteAccountModal.js";
import SimpleButton from "@/components/SimpleButton";
import { useUser } from "@/contexts/UserContext";
import { isMobileDevice } from "@/functions/IsMobileDevice.js";

import "./page.css";

export default function Home() {
  const { user, userData } = useUser();
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

  const email = userData?.email ?? "";
  const name = userData?.name ?? "";
  const username = userData?.username ?? "";

  return (
    <>
      <main
        className={`flex flex-1 flex-col ${isMobile ? "flex-col" : "md:flex-row"} gap-4 p-4 md:gap-10 md:p-10`}
      >
        <div className="profile-container">
          <div className="profile-header">
            <h1>Account</h1>
            <p className="profile-subtitle">
              Manage your settings and preferences
            </p>
          </div>

          <div className="profile-content">
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

            <div className="profile-section danger-zone">
              <h2 className="profile-section-title">Danger Zone</h2>
              <div className="profile-buttons-grid">
                <SimpleButton
                  className="simple-button--danger"
                  onClick={deleteAccountAlert}
                >
                  Delete Account
                </SimpleButton>
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
    </>
  );
}
