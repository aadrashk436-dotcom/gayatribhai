import Image from "next/image"
import Link from "next/link"
import { products } from "@/products"
import SectionHead from "./SectionHead"

const CATEGORIES = [
  { name: "Embroidered", count: "12 styles", image: products[5].images[0] },
  { name: "Resort", count: "8 styles", image: products[2].images[0] },
  { name: "Pure Linen", count: "22 styles", image: products[12].images[0] },
  { name: "After Dark", count: "6 styles", image: products[18].images[0] },
]

export default function CategoryRail() {
  return (
    <section className="px-5 py-16 md:px-10 md:py-24 lg:px-14">
      <SectionHead kicker="Shop by mood" title={["Find your", "shirt."]} href="/shop" linkLabel="All shirts" />
      <div
        data-stagger
        className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {CATEGORIES.map((cat, i) => (
          <Link
            key={cat.name}
            href="/shop"
            className={`group relative block w-[72%] shrink-0 snap-start overflow-hidden rounded-sm bg-surface-2 sm:w-[44%] md:w-auto ${
              i % 2 === 1 ? "md:mt-16" : ""
            }`}
          >
            <div className="relative aspect-[2/3]">
              <Image
                src={cat.image}
                alt={`${cat.name} shirts`}
                fill
                sizes="(max-width: 768px) 72vw, 25vw"
                className="object-cover object-top transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]"
              />
              {/* Deep multi-stop dark scrim to guarantee 100% crystal-clear text contrast on white & light shirts */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 via-45% to-black/10" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 to-transparent" />
            </div>
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between text-white md:inset-x-5 md:bottom-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#cca466] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                  {cat.count}
                </p>
                <h3 className="mt-1 font-display text-2xl font-medium leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] md:text-[1.9rem]">
                  {cat.name}
                </h3>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[#111] shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:scale-105 group-hover:bg-[#cca466] group-hover:text-black group-hover:-rotate-45">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14m-5-5 5 5-5 5" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
