import Link from "next/link";
import { Logo } from "@/app/components/logo";

const steps = [
  {
    n: "01",
    title: "Register with your JAMB number",
    body: "The same 12-character number on your slip is your seat here. No extra profile to invent.",
  },
  {
    n: "02",
    title: "Sit a full CBT mock",
    body: "Use of English plus three subjects, a countdown clock, and the same pressure as Post-UTME day.",
  },
  {
    n: "03",
    title: "Leave with a score",
    body: "See your total, subject breakdown, and the questions you missed before the real exam starts.",
  },
];

const subjects = [
  "Use of English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Government",
  "Economics",
  "Literature",
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/register"
              className="rounded-[3px] bg-signal px-3.5 py-2 text-sm font-semibold text-signal-ink transition-colors hover:bg-ink"
            >
              Start mock
            </Link>
            <Link
              href="/login"
              className="rounded-[3px] border border-ink/15 bg-screen/70 px-3.5 py-2 text-sm font-semibold text-ink backdrop-blur-sm transition-colors hover:border-ink hover:bg-ink hover:text-screen"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative isolate min-h-[100svh] overflow-hidden">
          <CbtHallVisual />

          <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20 lg:justify-center lg:pb-24">
            <div className="max-w-2xl">
              <p className="rise text-[11px] font-medium uppercase tracking-[0.3em] text-signal">
                2026 CBT mock · Hall open
              </p>
              <h1 className="font-display rise rise-delay-1 mt-4 text-[clamp(2.75rem,8vw,5.75rem)] leading-[0.92] tracking-tight text-ink">
                Expert PUTME Mock
              </h1>
              <p className="rise rise-delay-2 mt-5 max-w-lg text-xl leading-8 text-ink-muted sm:text-2xl">
                Sit the exam before the exam — sign up with your JAMB number for
                a timed CBT mock.
              </p>
              <div className="rise rise-delay-3 mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/register"
                  className="rounded-[3px] bg-ink px-5 py-3.5 text-sm font-semibold text-screen transition-colors hover:bg-signal"
                >
                  Start with your JAMB number
                </Link>
                <a
                  href="#how"
                  className="text-sm font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  How it works
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-signal">
            How it works
          </p>
          <h2 className="font-display mt-3 max-w-md text-4xl leading-none tracking-tight">
            Three steps. Same hall energy.
          </h2>
          <ol className="mt-10 divide-y divide-line border-y border-line">
            {steps.map((step) => (
              <li key={step.n} className="grid grid-cols-[auto_1fr] gap-5 py-6">
                <span className="font-mono text-sm text-signal">{step.n}</span>
                <div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1.5 max-w-xl text-ink-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="format"
          className="border-t border-line bg-field-deep/50"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-signal">
                  Exam format
                </p>
                <h2 className="font-display mt-3 text-4xl leading-none tracking-tight">
                  Built to feel like JAMB CBT.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-ink-muted">
                Choose four subjects that match the course on your JAMB slip.
              </p>
            </div>

            <ul className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
              {subjects.map((subject, index) => (
                <li key={subject} className="border-t border-line pt-3">
                  <span className="font-mono text-[11px] text-ink-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-1 font-medium">{subject}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex flex-col gap-1 sm:gap-0">
            <p>Expert PUTME Mock. A rehearsal hall for JAMB candidates.</p>
            <p>Not affiliated with JAMB or any university.</p>
          </div>
          <Link
            href="/admin"
            className="self-start rounded-[3px] border border-line px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-screen sm:self-auto"
          >
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}

function CbtHallVisual() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgb(13_110_106/0.18),transparent_55%)]" />
      <div className="absolute inset-y-0 right-0 w-full max-w-none lg:w-[62%]">
        <svg
          viewBox="0 0 900 900"
          className="h-full w-full object-cover opacity-90"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="desk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4dee7" />
              <stop offset="100%" stopColor="#b9c7d3" />
            </linearGradient>
            <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1a9b8e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0d6e6a" stopOpacity="0.55" />
            </linearGradient>
            <filter id="soft">
              <feGaussianBlur stdDeviation="18" />
            </filter>
          </defs>

          <ellipse
            cx="620"
            cy="280"
            rx="260"
            ry="160"
            fill="#0d6e6a"
            opacity="0.18"
            filter="url(#soft)"
            className="screen-glow"
          />

          {/* Floor perspective */}
          <path
            d="M40 780 L520 420 L900 520 L900 900 L40 900 Z"
            fill="url(#desk)"
            opacity="0.55"
          />
          <path
            d="M120 800 L540 460 M220 820 L620 480 M340 840 L700 510 M480 860 L780 540"
            stroke="#0b1c2c"
            strokeOpacity="0.08"
            strokeWidth="2"
            fill="none"
          />

          {/* Back row monitors */}
          <g transform="translate(430 290) scale(0.72)">
            <Monitor x={0} y={0} lit />
            <Monitor x={170} y={18} lit />
            <Monitor x={340} y={36} />
          </g>

          {/* Mid row */}
          <g transform="translate(360 390) scale(0.9)">
            <Monitor x={0} y={0} lit />
            <Monitor x={190} y={22} lit />
            <Monitor x={380} y={44} lit />
          </g>

          {/* Front candidate desk */}
          <g transform="translate(290 520)">
            <rect x="20" y="118" width="420" height="18" rx="2" fill="#0b1c2c" opacity="0.18" />
            <Monitor x={40} y={0} lit large />
            <rect x="70" y="150" width="140" height="10" rx="2" fill="#0b1c2c" opacity="0.22" />
            <rect x="95" y="168" width="70" height="8" rx="2" fill="#0b1c2c" opacity="0.14" />
          </g>

        </svg>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-field to-transparent lg:hidden" />
      <div className="absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-field via-field/85 to-transparent max-lg:hidden" />
    </div>
  );
}

function Monitor({
  x,
  y,
  lit = false,
  large = false,
}: {
  x: number;
  y: number;
  lit?: boolean;
  large?: boolean;
}) {
  const w = large ? 220 : 150;
  const h = large ? 140 : 96;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x="0"
        y="0"
        width={w}
        height={h}
        rx="6"
        fill="#102433"
      />
      <rect
        x="10"
        y="10"
        width={w - 20}
        height={h - 28}
        rx="3"
        fill={lit ? "url(#glass)" : "#1a3040"}
        className={lit ? "screen-glow" : undefined}
      />
      {lit ? (
        <>
          <rect
            x="22"
            y="24"
            width={w * 0.42}
            height="6"
            rx="1"
            fill="#e8f7f5"
            opacity="0.85"
          />
          <rect
            x="22"
            y="38"
            width={w * 0.58}
            height="4"
            rx="1"
            fill="#e8f7f5"
            opacity="0.35"
          />
          <rect
            x="22"
            y="48"
            width={w * 0.5}
            height="4"
            rx="1"
            fill="#e8f7f5"
            opacity="0.28"
          />
          <rect
            x="22"
            y="58"
            width={w * 0.36}
            height="4"
            rx="1"
            fill="#e8a317"
            opacity="0.7"
            className="cursor-blink"
          />
        </>
      ) : null}
      <rect
        x={w / 2 - 10}
        y={h - 14}
        width="20"
        height="8"
        rx="1"
        fill="#0b1c2c"
        opacity="0.45"
      />
      <rect
        x={w / 2 - 28}
        y={h + 2}
        width="56"
        height="8"
        rx="1"
        fill="#0b1c2c"
        opacity="0.2"
      />
    </g>
  );
}
