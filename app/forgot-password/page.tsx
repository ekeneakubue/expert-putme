import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/app/components/logo";
import { ForgotPasswordForm } from "@/app/components/forgot-password-form";
import { getCandidate } from "@/lib/candidate";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your Expert PUTME Mock password with your JAMB number and phone.",
};

export default async function ForgotPasswordPage() {
  const candidate = await getCandidate();
  if (candidate) redirect("/candidate");

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5">
          <Logo />
          <Link href="/login" className="text-sm text-ink-muted hover:text-ink">
            Back to login
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-12 sm:py-16">
        <ForgotPasswordForm />
      </main>
    </div>
  );
}
