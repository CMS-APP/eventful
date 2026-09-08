import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";

import "./Button.css";

type ButtonProps = {
  children: ReactNode;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  variant?: "secondary" | "primary" | "danger" | "muted";
  icon?: IconDefinition;
};

export default function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  className = "",
  variant = "secondary",
  icon,
}: ButtonProps) {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (loading) return;
    onClick?.(event);
  };

  return (
    <button
      type={type}
      className={`button button--${variant} ${className}`.trim()}
      onClick={handleClick}
      disabled={disabled}
      aria-busy={loading}
    >
      <span className="button-content">
        {loading ? (
          <span className="button-spinner" aria-hidden="true" />
        ) : (
          icon && <FontAwesomeIcon icon={icon} />
        )}
        <span>{children}</span>
      </span>
    </button>
  );
}
