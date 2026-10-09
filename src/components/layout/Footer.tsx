"use client"

import Link from "next/link"
import type { View } from "../../types"

export interface FooterProps {
  go: (v: View) => void
}

const COLUMNS = [
  { title: "Shop", links: [["New arrivals", "/shop"], ["Embroidered", "/shop"], ["Resort", "/shop"], ["Pure linen", "/shop"], ["Sale", "/shop"]] },
  { title: "Help", links: [["Track order", "/account"], ["Shipping", "/shop"], ["Returns", "/shop"], ["Size guide", "/shop"], ["Contact", "/shop"]] },
  { title: "AVYR", links: [["Our story", "/blog"], ["Journal", "/blog"], ["My account", "/account"], ["Wishlist", "/wishlist"]] },
]

const SOCIALS = [
  { label: "Instagram", path: "M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm4.2 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm5.5-.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z" },
  { label: "YouTube", path: "M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15.1V8.9l5.8 3.1-5.8 3.1Z" },
  { label: "Pinterest", path: "M12 1a11 11 0 0 0-4 21.2c-.1-.9-.2-2.2 0-3.2l1.3-5.5s-.3-.7-.3-1.7c0-1.6.9-2.8 2.1-2.8 1 0 1.5.7 1.5 1.6 0 1-.6 2.5-1 3.9-.3 1.2.6 2.1 1.7 2.1 2.1 0 3.7-2.2 3.7-5.4 0-2.8-2-4.8-4.9-4.8-3.4 0-5.3 2.5-5.3 5.1 0 1 .4 2.1.9 2.7l.1.4-.3 1.3c0 .2-.2.3-.4.2-1.5-.7-2.4-2.9-2.4-4.6 0-3.8 2.7-7.2 7.9-7.2 4.1 0 7.3 2.9 7.3 6.9 0 4.1-2.6 7.4-6.2 7.4-1.2 0-2.4-.6-2.7-1.4l-.8 2.8c-.3 1-1 2.3-1.5 3.1A11 11 0 1 0 12 1Z" },
]

export function Footer(_props: FooterProps) {
  return (
    <footer className="site-footer border-t border-border bg-[#0d0d0d] pb-28 pt-16 text-white md:pb-10 md:pt-20">
      <div className="grid gap-12 px-5 md:grid-cols-[1.4fr_repeat(3,1fr)] md:px-10 lg:px-14">
        <div>
          <Link href="/" className="font-display text-4xl tracking-[0.28em]">
            AVYR
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">Hand-embroidered linen shirts, made in small batches in Surat, India.</p>
          <div className="mt-6 flex gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 md:contents">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-white/85 transition-colors hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 overflow-hidden px-5 md:px-10 lg:px-14" aria-hidden="true">
        <p className="select-none font-display text-[26vw] leading-[0.8] tracking-[0.04em] text-white/[0.06] md:text-[18vw]">AVYR</p>
      </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-white/10 px-5 pt-6 text-xs text-white/50 md:flex-row md:justify-between md:px-10 lg:px-14">
        <span>© 2026 AVYR by Gayatri. All rights reserved.</span>
        <span>UPI · Visa · Mastercard · RuPay</span>
      </div>
    </footer>
  )
}

export default Footer
