"use client";

import {
  faChartLine,
  faRightFromBracket,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { signOutUser } from "@/app/account/database/utils";
import { useUser } from "@/contexts/UserContext";

import "./Sidebar.css";

type SidebarProps = {
  authenticated?: boolean;
};

export default function Sidebar({ authenticated = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin } = useUser();

  const accountHref = authenticated ? "/account" : "/";
  const accountActive =
    authenticated &&
    (pathname === "/account" || pathname.startsWith("/account/"));

  async function logout() {
    if (confirm("Are you sure you want to log out?")) {
      await signOutUser();
      router.push("/");
    }
  }

  return (
    <aside className="sidebar">
      <Link href={accountHref} className="sidebar-logo" aria-label="Home">
        <Image
          src="/icon.png"
          alt=""
          width={28}
          height={28}
          className="sidebar-logo-img"
          priority
        />
      </Link>

      <div className="sidebar-divider" role="presentation" />

      <nav className="sidebar-nav">
        <Link
          href={accountHref}
          className={`sidebar-link${accountActive ? " is-active" : ""}`}
          title="Account"
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Account</span>
        </Link>

        {authenticated && isAdmin && (
          <Link
            href="/stats"
            className={`sidebar-link${pathname.startsWith("/stats") ? " is-active" : ""}`}
            title="Admin"
          >
            <FontAwesomeIcon icon={faChartLine} />
            <span>Admin</span>
          </Link>
        )}
      </nav>

      {authenticated && (
        <div className="sidebar-footer">
          <div className="sidebar-divider" role="presentation" />
          <button
            type="button"
            className="sidebar-link sidebar-logout"
            onClick={logout}
            title="Log out"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>Log out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
