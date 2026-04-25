import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

interface FaqHeaderButtonProps {
  title: string;
  selectedButton: string;
  setSelectedButton: (title: string) => void;
  icon: IconDefinition;
}

export default function FaqHeaderButton({
  title,
  icon,
  selectedButton,
  setSelectedButton,
}: FaqHeaderButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  function color() {
    if (selectedButton === title) {
      return "text-[var(--secondary)]";
    } else {
      return "text-white";
    }
  }

  return (
    <div
      className={`flex flex-1 flex-col items-center 
      cursor-pointer justify-center gap-2
      bg-[var(--secondary)] rounded-lg p-5 ${
        selectedButton === title ? "bg-[white]" : "bg-[var(--secondary)]"
      }
      ${isHovered ? "border-2 border-[white]" : "border-2 border-[var(--secondary)]"}
      transition-all duration-300 select-none`}
      onClick={() => {
        setSelectedButton(title);
      }}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <FontAwesomeIcon icon={icon} className={color() + " text-3xl"} />
      <h3 className={color() + " text-center transition-all duration-300"}>
        {title}
      </h3>
    </div>
  );
}
