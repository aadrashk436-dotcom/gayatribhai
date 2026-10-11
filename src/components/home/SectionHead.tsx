import Link from "next/link"
import { SplitLines } from "./useReveal"

export default function SectionHead({
  kicker,
  title,
  href,
  linkLabel = "View all",
}: {
  kicker: string
  title: string[]
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 md:mb-12 md:gap-6">
      <div>
        <p data-reveal className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.3em] text-accent md:mb-3 md:text-xs">
          {kicker}
        </p>
        <h2
          data-reveal-text
          className="font-display text-[clamp(1.9rem,6.5vw,4.5rem)] font-normal leading-[0.98] tracking-[-0.02em] text-foreground"
        >
          <SplitLines lines={title} />
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          data-reveal
          className="group mb-2 inline-flex shrink-0 items-center gap-2 border-b border-foreground pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground md:text-[13px]"
        >
          {linkLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            <path d="M5 12h14m-5-5 5 5-5 5" />
          </svg>
        </Link>
      )}
    </div>
  )
}
