import type { Metadata } from "next";
import { AddUserPanel } from "@/app/components/add-user-panel";
import { listUsers } from "@/lib/users";

export const metadata: Metadata = {
  title: "Users",
};

function roleLabel(role: string) {
  return role === "ADMIN" ? "Admin" : "Staff";
}

function accessLabel(role: string) {
  return role === "ADMIN" ? "Full control room" : "Limited control room";
}

export default async function AdminUsersPage() {
  let users: Awaited<ReturnType<typeof listUsers>> = [];
  let loadError = false;

  try {
    users = await listUsers();
  } catch {
    loadError = true;
  }

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-signal">
        Users
      </p>
      <h1 className="font-display mt-3 text-4xl leading-none tracking-tight sm:text-5xl">
        Staff access
      </h1>
      <p className="mt-4 max-w-xl text-ink-muted leading-7">
        People who can open the control room. Candidate seats live under
        Candidates.
      </p>

      <AddUserPanel userCount={users.length} />

      {loadError ? (
        <div className="mt-6 border border-dashed border-line bg-field-deep/35 px-5 py-8">
          <p className="font-display text-2xl tracking-tight">
            Database not ready
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
            Run <span className="font-mono text-ink">npm run db:push</span> to
            create the users table, then add staff here.
          </p>
        </div>
      ) : users.length === 0 ? (
        <div className="mt-6 border border-dashed border-line bg-field-deep/35 px-5 py-8">
          <p className="font-display text-2xl tracking-tight">
            No staff users yet
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
            Add an admin or staff account to manage the control room.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line bg-screen">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="border-b border-line bg-field-deep/50 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium sm:px-5">Name</th>
                <th className="px-4 py-3 font-medium sm:px-5">Email</th>
                <th className="px-4 py-3 font-medium sm:px-5">Role</th>
                <th className="px-4 py-3 font-medium sm:px-5">Access</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-line last:border-b-0"
                >
                  <td className="px-4 py-3.5 font-medium sm:px-5">{user.name}</td>
                  <td className="px-4 py-3.5 text-ink-muted sm:px-5">
                    {user.email}
                  </td>
                  <td className="px-4 py-3.5 text-ink-muted sm:px-5">
                    {roleLabel(user.role)}
                  </td>
                  <td className="px-4 py-3.5 text-ink-muted sm:px-5">
                    {accessLabel(user.role)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
