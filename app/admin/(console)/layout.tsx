import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminSidebar } from "@/app/components/admin-sidebar";
import { isAdminAuthenticated } from "@/lib/admin";

export default async function AdminConsoleLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-field">
        <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
