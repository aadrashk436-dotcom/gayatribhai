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
            y: 40,
            autoAlpha: 0,
            duration: 1,
            ease: "power3.out",
            delay: Number(el.dataset.revealDelay || 0),
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          })
        })

        gsap.utils.toArray<HTMLElement>("[data-reveal-text]").forEach((el) => {
          gsap.from(el.querySelectorAll(".line-inner"), {
            yPercent: 110,
            duration: 1.1,
            stagger: 0.08,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          })
        })

        gsap.utils.toArray<HTMLElement>("[data-reveal-img]").forEach((el) => {
          const img = el.querySelector("img")
          const tl = gsap.timeline({
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          })
          tl.fromTo(
            el,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut" },
          )
          if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.6, ease: "expo.out" }, 0.2)
        })

        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const amount = Number(el.dataset.parallax || 12)
          gsap.fromTo(
            el,
            { yPercent: -amount },
            {
              yPercent: amount,
              ease: "none",
              scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
            },
          )
        })

        gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
          gsap.from(group.children, {
            y: 50,
            autoAlpha: 0,
            duration: 0.9,
            stagger: 0.09,
            ease: "power3.out",
            scrollTrigger: { trigger: group, start: "top 85%", once: true },
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
