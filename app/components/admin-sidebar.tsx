"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAdmin } from "@/app/actions/admin";
import { Logo } from "@/app/components/logo";

const nav = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/candidates", label: "Candidates" },
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-line bg-screen px-4 lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-[3px] border border-line px-3 py-1.5 text-sm font-medium text-ink"
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-monitor text-signal-ink transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden border-b border-signal-ink/10 px-5 py-5 lg:block">
          <Logo inverse />
          <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.28em] text-signal">
            Control room
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-[3px] px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-signal text-signal-ink"
                    : "text-signal-ink/70 hover:bg-signal-ink/8 hover:text-signal-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-signal-ink/10 px-3 py-4">
          <Link
            href="/"
            className="block rounded-[3px] px-3 py-2 text-sm text-signal-ink/65 transition-colors hover:bg-signal-ink/8 hover:text-signal-ink"
          >
            View site
          </Link>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="w-full rounded-[3px] px-3 py-2 text-left text-sm text-signal-ink/65 transition-colors hover:bg-signal-ink/8 hover:text-signal-ink"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
