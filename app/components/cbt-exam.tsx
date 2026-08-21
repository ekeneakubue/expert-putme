"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  submitMockExam,
  type SubmitExamState,
} from "@/app/actions/exam";
import type { ExamQuestion } from "@/lib/exam";

const OPTIONS = ["A", "B", "C", "D"] as const;

const initial: SubmitExamState = {};

function formatClock(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function CbtExam({
  questions,
  durationMinutes,
  candidateName,
  attemptLabel,
}: {
  questions: ExamQuestion[];
  durationMinutes: number;
  candidateName: string;
  attemptLabel?: string;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, "A" | "B" | "C" | "D" | "">
  >(() =>
    Object.fromEntries(questions.map((question) => [question.id, ""] as const)),
  );
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [cameraState, setCameraState] = useState<
    "starting" | "live" | "blocked" | "missing"
  >("starting");
  const [state, action, pending] = useActionState(submitMockExam, initial);
  const autoSubmitted = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const current = questions[index];
  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );

  async function startCamera() {
    setCameraState("starting");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("missing");
      return;
    }

    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraState("live");
    } catch {
      setCameraState("blocked");
    }
  }

  useEffect(() => {
    void startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (secondsLeft > 0 || autoSubmitted.current) return;
    autoSubmitted.current = true;
    const form = document.getElementById(
      "exam-submit-form",
    ) as HTMLFormElement | null;
    form?.requestSubmit();
  }, [secondsLeft]);

  if (!current) return null;

  const lowTime = secondsLeft <= 5 * 60;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-monitor text-signal-ink">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{candidateName}</p>
            <p className="font-mono text-[11px] tracking-wider text-signal">
              {attemptLabel ?? "Expert PUTME Mock"}
            </p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <p
              className={`hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] sm:flex ${
                cameraState === "live" ? "text-signal" : "text-flare"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  cameraState === "live"
                    ? "animate-pulse bg-signal"
                    : "bg-flare"
                }`}
              />
              {cameraState === "live"
                ? "Camera on"
                : cameraState === "starting"
                  ? "Camera…"
                  : "Camera off"}
            </p>
            <p className="hidden text-sm text-signal-ink/65 sm:block">
              <span className="text-signal-ink">{answeredCount}</span>/
              {questions.length} answered
            </p>
            <p
              className={`font-mono text-lg tracking-wider ${
                lowTime ? "text-flare" : "text-signal"
              }`}
            >
              {formatClock(secondsLeft)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[1fr_16rem]">
        <section className="border border-line bg-screen p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
              Question {index + 1} of {questions.length}
            </p>
            <p className="rounded-[2px] bg-signal/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-signal">
              {current.subjectName}
            </p>
          </div>

          <h1 className="mt-5 text-lg leading-8 font-medium sm:text-xl sm:leading-9">
            {current.question}
          </h1>

          <div className="mt-8 space-y-3">
            {OPTIONS.map((letter, optionIndex) => {
              const selected = answers[current.id] === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() =>
                    setAnswers((currentAnswers) => ({
                      ...currentAnswers,
                      [current.id]: letter,
                    }))
                  }
                  className={`flex w-full items-start gap-3 border px-4 py-3.5 text-left transition-colors ${
                    selected
                      ? "border-signal bg-signal/10"
                      : "border-line bg-field/40 hover:border-signal/50"
                  }`}
                >
                  <span
                    className={`mt-0.5 font-mono text-sm ${
                      selected ? "text-signal" : "text-ink-muted"
                    }`}
                  >
                    {letter}.
                  </span>
                  <span className="leading-6">{current.options[optionIndex]}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => setIndex((value) => Math.max(0, value - 1))}
              className="rounded-[3px] border border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-screen disabled:opacity-40"
            >
              Previous
            </button>
            {index < questions.length - 1 ? (
              <button
                type="button"
                onClick={() =>
                  setIndex((value) => Math.min(questions.length - 1, value + 1))
                }
                className="rounded-[3px] bg-ink px-4 py-2.5 text-sm font-semibold text-screen transition-colors hover:bg-signal"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmSubmit(true)}
                className="rounded-[3px] bg-signal px-4 py-2.5 text-sm font-semibold text-signal-ink transition-colors hover:bg-ink"
              >
                Submit exam
              </button>
            )}
          </div>

          {state.error ? (
            <p
              role="alert"
              className="mt-4 border border-flare/40 bg-flare/10 px-3 py-2 text-sm"
            >
              {state.error}
            </p>
          ) : null}
        </section>

        <aside className="space-y-6">
          <div className="overflow-hidden border border-line bg-screen">
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                Proctor cam
              </p>
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
                  cameraState === "live" ? "text-signal" : "text-flare"
                }`}
              >
                {cameraState === "live"
                  ? "Live"
                  : cameraState === "starting"
                    ? "Starting"
                    : "Offline"}
              </span>
            </div>
            <div className="relative aspect-[4/3] bg-monitor">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`size-full object-cover ${
                  cameraState === "live" ? "opacity-100" : "opacity-0"
                }`}
              />
              {cameraState !== "live" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
                  <p className="text-sm text-signal-ink/80">
                    {cameraState === "starting"
                      ? "Turning on your camera…"
                      : cameraState === "missing"
                        ? "This browser cannot access a camera."
                        : "Camera permission is required for this mock."}
                  </p>
                  {cameraState === "blocked" || cameraState === "missing" ? (
                    <button
                      type="button"
                      onClick={() => void startCamera()}
                      className="rounded-[3px] bg-signal px-3 py-2 text-xs font-semibold text-signal-ink transition-colors hover:bg-ink"
                    >
                      Enable camera
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="border border-line bg-screen p-4 sm:p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
              Navigator
            </p>
            <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-4">
              {questions.map((question, questionIndex) => {
                const answered = Boolean(answers[question.id]);
                const active = questionIndex === index;
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setIndex(questionIndex)}
                    className={`aspect-square rounded-[2px] font-mono text-xs font-semibold transition-colors ${
                      active
                        ? "bg-ink text-screen"
                        : answered
                          ? "bg-signal/20 text-signal"
                          : "bg-field-deep/50 text-ink-muted hover:bg-field-deep"
                    }`}
                  >
                    {questionIndex + 1}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setConfirmSubmit(true)}
              className="mt-5 w-full rounded-[3px] border border-line px-3 py-2.5 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-screen"
            >
              Submit exam
            </button>
          </div>
        </aside>
      </main>

      <form id="exam-submit-form" action={action} className="hidden">
        <input type="hidden" name="answers" value={JSON.stringify(answers)} />
      </form>

      {confirmSubmit ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            onClick={() => setConfirmSubmit(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-title"
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[4px] border border-line bg-screen shadow-[0_28px_70px_-36px_rgba(11,28,44,0.55)]"
          >
            <div className="border-b border-line bg-monitor px-5 py-4 text-signal-ink sm:px-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-signal">
                Submit
              </p>
              <h2
                id="submit-title"
                className="font-display mt-1 text-2xl tracking-tight"
              >
                End the mock now?
              </h2>
            </div>
            <div className="space-y-5 px-5 py-5 sm:px-6">
              <p className="text-sm leading-6 text-ink-muted">
                You have answered {answeredCount} of {questions.length}{" "}
                questions. Unanswered items will score as wrong.
              </p>
              <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">
                <button
                  type="button"
                  onClick={() => setConfirmSubmit(false)}
                  className="rounded-[3px] border border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-screen"
                >
                  Keep writing
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    const form = document.getElementById(
                      "exam-submit-form",
                    ) as HTMLFormElement | null;
                    form?.requestSubmit();
                  }}
                  className="rounded-[3px] bg-signal px-4 py-2.5 text-sm font-semibold text-signal-ink transition-colors hover:bg-ink disabled:opacity-70"
                >
                  {pending ? "Submitting…" : "Submit answers"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
