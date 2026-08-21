import Image from "next/image";
import Link from "next/link";

export function Logo({
  large = false,
  inverse = false,
}: {
  large?: boolean;
  inverse?: boolean;
}) {
  const size = large ? 44 : 32;

  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <Image
        src="/images/logo.png"
        alt=""
        width={size}
        height={size}
        className={`object-contain transition-transform group-hover:scale-105 ${
          large ? "size-11" : "size-8"
        }`}
        priority
      />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display tracking-tight ${
            inverse ? "text-signal-ink" : "text-ink"
          } ${large ? "text-[1.85rem]" : "text-[1.2rem]"}`}
        >
          Expert PUTME
        </span>
        <span
          className={`mt-1 font-medium uppercase tracking-[0.28em] ${
            inverse ? "text-signal-ink/55" : "text-ink-muted"
          } ${large ? "text-[11px]" : "text-[9px]"}`}
        >
          Mock · CBT
        </span>
      </span>
    </Link>
  );
}
