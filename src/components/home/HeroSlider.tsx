"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { getImageProps } from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

type Slide = {
  id: string
  kicker: string
  lines: [string, string]
  cta: string
  desktop: string
  mobile: string
  alt: string
  tone: "light" | "dark"
}

const SLIDES: Slide[] = [
  {
    id: "atelier",
    kicker: "Summer Atelier '26",
    lines: ["Woven", "by hand."],
    cta: "Shop linen",
    desktop: "/assets/site_banners/slide1_desktop.jpg",
    mobile: "/assets/site_banners/slide1_mobile.jpg",
    alt: "Model in an ivory hand-embroidered linen shirt on a seaside terrace",
    tone: "light",
  },
  {
    id: "resort",
    kicker: "The Resort Edit",
    lines: ["Coastal", "state."],
    cta: "Shop resort",
    desktop: "/assets/site_banners/slide2_desktop.jpg",
    mobile: "/assets/site_banners/slide2_mobile.jpg",
    alt: "Model relaxing by the sea in a blue embroidered cuban collar shirt",
    tone: "light",
  },
  {
    id: "studio",
    kicker: "New Arrivals",
    lines: ["Rust &", "ease."],
    cta: "Shop new in",
    desktop: "/assets/banners/hero-studio-desktop.jpg",
    mobile: "/assets/banners/hero-studio-mobile.jpg",
    alt: "Model walking in a terracotta linen cuban collar shirt",
    tone: "dark",
  },
  {
    id: "evening",
    kicker: "After Dark",
    lines: ["Evening", "tailoring."],
    cta: "Shop evening",
    desktop: "/assets/banners/hero-evening-desktop.jpg",
    mobile: "/assets/site_banners/slide3_mobile.jpg",
    alt: "Model on a city rooftop at dusk in a navy embroidered shirt",
    tone: "light",
  },
]

const AUTOPLAY = 6

function SlidePicture({ slide, priority }: { slide: Slide; priority: boolean }) {
  const common = { alt: slide.alt, sizes: "100vw", quality: 78 }
  const {
    props: { srcSet: desktopSet, src: desktopSrc },
  } = getImageProps({ ...common, src: slide.desktop, width: 1376, height: 768 })
  const {
    props: { srcSet: mobileSet, ...rest },
  } = getImageProps({
    ...common,
    src: slide.mobile,
    width: 768,
    height: 1376,
    loading: priority ? "eager" : "lazy",
    fetchPriority: priority ? "high" : "auto",
  })

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktopSet ?? desktopSrc} />
      <source media="(max-width: 767px)" srcSet={mobileSet ?? rest.src} />
      <img
        {...rest}
        alt={slide.alt}
        className="hero-img absolute inset-0 h-full w-full object-cover object-[center_30%] will-change-transform md:object-[70%_center]"
      />
    </picture>
  )
}

