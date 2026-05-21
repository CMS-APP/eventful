"use client";

import { signOutUser } from "@/app/home/database/utils";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import "./Sidebar.css";

type SidebarProps = {
  authenticated?: boolean;
};

export default function Sidebar({ authenticated = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const accountHref = authenticated ? "/home" : "/";
  const isAccountActive =
    pathname === accountHref ||
    (authenticated &&
      (pathname.startsWith("/home") || pathname.startsWith("/stats")));

  async function logout() {
    if (confirm("Are you sure you want to log out?")) {
      await signOutUser();
      router.push("/");
    }
  }

  return (
    <aside className="sidebar">
      <a
        href="https://www.eventfulapp.com"
        className="sidebar-logo"
        aria-label="Eventful"
      >
        <Image
          src="/icon.png"
          alt=""
          width={44}
          height={44}
          className="sidebar-logo-image"
        />
      </a>

      <nav className="sidebar-nav">
        <Link
          href={accountHref}
          className={`sidebar-icon-link ${isAccountActive ? "sidebar-icon-link--active" : ""}`}
          aria-label="Account"
          title="Account"
        >
          <FontAwesomeIcon icon={faUser} className="sidebar-icon" />
        </Link>
        {authenticated && (
          <button
            type="button"
            className="sidebar-link sidebar-link--emphasis sidebar-link--logout"
            onClick={logout}
          >
            Log out
          </button>
        )}
      </nav>
    </aside>
  );
}
