import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/app/components/logo";
import { SignupForm } from "@/app/components/signup-form";
import { getCandidate } from "@/lib/candidate";

export const metadata: Metadata = {
  title: "Sign up",
  description:
    "Register with your JAMB number to enter the Expert PUTME Mock CBT hall.",
};

export default async function RegisterPage() {
  const candidate = await getCandidate();
  if (candidate) redirect("/candidate");

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5">
          <Logo />
          <Link href="/login" className="text-sm text-ink-muted hover:text-ink">
            Log in
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-12 sm:py-16">
        <SignupForm />
      </main>
    </div>
  );
}
