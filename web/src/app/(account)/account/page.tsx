"use client";

import { useState } from "react";

import { deleteUserAccount } from "@/services/firebase/user";
import DeleteAccountModal from "@/features/account/components/DeleteAccountModal";
import Button from "@/components/Button";
import { useUser } from "@/contexts/UserContext";

import "./page.css";

export default function Home() {
  const { user, userData } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");

  function closeDeleteModal() {
    setIsModalOpen(false);
    setPassword("");
  }

  async function passwordInputAccountDeletion() {
    if (!user || !user.email) {
      throw new Error("No user found");
    }

    await deleteUserAccount(user, password);
    closeDeleteModal();
  }

  const email = userData?.email ?? "";
  const name = userData?.name ?? "";
  const username = userData?.username ?? "";

  return (
    <>
      <main
        className="flex flex-1 flex-col gap-4 p-4 md:flex-row md:gap-10 md:p-10"
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
                <Button variant="danger" onClick={() => setIsModalOpen(true)}>
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DeleteAccountModal
          isOpen={isModalOpen}
          password={password}
          setPassword={setPassword}
          onClose={closeDeleteModal}
          onDelete={passwordInputAccountDeletion}
        />
      </main>
    </>
  );
}
