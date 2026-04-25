"use client";

import { useState } from "react";

import "./StyledButton.css";

export default function StyledButtonFlex({
  color,
  hoverColor,
  text,
  onClickAction,
  selected,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="styled-button"
      onClick={onClickAction}
      style={{
        backgroundColor: isHovered
          ? hoverColor
          : selected
            ? color
            : color + "AA",
        flex: 1,
        boxShadow: selected ? "0 4px 8px rgba(0, 0, 0, 0.3)" : "none",
        outline: selected ? `3px solid ${color}` : "none",
        outlineOffset: selected ? "2px" : "0",
        transform: selected ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s ease-in-out",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="styled-button-text">{text}</div>
    </div>
  );
}
