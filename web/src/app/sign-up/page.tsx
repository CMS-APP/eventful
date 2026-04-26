import { Page } from "@/components/views/Page";

import { SignUpForm } from "./SignUpForm";
import "./page.css";

export default function SignUpPage() {
  return (
    <Page>
      <div className="sign-up-page">
        <SignUpForm />
      </div>
    </Page>
  );
}
