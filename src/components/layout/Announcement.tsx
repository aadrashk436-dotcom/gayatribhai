"use client"

import { useEffect, useState } from "react"

const MESSAGES = ["Free shipping on orders above ₹1,999", "Use AVYR10 for 10% off your first order", "Easy 7-day returns & exchanges"]

export default function Announcement() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="relative z-50 flex h-9 items-center justify-center overflow-hidden bg-[#0f0f0f] px-4 text-white">
      <div className="relative h-4 w-full max-w-lg text-center" aria-live="polite">
        {MESSAGES.map((msg, i) => (
          <p
            key={msg}
            className={`absolute inset-0 text-[11px] font-medium tracking-[0.14em] uppercase transition-all duration-700 md:text-xs ${
              i === index ? "translate-y-0 opacity-100" : i < index ? "-translate-y-4 opacity-0" : "translate-y-4 opacity-0"
            }`}
          >
            {msg}
          </p>
        ))}
      </div>
    </div>
  )
}
