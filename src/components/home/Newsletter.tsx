"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { SplitLines } from "./useReveal"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const setToast = useStore((s) => s.setToast)

  return (
    <section className="px-5 pb-28 pt-6 md:px-10 md:pb-28 lg:px-14">
      <div className="flex flex-col gap-8 rounded-sm bg-solid px-6 py-12 text-solid-foreground md:flex-row md:items-end md:justify-between md:px-14 md:py-16">
        <div>
          <p data-reveal className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] opacity-70 md:text-xs">
            The inner circle
          </p>
          <h2 data-reveal-text className="font-display text-[clamp(2.2rem,6vw,4rem)] leading-[0.98] tracking-[-0.02em]">
            <SplitLines lines={["First look.", "10% off."]} />
          </h2>
        </div>
        <form
          data-reveal
          className="flex w-full max-w-md items-center gap-2 border-b border-current/40 pb-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!email) return
            setToast("You're on the list. Check your inbox.")
            setEmail("")
          }}
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-current/50"
          />
          <button type="submit" className="h-11 shrink-0 rounded-full bg-solid-foreground px-6 text-xs font-semibold uppercase tracking-[0.16em] text-solid transition-opacity hover:opacity-85">
            Join
          </button>
        </form>
      </div>
    </section>
  )
}
