import { useEffect, useState } from "react";

import "@/components/DeleteAccountModal.css";
import SimpleButton from "@/components/SimpleButton";
import SimpleTextInput from "@/components/SimpleTextInput";

export default function DeleteAccountModal({
  isOpen,
  password,
  setPassword,
  onClose,
  onDelete,
}) {
  const [error, setError] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timeout = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your password to confirm account deletion.");
      return;
    }
    onDelete();
  };

  return (
    (isOpen || isAnimating) && (
      <div
        className={`modal-overlay ${isOpen ? "fade-in" : "fade-out"}`}
        onClick={onClose}
      >
        <div
          className={`modal-container ${isOpen ? "slide-in" : "slide-out"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="modal-title">Delete Account</h2>
          <p className="modal-description">
            This action cannot be undone. Please enter your password to confirm
            that you want to permanently delete your account and all associated
            data.
          </p>

          {error && <div className="modal-error">{error}</div>}

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="modal-input-group">
              <SimpleTextInput
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                password
                autoFocus
              />
            </div>

            <div className="modal-buttons">
              <SimpleButton type="submit" className="simple-button--danger">
                Delete Account
              </SimpleButton>

              <SimpleButton
                type="button"
                className="simple-button--muted"
                onClick={onClose}
              >
                Cancel
              </SimpleButton>
            </div>
          </form>
        </div>
      </div>
    )
  );
}
