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

import "./AppHeader.css";

type AppHeaderProps = {
  authenticated?: boolean;
};

export default function AppHeader({ authenticated = false }: AppHeaderProps) {
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
    <header className="app-header">
      <div className="app-header-left">
        <Link href={accountHref} className="app-header-logo" aria-label="Home">
          <Image
            src="/icon.png"
            alt=""
            width={28}
            height={28}
            className="app-header-logo-img"
            priority
          />
        </Link>

        <nav className="app-header-nav">
          <Link
            href={accountHref}
            className={`app-header-link${accountActive ? " is-active" : ""}`}
            title="Account"
          >
            <FontAwesomeIcon icon={faUser} />
            <span>Account</span>
          </Link>

          {authenticated && isAdmin && (
            <Link
              href="/stats"
              className={`app-header-link${pathname.startsWith("/stats") ? " is-active" : ""}`}
              title="Admin"
            >
              <FontAwesomeIcon icon={faChartLine} />
              <span>Admin</span>
            </Link>
          )}
        </nav>
      </div>

      {authenticated && (
        <button
          type="button"
          className="app-header-link app-header-logout"
          onClick={logout}
          title="Log out"
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
          <span>Log out</span>
        </button>
      )}
    </header>
  );
}
