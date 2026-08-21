import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/app/components/logo";
import { LoginForm } from "@/app/components/login-form";
import { getCandidate } from "@/lib/candidate";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in with your JAMB registration number to open your candidate desk.",
};

export default async function LoginPage() {
  const candidate = await getCandidate();
  if (candidate) redirect("/candidate");

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5">
          <Logo />
          <Link href="/register" className="text-sm text-ink-muted hover:text-ink">
            Sign up
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-12 sm:py-16">
        <LoginForm />
      </main>
    </div>
  );
}
