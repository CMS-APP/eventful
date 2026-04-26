import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./Button.css";

interface ButtonProps {
  text: string;
  type: "primary" | "secondary" | "tertiary";
  onClick: () => void;
  circular?: boolean;
  loading?: boolean;
}

export function Button({
  text,
  onClick,
  type = "primary",
  circular = false,
  loading = false
}: ButtonProps) {
  return (
    <button onClick={onClick}>
      <div className={`button-view ${type} ${circular ? "circular" : ""}`}>
        <h4>{text}</h4>
        {loading && <FontAwesomeIcon icon={faSpinner} spin size="sm" />}
      </div>
    </button>
  );
}
