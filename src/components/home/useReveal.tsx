"use client"

import type { RefObject } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 20,
            autoAlpha: 0,
            duration: 0.65,
            ease: "power2.out",
            force3D: true,
            delay: Number(el.dataset.revealDelay || 0),
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          })
        })

        gsap.utils.toArray<HTMLElement>("[data-reveal-text]").forEach((el) => {
          gsap.from(el.querySelectorAll(".line-inner"), {
            yPercent: 100,
            duration: 0.8,
            stagger: 0.05,
            ease: "power2.out",
            force3D: true,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          })
        })

        gsap.utils.toArray<HTMLElement>("[data-reveal-img]").forEach((el) => {
          const img = el.querySelector("img")
          const tl = gsap.timeline({
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          })
          tl.fromTo(
            el,
            { autoAlpha: 0, y: 25 },
            { autoAlpha: 1, y: 0, duration: 0.75, ease: "power2.out", force3D: true },
          )
          if (img) tl.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 1.1, ease: "power2.out", force3D: true }, 0.1)
        })

        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const amount = Number(el.dataset.parallax || 12)
          gsap.fromTo(
            el,
            { yPercent: -amount },
            {
              yPercent: amount,
              ease: "none",
              force3D: true,
              scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.8 },
            },
          )
        })

        gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
          gsap.from(group.children, {
            y: 25,
            autoAlpha: 0,
            duration: 0.6,
            stagger: 0.04,
            ease: "power2.out",
            force3D: true,
            scrollTrigger: { trigger: group, start: "top 88%", once: true },
          })
        })
      })
      return () => mm.revert()
    },
    { scope },
  )
}

export function SplitLines({ lines, italicLast = true }: { lines: string[]; italicLast?: boolean }) {
  return lines.map((line, i) => (
    <span key={`${line}-${i}`} className="block overflow-hidden pb-[0.08em]">
      <span className={`line-inner block ${italicLast && i === lines.length - 1 && lines.length > 1 ? "italic" : ""}`}>
        {line}
      </span>
    </span>
  ))
}
