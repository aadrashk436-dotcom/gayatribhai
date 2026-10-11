"use client"

import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const ITEMS = ["Hand embroidered", "Pure linen", "Made in Surat", "Limited batches", "Free shipping ₹1,999+", "7-day returns"]

export default function Marquee() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const loop = gsap.to(".marquee-track", {
        xPercent: -50,
        duration: 32,
        ease: "none",
        repeat: -1,
      })

      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => loop.play(),
        onLeave: () => loop.pause(),
        onEnterBack: () => loop.play(),
        onLeaveBack: () => loop.pause(),
      })
    },
    { scope: root },
  )

  const row = [...ITEMS, ...ITEMS]

  return (
    <div ref={root} className="overflow-hidden border-y border-border bg-background py-4 md:py-5" aria-label="Brand highlights">
      <div className="marquee-track flex w-max items-center whitespace-nowrap will-change-transform">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
            {row.map((item, i) => (
              <span key={`${item}-${i}`} className="flex items-center">
                <span className="px-6 font-display text-xl italic text-foreground md:px-10 md:text-3xl">{item}</span>
                <span className="size-1.5 rounded-full bg-accent" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
