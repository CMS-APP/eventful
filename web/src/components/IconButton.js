"use client";

import Image from "next/image";
import { useState } from "react";

import "./IconButton.css";

export default function IconButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`icon-button-container ${isHovered ? "hovered" : ""}`}
      onClick={() => (window.location = "/")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="icon-button-image" style={{ zIndex: 3 }}>
        <Image
          src="/icon.png"
          alt="Eventful Logo"
          width={50}
          height={50}
          style={{ borderRadius: "20px", objectFit: "contain" }}
        />
      </div>

      <h1 className="icon-button-title" style={{ fontSize: "24px" }}>
        Eventful
      </h1>
    </div>
  );
}
