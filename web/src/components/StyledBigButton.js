"use client"

import React, { useState } from "react";

import "./StyledBigButton.css";

export default function StyledBigButton({
  text,
  color,
  hoverColor,
  onClickAction,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="styled-big-button"
      onClick={onClickAction}
      style={{
        backgroundColor: isHovered ? hoverColor : color,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="styled-big-button-text">{text}</div>
    </div>
  );
}