export default function HeroSlider() {
  const root = useRef<HTMLElement>(null)
  const slideEls = useRef<(HTMLDivElement | null)[]>([])
  const barEls = useRef<(HTMLSpanElement | null)[]>([])
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const busy = useRef(false)
  const progress = useRef<gsap.core.Tween | null>(null)
  const paused = useRef(false)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)

  const startProgress = useCallback((index: number) => {
    progress.current?.kill()
    barEls.current.forEach((bar, i) => {
      if (bar) gsap.set(bar, { scaleX: i < index ? 1 : 0 })
    })
    const bar = barEls.current[index]
    if (!bar) return
    progress.current = gsap.to(bar, {
      scaleX: 1,
      duration: AUTOPLAY,
      ease: "none",
      onComplete: () => goTo((activeRef.current + 1) % SLIDES.length, 1),
    })
    if (paused.current) progress.current.pause()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goTo = useCallback(
    (next: number, dir: 1 | -1) => {
      const current = activeRef.current
      if (busy.current || next === current) return
      const cur = slideEls.current[current]
      const nxt = slideEls.current[next]
      if (!cur || !nxt) return
      busy.current = true
      activeRef.current = next
      setActive(next)
      progress.current?.kill()

      const curImg = cur.querySelector(".hero-img")
      const nxtImg = nxt.querySelector(".hero-img")
      const curLines = cur.querySelectorAll(".hero-reveal")
      const nxtLines = nxt.querySelectorAll(".hero-reveal")

      gsap.set(nxt, {
        zIndex: 3,
        visibility: "visible",
        clipPath: dir > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)",
      })
      gsap.set(cur, { zIndex: 2 })
      gsap.set(nxtLines, { yPercent: 115 })

      gsap
        .timeline({
          defaults: { ease: "expo.inOut" },
          onComplete: () => {
            gsap.set(cur, { zIndex: 1, visibility: "hidden", clipPath: "inset(0% 0% 0% 0%)" })
            gsap.set(curImg, { xPercent: 0 })
            gsap.set(curLines, { yPercent: 0 })
            busy.current = false
            startProgress(next)
          },
        })
        .to(curLines, { yPercent: -115, duration: 0.6, stagger: 0.04, ease: "power3.in" }, 0)
        .to(nxt, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.25 }, 0.1)
        .to(curImg, { xPercent: -16 * dir, duration: 1.25 }, 0.1)
        .fromTo(
          nxtImg,
          { scale: 1.28, xPercent: 12 * dir },
          { scale: 1.06, xPercent: 0, duration: 1.7, ease: "expo.out" },
          0.1,
        )
        .to(nxtLines, { yPercent: 0, duration: 1.1, stagger: 0.07, ease: "expo.out" }, 0.75)
    },
    [startProgress],
  )

  useGSAP(
    () => {
      const first = slideEls.current[0]
      if (!first) return
      slideEls.current.forEach((el, i) => {
        if (el && i !== 0) gsap.set(el, { visibility: "hidden", zIndex: 1 })
      })
      gsap.set(first, { zIndex: 2, visibility: "visible" })

      gsap
        .timeline({ onComplete: () => startProgress(0) })
        .fromTo(
          first.querySelector(".hero-img"),
          { scale: 1.3 },
          { scale: 1.06, duration: 2, ease: "expo.out" },
        )
        .from(
          first.querySelectorAll(".hero-reveal"),
          { yPercent: 115, duration: 1.2, stagger: 0.08, ease: "expo.out" },
          0.25,
        )
        .from(".hero-ui", { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.08, ease: "power3.out" }, 0.6)

      gsap.to(".hero-stage", {
        yPercent: 18,
        ease: "none",
        force3D: true,
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      })
      gsap.to(".hero-copy-wrap", {
        autoAlpha: 0,
        y: -60,
        ease: "none",
        force3D: true,
        scrollTrigger: { trigger: root.current, start: "top top", end: "60% top", scrub: true },
      })

      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        onLeave: () => {
          progress.current?.pause()
        },
        onEnterBack: () => {
          if (!paused.current) progress.current?.resume()
        },
      })
    },
    { scope: root },
  )

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) progress.current?.pause()
      else if (!paused.current) progress.current?.resume()
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      progress.current?.kill()
    }
  }, [])

  const next = () => goTo((activeRef.current + 1) % SLIDES.length, 1)
  const prev = () => goTo((activeRef.current - 1 + SLIDES.length) % SLIDES.length, -1)

  const setPaused = (value: boolean) => {
    paused.current = value
    if (value) progress.current?.pause()
    else progress.current?.resume()
  }

  const onPointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const start = pointerStart.current
    pointerStart.current = null
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next()
      else prev()
    }
  }

  const upcoming = SLIDES[(active + 1) % SLIDES.length]
  const isDarkTone = SLIDES[active].tone === "dark"

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative h-[calc(100svh-100px)] min-h-[560px] w-full touch-pan-y select-none overflow-hidden bg-[#111] md:h-[calc(100svh-112px)] md:min-h-[620px]"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-stage absolute inset-0">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            ref={(el) => {
              slideEls.current[i] = el
            }}
            className="absolute inset-0 overflow-hidden"
            style={{ zIndex: i === 0 ? 2 : 1, visibility: i === 0 ? "visible" : "hidden" }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${SLIDES.length}`}
            aria-hidden={i !== active}
          >
            <SlidePicture slide={slide} priority={i === 0} />
            <div
              className={`pointer-events-none absolute inset-0 ${
                slide.tone === "dark"
                  ? "bg-gradient-to-t from-[#f1e4d2]/80 via-transparent to-transparent md:bg-gradient-to-r md:from-[#efe2cf]/70 md:via-transparent"
                  : "bg-gradient-to-t from-black/70 via-black/10 to-black/20 md:bg-gradient-to-r md:from-black/55 md:via-black/5 md:to-transparent"
              }`}
            />

            <div className="hero-copy-wrap absolute inset-x-0 bottom-0 z-10 px-5 pb-24 md:inset-y-0 md:left-0 md:right-auto md:flex md:w-[52%] md:flex-col md:justify-end md:px-14 md:pb-28 lg:px-20">
              <div className={slide.tone === "dark" ? "text-[#1a1410]" : "text-white"}>
                <div className="overflow-hidden">
                  <p className="hero-reveal mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] opacity-90 md:text-xs">
                    {slide.kicker}
                  </p>
                </div>
                <h2 className="font-display text-[clamp(3.2rem,13vw,4.6rem)] font-normal leading-[0.92] tracking-[-0.02em] md:text-[clamp(4.5rem,8vw,8.5rem)]">
                  {slide.lines.map((line, li) => (
                    <span key={line} className="block overflow-hidden pb-[0.08em]">
                      <span className={`hero-reveal block ${li === 1 ? "italic" : ""}`}>{line}</span>
                    </span>
                  ))}
                </h2>
                <div className="mt-7 overflow-hidden md:mt-9">
                  <div className="hero-reveal">
                    <Link
                      href="/shop"
                      className={`group inline-flex h-12 items-center gap-3 rounded-full px-7 text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors md:h-14 md:px-9 ${
                        slide.tone === "dark"
                          ? "bg-[#1a1410] text-white hover:bg-black"
                          : "bg-white text-[#111] hover:bg-[#f1ece2]"
                      }`}
                    >
                      {slide.cta}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      >
                        <path d="M5 12h14m-5-5 5 5-5 5" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`hero-ui pointer-events-none absolute inset-x-5 bottom-8 z-20 flex items-center gap-2 md:inset-x-auto md:bottom-12 md:left-14 md:w-[360px] lg:left-20 ${
          isDarkTone ? "text-[#1a1410]" : "text-white"
        }`}
      >
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(i, i > active ? 1 : -1)}
            className="pointer-events-auto relative h-8 flex-1 cursor-pointer"
            aria-label={`Go to slide ${i + 1}: ${slide.kicker}`}
            aria-current={i === active}
          >
            <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 overflow-hidden rounded-full bg-current/25">
              <span
                ref={(el) => {
                  barEls.current[i] = el
                }}
                className="absolute inset-0 origin-left scale-x-0 bg-current"
              />
            </span>
          </button>
        ))}
      </div>

      <div
        className={`hero-ui absolute right-5 top-5 z-20 font-display text-sm tabular-nums md:right-14 md:top-auto md:bottom-12 md:text-base ${
          isDarkTone ? "text-[#1a1410]" : "text-white"
        }`}
        aria-live="polite"
      >
        <span className="text-2xl md:text-3xl">{String(active + 1).padStart(2, "0")}</span>
        <span className="opacity-60">{` / ${String(SLIDES.length).padStart(2, "0")}`}</span>
      </div>

      <div className="hero-ui absolute bottom-12 right-36 z-20 hidden items-center gap-3 md:flex lg:right-40">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className={`flex size-12 items-center justify-center rounded-full border backdrop-blur-sm transition-colors ${
            isDarkTone
              ? "border-[#1a1410]/30 text-[#1a1410] hover:bg-[#1a1410] hover:text-white"
              : "border-white/40 text-white hover:bg-white hover:text-[#111]"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M19 12H5m5-5-5 5 5 5" />
          </svg>
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className={`flex size-12 items-center justify-center rounded-full border backdrop-blur-sm transition-colors ${
            isDarkTone
              ? "border-[#1a1410]/30 text-[#1a1410] hover:bg-[#1a1410] hover:text-white"
              : "border-white/40 text-white hover:bg-white hover:text-[#111]"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M5 12h14m-5-5 5 5-5 5" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        onClick={next}
        className="hero-ui group absolute right-14 top-1/2 z-20 hidden w-44 -translate-y-1/2 overflow-hidden rounded-sm text-left lg:block xl:w-52"
        aria-label={`Next: ${upcoming.kicker}`}
      >
        <span className="relative block aspect-[3/4] overflow-hidden">
          {SLIDES.map((slide) => (
            <img
              key={slide.id}
              src={getImageProps({ src: slide.mobile, width: 768, height: 1376, alt: "", sizes: "220px", quality: 60 }).props.src}
              alt=""
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
                slide.id === upcoming.id ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute bottom-3 left-3 right-3 text-white">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">Next</span>
            <span className="mt-1 block font-display text-lg leading-tight">{upcoming.kicker}</span>
          </span>
        </span>
      </button>
    </section>
  )
}
