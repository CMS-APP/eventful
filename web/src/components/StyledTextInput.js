import { useEffect, useState } from "react";

import "./StyledTextInput.css";

function StyledTextInput({
  id,
  placeholder,
  value,
  onChange,
  password = false,
  multiline = false,
  borderColor = "var(--secondary)",
}) {
  const [focused, setFocused] = useState(false); // State to track if the input is focused or has text

  const handleFocus = () => setFocused(true);

  const handleBlur = () => {
    if (!value) {
      setFocused(false);
    }
  };

  useEffect(() => {
    // If the input has text, set the focused state to true
    if (value) {
      setFocused(true);
    }
  }, [value]);

  return (
    <div className="relative w-full">
      <label
        onClick={() => document.getElementById(id).focus()}
        onFocus={() => document.getElementById(id).focus()}
        htmlFor={id}
        className="label"
        style={{
          zIndex: 1,
          top: focused || value ? "-20px" : "12px",
          left: focused || value ? "0px" : "12px",
          fontSize: focused || value ? "12px" : "16px",
          color: focused || value ? "rgba(0, 0, 0, 0.5)" : "gray",
        }}
      >
        {placeholder}
      </label>

      {multiline ? (
        <textarea
          id={id}
          className="textarea"
          style={{ "--focus-border-color": borderColor }}
          placeholder=" "
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      ) : (
        <input
          id={id}
          type={password ? "password" : "text"}
          className="input"
          style={{ "--focus-border-color": borderColor }}
          placeholder=" "
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      )}
    </div>
  );
}

export default StyledTextInput;
