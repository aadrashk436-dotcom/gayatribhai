"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { SplitLines } from "./useReveal"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const STATS = [
  { value: 50, suffix: "", label: "Pieces per batch" },
  { value: 18, suffix: "h", label: "Of hand embroidery" },
  { value: 100, suffix: "%", label: "Natural fibre" },
]

export default function CraftStory() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".stat-num").forEach((el) => {
        const target = Number(el.dataset.value)
        const counter = { v: 0 }
        gsap.to(counter, {
          v: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(counter.v))
          },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="grid items-center gap-8 px-5 py-14 sm:py-20 md:grid-cols-2 md:gap-16 md:px-10 md:py-28 lg:px-14">
      <div className="relative">
        <div data-reveal-img className="relative aspect-[4/5] overflow-hidden rounded-sm">
          <Image
            src="/assets/banners/craft-detail.jpg"
            alt="Artisan hand-embroidering a leaf motif on linen"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div data-reveal-img className="absolute -bottom-8 -right-2 hidden aspect-[3/4] w-[38%] overflow-hidden rounded-sm border-[6px] border-background md:block">
          <Image
            src="/assets/site_media/instagram_lookbook_ing3.jpg"
            alt="Embroidered shirt detail"
            fill
            sizes="20vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="md:pl-6">
        <p data-reveal className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.3em] text-accent md:mb-4 md:text-xs">
          The atelier
        </p>
        <h2 data-reveal-text className="font-display text-[clamp(2.1rem,6vw,4.8rem)] leading-[0.98] tracking-[-0.02em] text-foreground">
          <SplitLines lines={["Made by hand.", "Worn for years."]} />
        </h2>
        <p data-reveal className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base md:text-lg">
          Every shirt is cut, stitched and embroidered by our artisans in Surat.
        </p>

        <dl data-stagger className="mt-8 grid grid-cols-3 gap-2 border-t border-border pt-6 sm:mt-10 sm:gap-4 sm:pt-8">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-3xl leading-none text-foreground sm:text-4xl md:text-5xl">
                <span className="stat-num" data-value={s.value}>
                  {s.value}
                </span>
                {s.suffix}
              </dd>
              <p aria-hidden="true" className="mt-1.5 text-[11px] leading-snug text-muted-foreground sm:mt-2 sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </dl>

        <Link
          data-reveal
          href="/blog"
          className="group mt-10 inline-flex items-center gap-2 border-b border-foreground pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground md:text-[13px]"
        >
          Our story
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            <path d="M5 12h14m-5-5 5 5-5 5" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
