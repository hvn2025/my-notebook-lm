import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { redirectAuthenticatedUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  await redirectAuthenticatedUser();
  return (
    <AuthShell
      title="Create your account"
      description="Build notebooks that stay grounded in your own sources."
    >
      <SignUpForm />
    </AuthShell>
  );
}
