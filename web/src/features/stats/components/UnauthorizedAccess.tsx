"use client";

import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/Button";
import "@/components/EmptyState.css";

interface UnauthorizedAccessProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export function UnauthorizedAccess({
  title = "Access Denied",
  message = "You don't have permission to access this page.",
  showBackButton = true,
}: UnauthorizedAccessProps) {
  return (
    <main className="empty-state">
      <p className="empty-state-eyebrow">Restricted</p>
      <FontAwesomeIcon icon={faLock} className="empty-state-icon" />
      <h1 className="empty-state-title">{title}</h1>
      <p className="empty-state-text">{message}</p>

      {showBackButton && (
        <div className="empty-state-actions">
          <Button
            className="empty-state-primary"
            onClick={() => (window.location.href = "/account")}
          >
            Go back to account
          </Button>
        </div>
      )}
    </main>
  );
}
