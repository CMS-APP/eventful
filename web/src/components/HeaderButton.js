"use client";

import { useEffect, useState } from "react";

import "./HeaderButton.css";

export default function HeaderButton({
  text,
  pathName,
  onClickAction = null,
  bold = false,
  dropdownItems = null,
}) {
  const [color, setColor] = useState("white");
  const [shadow, setShadow] = useState("0px 0px 10px rgba(0, 0, 0, 0.5)");
  const [isHovered, setIsHovered] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hideTimeout, setHideTimeout] = useState(null);

  useEffect(() => {
    function getColor() {
      if (pathName === window.location.pathname && pathName !== "/app") {
        return "var(--secondary)";
      } else {
        return "white";
      }
    }

    function getShadow() {
      if (
        isHovered ||
        pathName === window.location.pathname ||
        window.location.pathname !== "/"
      ) {
        return "0px 0px 10px rgba(0, 0, 0, 0.5)";
      } else {
        return "0px 0px 10px rgba(0, 0, 0, 0.5)";
      }
    }

    setColor(getColor());
    setShadow(getShadow());
  }, [pathName, isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (dropdownItems) {
      setShowDropdown(true);
    }
    // Clear any pending hide timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (dropdownItems) {
      // Add a small delay before hiding the dropdown
      const timeout = setTimeout(() => {
        setShowDropdown(false);
      }, 150);
      setHideTimeout(timeout);
    }
  };

  const handleDropdownItemClick = (item) => {
    if (item.onClickAction) {
      item.onClickAction();
    } else if (item.pathName) {
      window.location = item.pathName;
    }
    setShowDropdown(false);
  };

  return (
    <div
      className="header-button-container"
      style={{
        filter: "drop-shadow(" + shadow + ")",
        backgroundColor: bold ? "var(--secondary)" : "transparent",
        position: "relative",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (!dropdownItems) {
          if (onClickAction) {
            onClickAction();
            return;
          }
          window.location = pathName;
        }
      }}
    >
      <div
        className="header-button"
        style={{
          color: color,
          transition: "color 0.3s ease",
          cursor: dropdownItems ? "default" : "pointer",
        }}
      >
        {text}
        {dropdownItems && (
          <span style={{ marginLeft: "5px", fontSize: "12px" }}>▼</span>
        )}
      </div>

      {/* Dropdown Menu */}
      {dropdownItems && showDropdown && (
        <div
          className="dropdown-menu"
          onMouseEnter={() => {
            // Clear any pending hide timeout when hovering over dropdown
            if (hideTimeout) {
              clearTimeout(hideTimeout);
              setHideTimeout(null);
            }
          }}
          onMouseLeave={() => {
            // Add delay when leaving dropdown
            const timeout = setTimeout(() => {
              setShowDropdown(false);
            }, 150);
            setHideTimeout(timeout);
          }}
        >
          {dropdownItems.map((item, index) => (
            <div
              key={index}
              className="dropdown-item"
              onClick={() => handleDropdownItemClick(item)}
            >
              {item.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
