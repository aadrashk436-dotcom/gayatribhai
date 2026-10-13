"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Smartphone, Maximize2, ZoomOut, ZoomIn, ExternalLink, Sparkles } from "lucide-react"
import { ZoomImageModalState } from "../types"

interface ImageLightboxModalProps {
  modal: ZoomImageModalState
  onClose: () => void
}

export function ImageLightboxModal({ modal, onClose }: ImageLightboxModalProps) {
  const [zoom, setZoom] = useState(1)
  const [fit, setFit] = useState<"contain" | "cover">("contain")

  if (!modal) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={() => {
        setZoom(1)
        onClose()
      }}
    >
      <div
        className={`relative w-full flex flex-col items-center bg-[#12141a] border border-[#d4af37]/40 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 ${
          modal.isMobile ? "max-w-md" : "max-w-5xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title & Zoom Toolbar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
              {modal.isMobile ? <Smartphone className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </span>
            <div>
              <h4 className="font-serif text-sm sm:text-base font-bold text-white line-clamp-1">{modal.title}</h4>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                <span className="text-emerald-400 font-bold">● HD Resolution</span>
                <span>•</span>
                <span>{modal.isMobile ? "768 × 1376 (9:16 Portrait)" : "Full Widescreen High-Res"}</span>
              </div>
            </div>
          </div>

          {/* Zoom & Inspection Controls */}
          <div className="flex items-center gap-2">
            {/* Zoom Out */}
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(0.75, Number((prev - 0.25).toFixed(2))))}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>

            {/* Zoom Level Reset Button */}
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono font-bold text-[#d4af37] hover:bg-white/10 transition"
              title="Reset Zoom (100%)"
            >
              {Math.round(zoom * 100)}%
            </button>

            {/* Zoom In */}
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(2.5, Number((prev + 0.25).toFixed(2))))}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>

            {/* Fit Mode Toggle */}
            <button
              type="button"
              onClick={() => setFit((prev) => (prev === "contain" ? "cover" : "contain"))}
              className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition hidden sm:inline-flex items-center gap-1"
              title="Toggle Full Uncropped View vs Fill Screen"
            >
              {fit === "contain" ? "Pura Dikhe (100%)" : "Fill Screen"}
            </button>

            {/* Open in New Tab */}
            <a
              href={modal.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition"
              title="Open original high-res file"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open File</span>
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setZoom(1)
                onClose()
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-rose-500/80 transition text-sm font-bold ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Uncropped Image Display (Pura Dikhe) with Smooth Scaling */}
        <div
          className={`relative w-full flex items-center justify-center rounded-2xl overflow-hidden border border-white/15 bg-zinc-950 p-2 shadow-2xl ${
            modal.isMobile
              ? "max-w-[420px] aspect-[9/16] max-h-[75vh]"
              : "w-full aspect-[16/9] max-h-[75vh]"
          }`}
        >
          <div
            className="relative w-full h-full transition-transform duration-200 ease-out"
            style={{ transform: `scale(${zoom})` }}
          >
            <Image
              src={modal.url}
              alt={modal.title}
              fill
              className={fit === "contain" ? "object-contain" : "object-cover"}
              unoptimized
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between w-full text-[11px] text-zinc-400 px-1 pt-1">
          <span className="flex items-center gap-1.5 text-[#d4af37] font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>100% Uncropped Original View (&ldquo;Pura Dikhe&rdquo;)</span>
          </span>
          <span>Zoom buttons or click &ldquo;Open File&rdquo; for full raw resolution • Press ✕ to close</span>
        </div>
      </div>
    </div>
  )
}
