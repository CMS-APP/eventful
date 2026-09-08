import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { ChangeEventHandler, InputHTMLAttributes, ReactNode } from "react";
import { useState } from "react";

import "./TextInput.css";

type TextInputProps = {
  id: string;
  placeholder: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  label?: ReactNode;
  password?: boolean;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  autoFocus?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export default function TextInput({
  id,
  placeholder,
  value,
  onChange,
  label,
  password = false,
  type,
  autoFocus = false,
  disabled = false,
  required = false,
  className = "",
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const resolvedType = password
    ? showPassword
      ? "text"
      : "password"
    : (type ?? "text");

  return (
    <div className="text-input-group">
      {label && (
        <label className="text-input-label" htmlFor={id}>
          {label}
        </label>
      )}

      <div className={`text-input-wrapper ${className}`.trim()}>
        <input
          id={id}
          type={resolvedType}
          className="text-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoFocus={autoFocus}
          disabled={disabled}
          required={required}
        />

        {password && (
          <button
            type="button"
            className="text-input-toggle"
            onClick={() => setShowPassword((current) => !current)}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              fixedWidth
            />
          </button>
        )}
      </div>
    </div>
  );
}
