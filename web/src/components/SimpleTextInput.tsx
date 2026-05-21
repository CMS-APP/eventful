import type { ChangeEventHandler, InputHTMLAttributes } from "react";

import "./SimpleTextInput.css";

type SimpleTextInputProps = {
  id: string;
  placeholder: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  password?: boolean;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function SimpleTextInput({
  id,
  placeholder,
  value,
  onChange,
  password = false,
  type,
  autoFocus = false,
  disabled = false,
  className = "",
}: SimpleTextInputProps) {
  return (
    <input
      id={id}
      type={type ?? (password ? "password" : "text")}
      className={`simple-text-input ${className}`.trim()}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoFocus={autoFocus}
      disabled={disabled}
    />
  );
}
