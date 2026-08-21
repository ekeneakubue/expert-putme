"use client";

import { formatJambReg } from "@/lib/validation";

export type MockResultData = {
  correct: number;
  attempted: number;
  total: number;
  percent: number;
  subjects: Array<{
    subjectId: string;
    name: string;
    correct: number;
    total: number;
  }>;
  submittedAt: string;
  fullName: string;
  jambReg: string;
  attemptNumber?: number;
  attemptsAllowed?: number;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function buildResultHtml(data: MockResultData) {
  const jamb = formatJambReg(data.jambReg);
  const attemptLine = data.attemptNumber
    ? `Attempt ${data.attemptNumber}${
        data.attemptsAllowed ? ` of ${data.attemptsAllowed}` : ""
      } · `
    : "";
  const subjects = data.subjects
    .map(
      (subject) =>
        `<li>
          <span class="name">${escapeHtml(subject.name)}</span>
          <span class="score mono">${subject.correct}/${subject.total}</span>
        </li>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Expert PUTME Mock Result — ${escapeHtml(jamb)}</title>
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
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .card {
      border: 1px solid #e3ebf1;
      padding: 14px 16px;
    }
    .card dt {
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #5b6b7a;
      margin: 0 0 6px;
    }
    .card dd {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.03em;
    }
    .signal { color: #0d6e6a; }
    .mono { font-family: ui-monospace, Consolas, monospace; }
    h3 {
      margin: 0 0 12px;
      font-size: 16px;
    }
    ul { list-style: none; padding: 0; margin: 0; }
    li {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      border-top: 1px solid #e3ebf1;
      padding: 10px 0;
      font-weight: 600;
    }
    li .score { color: #5b6b7a; font-weight: 500; }
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
    <p class="tag">Mock · CBT · Result slip</p>
    <h2>Mock exam result</h2>
    <p class="meta">
      ${escapeHtml(attemptLine)}${escapeHtml(data.fullName)} ·
      <span class="mono">${escapeHtml(jamb)}</span> ·
      Submitted ${escapeHtml(formatWhen(data.submittedAt))}
    </p>
    <dl class="grid">
      <div class="card">
        <dt>Score</dt>
        <dd>${data.correct}/${data.total}</dd>
      </div>
      <div class="card">
        <dt>Percent</dt>
        <dd class="signal">${data.percent}%</dd>
      </div>
      <div class="card">
        <dt>Attempted</dt>
        <dd>${data.attempted}</dd>
      </div>
    </dl>
    <h3>Subject breakdown</h3>
    <ul>${subjects}</ul>
    <p class="foot">
      Expert PUTME Mock result slip. Keep a copy for your records.
      This rehearsal score is not an official JAMB or university result.
    </p>
  </article>
</body>
</html>`;
}

export function DownloadMockResultButton({ data }: { data: MockResultData }) {
  function downloadResult() {
    const html = buildResultHtml(data);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeReg = data.jambReg.replace(/[^a-zA-Z0-9]/g, "");
    link.href = url;
    link.download = `expert-putme-mock-result-${safeReg || "candidate"}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={downloadResult}
      className="rounded-[3px] border border-line px-5 py-3 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-screen"
    >
      Download mock result
    </button>
  );
}
