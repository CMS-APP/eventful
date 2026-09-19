import { faApple, faGooglePlay } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

import type { ReactNode } from "react";

import { APP_STORE_LINK, GOOGLE_PLAY_LINK } from "@/lib/appLinks";

import "./AuthShell.css";

type AuthShellProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  showDownloadLinks?: boolean;
  children: ReactNode;
};

export default function AuthShell({
  eyebrow,
  title,
  description,
  showDownloadLinks = false,
  children,
}: AuthShellProps) {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-info-panel">
          <Image
            src="/icon.png"
            alt=""
            width={320}
            height={320}
            className="auth-info-watermark"
          />

          <p className="auth-info-eyebrow">{eyebrow}</p>
          <h1 className="auth-info-title">{title}</h1>
          {description && <p className="auth-info-copy">{description}</p>}

          {showDownloadLinks && (
            <>
              <p className="auth-info-download-label">Get the app</p>
              <div className="auth-info-download-links">
                <a
                  href={APP_STORE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="auth-info-download-link"
                >
                  <FontAwesomeIcon icon={faApple} />
                  Apple
                </a>
                <a
                  href={GOOGLE_PLAY_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="auth-info-download-link"
                >
                  <FontAwesomeIcon icon={faGooglePlay} />
                  Google
                </a>
              </div>
            </>
          )}
        </div>

        <div className="auth-form-panel">{children}</div>
      </div>
    </main>
  );
}
