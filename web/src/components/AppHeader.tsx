"use client";

import {
  faBars,
  faChartLine,
  faChevronDown,
  faRightFromBracket,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import { signOutUser } from "@/app/account/database/utils";
import { useUser } from "@/contexts/UserContext";

import "./AppHeader.css";

type AppHeaderProps = {
  authenticated?: boolean;
};

function getInitials(name?: string, email?: string) {
  const source = name?.trim();
  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    const initials = parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("");
    if (initials) return initials.toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "";
}

export default function AppHeader({ authenticated = false }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userData, isAdmin } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);

  const accountHref = authenticated ? "/account" : "/";
  const accountActive =
    authenticated &&
    (pathname === "/account" || pathname.startsWith("/account/"));
  const statsActive = pathname.startsWith("/stats");
  const initials = getInitials(userData?.name, userData?.email);
  const label = userData?.name || userData?.username || "Account";

  useEffect(() => {
    if (!menuOpen && !navMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
      if (navMenuRef.current && !navMenuRef.current.contains(target)) {
        setNavMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setNavMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, navMenuOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setNavMenuOpen(false);
  }, [pathname]);

  async function logout() {
    if (confirm("Are you sure you want to log out?")) {
      await signOutUser();
      router.push("/");
    }
  }

  return (
    <header className="app-header">
      <div className="app-header-left">
        <Link href={accountHref} className="app-header-brand" aria-label="Home">
          <Image
            src="/icon.png"
            alt=""
            width={28}
            height={28}
            className="app-header-logo-img"
            priority
          />
          <span className="app-header-wordmark">Eventful</span>
        </Link>

        {authenticated && (
          <nav className="app-header-nav">
            <Link
              href={accountHref}
              className={`app-header-nav-link${accountActive ? " is-active" : ""}`}
            >
              <FontAwesomeIcon icon={faUser} />
              <span>Account</span>
            </Link>

            {isAdmin && (
              <Link
                href="/stats"
                className={`app-header-nav-link${statsActive ? " is-active" : ""}`}
              >
                <FontAwesomeIcon icon={faChartLine} />
                <span>Stats</span>
              </Link>
            )}
          </nav>
        )}
      </div>

      {authenticated && (
        <div className="app-header-right">
          <div className="app-header-nav-menu" ref={navMenuRef}>
            <button
              type="button"
              className="app-header-hamburger"
              onClick={() => setNavMenuOpen((open) => !open)}
              aria-expanded={navMenuOpen}
              aria-haspopup="menu"
              aria-label="Menu"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>

            {navMenuOpen && (
              <div className="app-header-dropdown" role="menu">
                <Link
                  href={accountHref}
                  className={`app-header-dropdown-item${accountActive ? " is-active" : ""}`}
                  role="menuitem"
                >
                  <FontAwesomeIcon icon={faUser} />
                  <span>Account</span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/stats"
                    className={`app-header-dropdown-item${statsActive ? " is-active" : ""}`}
                    role="menuitem"
                  >
                    <FontAwesomeIcon icon={faChartLine} />
                    <span>Stats</span>
                  </Link>
                )}

                <div className="app-header-dropdown-divider" />

                <button
                  type="button"
                  className="app-header-dropdown-item app-header-logout"
                  onClick={logout}
                  role="menuitem"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>

          <Link
            href={accountHref}
            className="app-header-avatar-link"
            aria-label="Account"
          >
            <span className="app-header-avatar" aria-hidden="true">
              {initials}
            </span>
          </Link>

          <div className="app-header-menu" ref={menuRef}>
            <button
              type="button"
              className="app-header-avatar-button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span className="app-header-avatar" aria-hidden="true">
                {initials}
              </span>
              <span className="app-header-avatar-label">{label}</span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`app-header-chevron${menuOpen ? " is-open" : ""}`}
              />
            </button>

            {menuOpen && (
              <div className="app-header-dropdown" role="menu">
                <button
                  type="button"
                  className="app-header-dropdown-item app-header-logout"
                  onClick={logout}
                  role="menuitem"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
