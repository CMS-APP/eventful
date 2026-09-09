"use client";

import { CSSProperties, ReactNode, useState } from "react";

import "./StyledButton.css";

type StyledButtonProps = {
  color: string;
  hoverColor: string;
  text: ReactNode;
  onClickAction: () => void;
  textAlign?: CSSProperties["textAlign"];
};

export default function StyledButton({
  color,
  hoverColor,
  text,
  onClickAction,
  textAlign = "left",
}: StyledButtonProps) {
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
