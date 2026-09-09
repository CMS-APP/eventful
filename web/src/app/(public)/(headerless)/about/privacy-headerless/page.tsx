import PrivacyPolicyContent from "@/features/privacy/components/PrivacyPolicyContent";

import "./page.css";

export default function PrivacyPolicyHeaderless() {
  return (
    <div className="privacy-headerless-page">
      <main className="privacy-headerless-main">
        <PrivacyPolicyContent />
      </main>
    </div>
  );
}
