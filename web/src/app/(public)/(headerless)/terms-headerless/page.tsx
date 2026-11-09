import { TermsOfServiceContent } from "@/features/terms/components/TermsOfServiceContent";

import "./page.css";

export default function TermsOfServiceHeaderless() {
  return (
    <div className="terms-headerless-page">
      <main className="terms-headerless-main">
        <TermsOfServiceContent />
      </main>
    </div>
  );
}
