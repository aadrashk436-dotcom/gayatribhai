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
            <div className="relative aspect-[3/4]">
              <Image
                src={cat.image}
                alt={`${cat.name} shirts`}
                fill
                sizes="(max-width: 768px) 72vw, 25vw"
                className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-transparent" />
            </div>
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between text-white md:inset-x-5 md:bottom-5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] opacity-80">{cat.count}</p>
                <h3 className="mt-1 font-display text-2xl leading-none md:text-[1.9rem]">{cat.name}</h3>
              </div>
              <span className="flex size-10 items-center justify-center rounded-full bg-white text-[#111] transition-transform duration-500 group-hover:-rotate-45">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
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
