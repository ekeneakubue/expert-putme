"use client";

import { MOCK_FEE_NAIRA } from "@/lib/mock";

type SlipData = {
  fullName: string;
  jambReg: string;
  subjects: string[];
  paidAt?: string;
  reference?: string;
  amount?: number;
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildSlipHtml(data: SlipData) {
  const paidLabel = data.paidAt
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(data.paidAt))
    : "Confirmed";

  const subjects = data.subjects
    .map(
      (name, index) =>
        `<li><span>${String(index + 1).padStart(2, "0")}</span> ${escapeHtml(name)}</li>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Expert PUTME Mock Slip — ${escapeHtml(data.jambReg)}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px;
      font-family: "Segoe UI", system-ui, sans-serif;
      color: #0b1c2c;
      background: #f4f7f9;
    }
    .slip {
      max-width: 640px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #c9d5df;
      padding: 28px 32px;
    }
    .brand {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin: 0;
    }
    .tag {
      margin: 6px 0 0;
      font-size: 11px;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: #5b6b7a;
    }
    h2 {
      margin: 28px 0 8px;
      font-size: 22px;
      letter-spacing: -0.02em;
    }
    .meta { color: #5b6b7a; font-size: 14px; margin: 0 0 24px; }
    dl { margin: 0; display: grid; gap: 16px; }
    dt {
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #5b6b7a;
      margin: 0 0 4px;
    }
    dd { margin: 0; font-size: 16px; font-weight: 600; }
    .mono { font-family: ui-monospace, Consolas, monospace; letter-spacing: 0.08em; }
    ul { list-style: none; padding: 0; margin: 8px 0 0; display: grid; gap: 8px; }
    li { border-top: 1px solid #e3ebf1; padding-top: 8px; font-weight: 600; }
    li span { font-family: ui-monospace, Consolas, monospace; color: #0d7a6f; margin-right: 10px; font-size: 12px; }
    .foot {
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1px solid #e3ebf1;
      font-size: 12px;
      color: #5b6b7a;
      line-height: 1.5;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .slip { border: none; max-width: none; }
    }
  </style>
</head>
<body>
  <article class="slip">
    <p class="brand">Expert PUTME</p>
    <p class="tag">Mock · CBT · Candidate slip</p>
    <h2>Mock exam admission slip</h2>
    <p class="meta">Present this slip at the hall. Keep a copy on your device.</p>
    <dl>
      <div>
        <dt>Full name</dt>
        <dd>${escapeHtml(data.fullName)}</dd>
      </div>
      <div>
        <dt>JAMB registration number</dt>
        <dd class="mono">${escapeHtml(data.jambReg)}</dd>
      </div>
      <div>
        <dt>Payment</dt>
        <dd>${formatNaira(data.amount ?? MOCK_FEE_NAIRA)} · Paid ${escapeHtml(paidLabel)}</dd>
      </div>
      ${
        data.reference
          ? `<div><dt>Payment reference</dt><dd class="mono">${escapeHtml(data.reference)}</dd></div>`
          : ""
      }
      <div>
        <dt>Subjects</dt>
        <dd>
          <ul>${subjects}</ul>
        </dd>
      </div>
    </dl>
    <p class="foot">
      Expert PUTME Mock · Bring a valid ID matching this JAMB number.
      Your seat is unlocked after payment — start the timed CBT from your candidate desk when ready.
    </p>
  </article>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function DownloadMockSlipButton({ data }: { data: SlipData }) {
  function downloadSlip() {
    const html = buildSlipHtml(data);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeReg = data.jambReg.replace(/[^a-zA-Z0-9]/g, "");
    link.href = url;
    link.download = `expert-putme-mock-slip-${safeReg || "candidate"}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={downloadSlip}
      className="rounded-[3px] border border-line px-5 py-3.5 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-screen sm:min-w-[14rem]"
    >
      Download mock slip
    </button>
  );
}
