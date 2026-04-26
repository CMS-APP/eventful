import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./TextInput.css";

export function TextInput({
  placeholder,
  secureTextEntry = false,
  value,
  onChange
}: {
  placeholder: string;
  secureTextEntry?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="text-input">
      <input
        type={secureTextEntry ? "password" : "text"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />

      <FontAwesomeIcon icon={faEye} style={{ width: 20, height: 20 }} />
    </div>
  );
}
