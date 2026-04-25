"use client";

import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function HeaderLink({ href, title, dropdown = null, icon }) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  const isActive = (href) => pathname === href;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Link */}
      <Link
        href={href}
        className={"flex items-center"}
        style={{
          alignItems: "center",
          color: isActive(href) || isHovered ? "var(--primary)" : "black",
          textDecoration: isHovered ? "underline" : "none",
        }}
      >
        <FontAwesomeIcon icon={icon} className="mr-2" size="md" width={25} />
        <p className={`hover:text-[var(--primary)] transition-colors ${isActive(href) ? "text-[var(--primary)]" : "text-black"
          }`}>
          {title}
        </p>

        {dropdown && (
          <FontAwesomeIcon
            icon={faChevronUp}
            className="ml-1"
            style={{
              fontSize: 12,
              color: "grey",
              transition: "transform 0.3s ease",
              transform: isHovered ? "rotate(180deg)" : "rotate(0deg)",
              marginLeft: 5,
            }}
          />
        )}
      </Link>

      {dropdown && isHovered && (
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="h-2 w-full absolute"></div>

          <div className="mt-2 bg-white shadow-lg pointer-events-auto" style={{ borderRadius: 10, borderWidth: 0.5, padding: 5 }}>
            {dropdown.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block px-4 py-2 text-black hover:bg-gray-100"
                style={{
                  fontFamily: "var(--font-montserrat-regular)",
                  fontWeight: 600,
                  borderRadius: 10,
                  textAlign: 'center',
                  textWrap: 'nowrap',
                }}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
