import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/app/components/admin-login-form";
import { Logo } from "@/app/components/logo";
import { isAdminAuthenticated } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin login",
  description: "Sign in to the Expert PUTME Mock control room.",
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5">
          <Logo />
          <Link href="/" className="text-sm text-ink-muted hover:text-ink">
            Back home
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12 sm:py-16">
        <AdminLoginForm />
      </main>
    </div>
  );
}
