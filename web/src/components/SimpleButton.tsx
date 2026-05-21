import type { ButtonHTMLAttributes, ReactNode } from "react";

import "./SimpleButton.css";

type SimpleButtonProps = {
  children: ReactNode;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
  className?: string;
};

export default function SimpleButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: SimpleButtonProps) {
  return (
    <button
      type={type}
      className={`simple-button ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
