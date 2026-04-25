import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function FaqQuestionItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col bg-white rounded-lg border-2 border-white overflow-hidden transition-all duration-300">
      <div
        className="flex items-center justify-between p-5 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-2xl font-bold text-black pr-4">{question}</h3>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`text-xl transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"} ${isExpanded ? "text-black" : "text-[var(--secondary)]"}`}
        />
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 border-t border-black/20">
          <p className="text-lg text-black pt-4">{answer}</p>
        </div>
      </div>
    </div>
  );
}
