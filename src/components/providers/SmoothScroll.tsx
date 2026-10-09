"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

let lenisInstance: Lenis | null = null

export function getLenis() {
  return lenisInstance
}

export default function SmoothScroll() {
  const pathname = usePathname()

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    })
    lenisInstance = lenis

    lenis.on("scroll", ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisInstance = null
    }
  }, [])

  useEffect(() => {
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true, force: true })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    }
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => window.clearTimeout(id)
  }, [pathname])

  return null
}
