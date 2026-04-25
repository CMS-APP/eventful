"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";

import HeaderButton from "@/components/HeaderButton";
import HeaderLink from "@/components/HeaderLink";
import { isMobileDevice } from "@/functions/IsMobileDevice.js";
import {
  faAddressBook,
  faBook,
  faHammer,
  faHome,
  faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons";
import "./Header.css";
import IconButton from "./IconButton";

export default function Header({ main = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useLayoutEffect(() => {
    if (isClient) {
      const checkDevice = () => setIsMobile(isMobileDevice());
      window.addEventListener("resize", checkDevice);
      checkDevice();
      return () => window.removeEventListener("resize", checkDevice);
    }
  }, [isClient]);

  return (
    <header
      className="w-full sticky top-0 z-50"
      style={{
        backgroundColor: main && !isMobile ? "transparent" : "var(--primary)",
        boxShadow: main && !isMobile ? "none" : "0 4px 6px rgba(0, 0, 0, 0.1)",
        borderBottom:
          main && !isMobile ? "none" : "1px solid rgba(255, 255, 255, 0.15)",
      }}
    >
      <div className="flex items-center p-4">
        <IconButton />
        <nav
          className={`flex-1 items-center justify-end gap-5 pr-5 hidden ${isMobile ? "" : "md:flex"}`}
        >
          <HeaderButton text="Home" pathName="/" />
          <HeaderButton text="Features" pathName="/features" />
          <HeaderButton
            text="About"
            dropdownItems={[
              { text: "Info", pathName: "/about" },
              { text: "FAQ", pathName: "/about/faq" },
            ]}
          />
          <HeaderButton text="Contact" pathName="/contact" />
          <HeaderButton text="Blog" pathName="/blog" />
        </nav>
        <div className={`ml-auto hidden ${isMobile ? "" : "md:flex"} mr-5`}>
          <HeaderButton text="Account" pathName="/app" bold />
        </div>

        <button
          className={`flex-1 flex justify-end items-center mr-2 text-white flex ${isMobile ? "" : "md:hidden"}`}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </motion.div>
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`bg-white border-t border-gray-200 absolute w-full p-5 shadow-lg ${isMobile ? "" : "md:hidden"}`}
          >
            <div className="flex flex-col gap-2">
              <HeaderLink href="/" title="Home" icon={faHome} />
              <HeaderLink href="/features" title="Features" icon={faHammer} />
              <HeaderLink href="/about" title="About Us" icon={faPeopleGroup} />
              <HeaderLink href="/blog" title="Blog" icon={faBook} />
              <HeaderLink
                href="/contact"
                title="Contact Us"
                icon={faAddressBook}
              />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
