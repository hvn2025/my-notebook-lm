import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { redirectAuthenticatedUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  await redirectAuthenticatedUser();
  return (
    <AuthShell title="Welcome back" description="Sign in to continue to your notebooks.">
      <SignInForm />
    </AuthShell>
  );
}
