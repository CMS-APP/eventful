import { Page } from "@/components/views/Page";
import { SignInForm } from "./SignInForm";
import "./page.css";

type SignInPageProps = {
  searchParams: Promise<{
    email?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <Page>
      <div className="sign-in-page">
        <SignInForm searchParams={resolvedSearchParams} />
      </div>
    </Page>
  );
}
