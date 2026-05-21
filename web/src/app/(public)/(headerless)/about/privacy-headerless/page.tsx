import PrivacyPolicyContent from "@/components/PrivacyPolicyContent";

import "./page.css";

/** In-app / WebView: no PublicShell header or footer */
export default function PrivacyPolicyHeaderless() {
  return (
    <div className="privacy-headerless-page">
      <main className="privacy-headerless-main">
        <PrivacyPolicyContent />
      </main>
    </div>
  );
}
