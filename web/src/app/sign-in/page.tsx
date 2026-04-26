import { Page } from "@/components/views/Page";
import { SignInForm } from "./SignInForm";
import "./page.css";

type SignInPageProps = {
  searchParams?: {
    email?: string | string[];
  };
};

export default function SignInPage({ searchParams }: SignInPageProps) {
  return (
    <Page>
      <div className="sign-in-page">
        <SignInForm searchParams={searchParams} />
      </div>
    </Page>
  );
}
