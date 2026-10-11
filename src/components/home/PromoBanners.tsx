import Image from "next/image"
import Link from "next/link"
import { SplitLines } from "./useReveal"

function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="transition-transform group-hover:translate-x-1">
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  )
}

export function WideBanner() {
  return (
    <section className="px-3 md:px-6">
      <Link href="/shop" className="group relative block h-[72svh] min-h-[460px] max-h-[620px] overflow-hidden rounded-sm md:h-[clamp(500px,62vh,680px)] md:max-h-none">
        <div data-parallax="10" className="absolute inset-0 md:-inset-y-[12%] md:inset-x-0">
          <picture>
            <source media="(min-width: 768px)" srcSet="/assets/banners/promo-linen-wide.jpg" />
            <img
              src="/assets/banners/auth-portrait.jpg"
              alt="Model in tailored French linen in sunlit courtyard"
              className="h-full w-full object-cover object-[center_top] md:object-[75%_top]"
            />
          </picture>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 via-40% to-transparent md:bg-gradient-to-r md:from-black/60 md:via-black/20 md:to-transparent" />
        <div className="absolute inset-x-5 bottom-7 text-white sm:bottom-8 sm:left-8 md:inset-x-auto md:bottom-auto md:left-14 md:top-1/2 md:-translate-y-1/2">
          <p data-reveal className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90 md:mb-4 md:text-xs">
            Linen season
          </p>
          <h2 data-reveal-text className="font-display text-[clamp(2.3rem,8vw,5.5rem)] leading-[0.96] tracking-[-0.02em]">
            <SplitLines lines={["Breathe", "easy."]} />
          </h2>
          <span data-reveal className="mt-6 inline-flex h-11 items-center gap-2.5 rounded-full bg-white px-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#111] shadow-md transition-transform active:scale-95 md:mt-8 md:h-12 md:px-7 md:text-[13px]">
            Shop linen <Arrow />
          </span>
        </div>
      </Link>
    </section>
  )
}

const DUO = [
  {
    title: "After Dark",
    kicker: "Evening edit",
    image: "/assets/banners/after-dark-portrait.jpg",
    alt: "Model in a black linen shirt with gold embroidery on a rooftop at night",
  },
  {
    title: "Under ₹2,499",
    kicker: "Everyday picks",
    image: "/assets/banners/folded-shirts.jpg",
    alt: "Folded linen shirts in sage, blue, terracotta and ivory",
  },
]

export function DuoBanners() {
  return (
    <section className="grid gap-3 px-3 py-3 md:grid-cols-2 md:gap-6 md:px-6 md:py-6">
      {DUO.map((b) => (
        <Link key={b.title} href="/shop" className="group relative block overflow-hidden rounded-sm">
          <div data-reveal-img className="relative aspect-[4/5] md:aspect-[5/6]">
            <Image src={b.image} alt={b.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-105" />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute inset-x-6 bottom-6 flex items-end justify-between text-white md:inset-x-8 md:bottom-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-85">{b.kicker}</p>
              <h3 className="mt-2 font-display text-4xl leading-none md:text-5xl">{b.title}</h3>
            </div>
            <span className="inline-flex items-center gap-2 border-b border-white/80 pb-1 text-xs font-semibold uppercase tracking-[0.16em]">
              Shop <Arrow />
            </span>
          </div>
        </Link>
      ))}
    </section>
  )
}

const PERKS = [
  { title: "10% off", sub: "First order · AVYR10", image: "/assets/site_media/instagram_lookbook_ing1.jpg" },
  { title: "Free shipping", sub: "On orders ₹1,999+", image: "/assets/banners/folded-shirts.jpg" },
  { title: "Hand finished", sub: "18 hours per shirt", image: "/assets/banners/craft-detail.jpg" },
]

export function PerkBanners() {
  return (
    <section className="px-5 pb-16 pt-10 md:px-10 md:pb-24 lg:px-14">
      <div
        data-stagger
        className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {PERKS.map((p) => (
          <Link
            key={p.title}
            href="/shop"
            className="group flex w-[82%] shrink-0 snap-start items-center gap-4 overflow-hidden rounded-sm border border-border bg-surface p-3 transition-colors hover:border-foreground/40 md:w-auto"
          >
            <div className="relative size-20 shrink-0 overflow-hidden rounded-sm md:size-24">
              <Image src={p.image} alt="" fill sizes="96px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-2xl leading-tight text-foreground md:text-[1.7rem]">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.sub}</p>
            </div>
            <span className="mr-2 text-foreground transition-transform group-hover:translate-x-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
