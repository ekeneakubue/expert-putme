import type { Metadata } from "next";
import { listAccounts } from "@/lib/accounts";
import { formatWhen } from "@/lib/format";
import { formatJambReg } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Candidates",
};

export default async function AdminCandidatesPage() {
  let accounts: Awaited<ReturnType<typeof listAccounts>> = [];
  let loadError = false;

  try {
    accounts = await listAccounts();
  } catch {
    loadError = true;
  }

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-signal">
        Candidates
      </p>
      <h1 className="font-display mt-3 text-4xl leading-none tracking-tight sm:text-5xl">
        Registered seats
      </h1>
      <p className="mt-4 max-w-xl text-ink-muted leading-7">
        Every JAMB candidate who created a seat for the mock.
      </p>

      <p className="mt-8 text-sm text-ink-muted">
        {loadError
          ? "Database not ready"
          : accounts.length === 0
            ? "No candidates yet"
            : `${accounts.length} seat${accounts.length === 1 ? "" : "s"}`}
      </p>

      {loadError ? (
        <div className="mt-4 border border-dashed border-line bg-field-deep/35 px-5 py-8">
          <p className="font-display text-2xl tracking-tight">
            Database not ready
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
            Run <span className="font-mono text-ink">npm run db:push</span> to
            create the candidates table.
          </p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="mt-4 border border-dashed border-line bg-field-deep/35 px-5 py-8">
          <p className="font-display text-2xl tracking-tight">
            Waiting for the first seat
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
            Candidates who sign up with their JAMB number will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto border border-line bg-screen">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line bg-field-deep/50 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium sm:px-5">Name</th>
                <th className="px-4 py-3 font-medium sm:px-5">JAMB number</th>
                <th className="px-4 py-3 font-medium sm:px-5">Phone</th>
                <th className="px-4 py-3 font-medium sm:px-5">Registered</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr
                  key={account.jambReg}
                  className="border-b border-line last:border-b-0"
                >
                  <td className="px-4 py-3.5 font-medium sm:px-5">
                    {account.fullName}
                  </td>
                  <td className="px-4 py-3.5 font-mono tracking-wider sm:px-5">
                    {formatJambReg(account.jambReg)}
                  </td>
                  <td className="px-4 py-3.5 text-ink-muted sm:px-5">
                    {account.phone}
                  </td>
                  <td className="px-4 py-3.5 text-ink-muted sm:px-5">
                    {formatWhen(account.createdAt)}
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
