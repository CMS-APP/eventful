"use client";

import { useState } from "react";

import "./StyledButton.css";

export default function StyledButton({
  color,
  hoverColor,
  text,
  onClickAction,
  textAlign = "left",
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="styled-button"
      onClick={onClickAction}
      style={{
        backgroundColor: isHovered ? hoverColor : color,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="styled-button-text" style={{ textAlign: textAlign, flex: 1 }}>{text}</div>
    </div>
  );
}
