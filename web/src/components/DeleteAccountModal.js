import { useEffect, useState } from "react";

import "@/components/DeleteAccountModal.css";
import Button from "@/components/Button";
import TextInput from "@/components/TextInput";

export default function DeleteAccountModal({
  isOpen,
  password,
  setPassword,
  onClose,
  onDelete,
}) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setIsSubmitting(false);
      setIsAnimating(true);
    } else {
      const timeout = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your password to confirm account deletion.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onDelete();
    } catch {
      setError("Incorrect password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    (isOpen || isAnimating) && (
      <div
        className={`modal-overlay ${isOpen ? "fade-in" : "fade-out"}`}
        onClick={isSubmitting ? undefined : onClose}
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
              <TextInput
                id="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                password
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            <div className="modal-buttons">
              <Button type="submit" variant="danger" loading={isSubmitting}>
                Delete Account
              </Button>

              <Button
                type="button"
                variant="muted"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}
