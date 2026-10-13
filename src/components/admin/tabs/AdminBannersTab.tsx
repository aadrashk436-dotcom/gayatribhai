import React from "react"
import Image from "next/image"
import {
  Sparkles,
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  Edit3,
  Trash2,
  Monitor,
  Smartphone,
  Maximize2,
  ExternalLink,
  Globe,
} from "lucide-react"
import { Banner, ZoomImageModalState } from "../types"
import { SkeletonBanners } from "../AdminSkeletonLoaders"

interface AdminBannersTabProps {
  bannerList: Banner[]
  isLoadingBanners: boolean
  bannerViewMode: Record<string, "frame" | "full">
  setBannerViewMode: React.Dispatch<React.SetStateAction<Record<string, "frame" | "full">>>
  handleOpenAddBanner: () => void
  handleOpenEditBanner: (banner: Banner) => void
  handleDeleteBanner: (id: string) => void
  handleToggleBannerActive: (id: string) => void
  handleMoveBanner: (index: number, direction: "up" | "down") => void
  handleDuplicateBanner: (banner: Banner) => void
  setZoomImageModal: (state: ZoomImageModalState | null) => void
  setBannerKicker: (v: string) => void
  setBannerLine1: (v: string) => void
  setBannerLine2: (v: string) => void
  setBannerCta: (v: string) => void
  setBannerDesktopImg: (v: string) => void
  setMobileBannerImg: (v: string) => void
  setBannerAlt: (v: string) => void
  setBannerTone: (v: "light" | "dark") => void
}

export const AdminBannersTab: React.FC<AdminBannersTabProps> = ({
  bannerList,
  isLoadingBanners,
  bannerViewMode,
  setBannerViewMode,
  handleOpenAddBanner,
  handleOpenEditBanner,
  handleDeleteBanner,
  handleToggleBannerActive,
  handleMoveBanner,
  handleDuplicateBanner,
  setZoomImageModal,
  setBannerKicker,
  setBannerLine1,
  setBannerLine2,
  setBannerCta,
  setBannerDesktopImg,
  setMobileBannerImg,
  setBannerAlt,
  setBannerTone,
}) => {
  return (
    <div className="space-y-6">
      {/* Studio Header Card */}
      <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-3 py-0.5 text-[10px] font-bold text-[#d4af37]">
              <Sparkles className="h-3 w-3" /> Storefront Hero Studio
            </span>
            <span className="text-[11px] text-zinc-400">
              • {bannerList.length} Slides ({bannerList.filter((b) => b.is_active !== false).length} Live)
            </span>
          </div>
          <h4 className="font-serif text-lg font-bold text-white mt-1">Homepage Hero Slider & Banners</h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            Customize high-resolution full-screen hero slides with tailored images for PC (Desktop 16:9) and Mobile Phones (Vertical 9:16).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenAddBanner}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Slide</span>
          </button>
        </div>
      </div>

      {/* Quick Preset Templates Bar */}
      <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-zinc-300 flex items-center gap-1.5 mr-1">
          <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
          Quick Inspiration Templates:
        </span>
        <button
          type="button"
          onClick={() => {
            handleOpenAddBanner()
            setBannerKicker("Summer Atelier '26")
            setBannerLine1("Woven")
            setBannerLine2("by hand.")
            setBannerCta("Shop linen")
            setBannerDesktopImg("/assets/site_banners/slide1_desktop.jpg")
            setMobileBannerImg("/assets/site_banners/slide1_mobile.jpg")
            setBannerAlt("Ivory French linen shirt on an Aegean seaside stone terrace")
            setBannerTone("light")
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300 hover:border-[#d4af37]/50 hover:text-white transition"
        >
          + Summer Atelier (Ivory)
        </button>
        <button
          type="button"
          onClick={() => {
            handleOpenAddBanner()
            setBannerKicker("The Resort Edit")
            setBannerLine1("Coastal")
            setBannerLine2("state.")
            setBannerCta("Shop resort")
            setBannerDesktopImg("/assets/site_banners/slide2_desktop.jpg")
            setMobileBannerImg("/assets/site_banners/slide2_mobile.jpg")
            setBannerAlt("Sky-blue Cuban collar linen shirt in a coastal villa")
            setBannerTone("light")
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300 hover:border-[#d4af37]/50 hover:text-white transition"
        >
          + The Resort Edit (Blue)
        </button>
        <button
          type="button"
          onClick={() => {
            handleOpenAddBanner()
            setBannerKicker("New Arrivals")
            setBannerLine1("Rust &")
            setBannerLine2("ease.")
            setBannerCta("Shop new in")
            setBannerDesktopImg("/assets/banners/hero-terracotta-widescreen.jpg")
            setMobileBannerImg("/assets/banners/hero-studio-mobile.jpg")
            setBannerAlt("Terracotta embroidered linen shirt in sandstone courtyard")
            setBannerTone("light")
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300 hover:border-[#d4af37]/50 hover:text-white transition"
        >
          + Terracotta Studio (Rust)
        </button>
        <button
          type="button"
          onClick={() => {
            handleOpenAddBanner()
            setBannerKicker("After Dark")
            setBannerLine1("Evening")
            setBannerLine2("tailoring.")
            setBannerCta("Shop evening")
            setBannerDesktopImg("/assets/banners/hero-evening-desktop.jpg")
            setMobileBannerImg("/assets/site_banners/slide3_mobile.jpg")
            setBannerAlt("Navy embroidered linen shirt on an evening rooftop")
            setBannerTone("light")
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300 hover:border-[#d4af37]/50 hover:text-white transition"
        >
          + After Dark (Navy)
        </button>
      </div>

      {/* Banners List */}
      {isLoadingBanners ? (
        <SkeletonBanners />
      ) : (
        <div className="space-y-4">
          {bannerList.map((banner, index) => {
            const isActive = banner.is_active !== false
            return (
              <div
                key={banner.id || index}
                className={`rounded-2xl border bg-[#14171d] p-5 shadow-xl transition space-y-4 ${
                  isActive ? "border-white/10 hover:border-[#d4af37]/40" : "border-white/5 opacity-75"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    {/* Slide index & Reorder Controls */}
                    <div className="flex items-center gap-1">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 font-mono text-xs font-bold text-[#d4af37]">
                        #{index + 1}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveBanner(index, "up")}
                          disabled={index === 0}
                          title="Move Slide Up"
                          className="flex h-4 w-5 items-center justify-center rounded bg-white/5 text-zinc-400 hover:bg-[#d4af37] hover:text-black disabled:opacity-30 disabled:pointer-events-none transition text-[9px]"
                        >
                          <ArrowUp className="h-2.5 w-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveBanner(index, "down")}
                          disabled={index === bannerList.length - 1}
                          title="Move Slide Down"
                          className="flex h-4 w-5 items-center justify-center rounded bg-white/5 text-zinc-400 hover:bg-[#d4af37] hover:text-black disabled:opacity-30 disabled:pointer-events-none transition text-[9px]"
                        >
                          <ArrowDown className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                          {banner.kicker || "Featured Slide"}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isActive
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-white/10 text-zinc-400"
                          }`}
                        >
                          {isActive ? "● Live on Store" : "○ Draft / Paused"}
                        </span>
                      </div>
                      <h5 className="font-serif text-base font-bold text-white mt-0.5">
                        {Array.isArray(banner.lines)
                          ? banner.lines.join(" ")
                          : banner.lines || banner.title || "Hero Banner"}
                      </h5>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleBannerActive(banner.id)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                        isActive
                          ? "border-white/10 bg-white/5 text-zinc-300 hover:text-white"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {isActive ? "Pause Slide" : "Make Live"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateBanner(banner)}
                      className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition flex items-center gap-1.5"
                      title="Duplicate this slide"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Clone</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditBanner(banner)}
                      className="rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/15 px-3 py-1.5 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition flex items-center gap-1.5"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit Slide</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500 hover:text-white transition"
                      title="Delete banner"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Responsive Imagery Preview: Desktop (16:9) vs Phone Mockup (9:16) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1 items-start">
                  {/* PC Desktop Image (16:9 ratio) */}
                  <div className="lg:col-span-7 space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5 font-semibold text-white">
                        <Monitor className="h-3.5 w-3.5 text-[#d4af37]" />
                        Desktop (PC Widescreen 16:9)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-400">1920 × 1080</span>
                        <button
                          type="button"
                          onClick={() =>
                            setZoomImageModal({
                              url:
                                banner.desktop ||
                                banner.image_desktop ||
                                "/assets/site_banners/slide1_desktop.jpg",
                              title: `Desktop View: ${banner.kicker || "Hero Slide"}`,
                              isMobile: false,
                            })
                          }
                          className="text-[11px] text-[#d4af37] hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" /> Pura Dekho
                        </button>
                      </div>
                    </div>

                    {/* Desktop Browser Window Mockup */}
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0d0f12] shadow-2xl">
                      <div className="bg-[#181b22] px-3 py-1.5 border-b border-white/10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 bg-black/50 rounded px-2.5 py-0.5 max-w-[240px] truncate border border-white/5">
                          gayatribhai.com{banner.link || "/shop"}
                        </div>
                        <div className="w-8" />
                      </div>
                      <div
                        onClick={() =>
                          setZoomImageModal({
                            url:
                              banner.desktop ||
                              banner.image_desktop ||
                              "/assets/site_banners/slide1_desktop.jpg",
                            title: `Desktop PC Widescreen: ${banner.kicker || "Hero Slide"}`,
                            isMobile: false,
                          })
                        }
                        className="relative aspect-[16/9] w-full bg-black group cursor-pointer"
                        title="Click for Full High-Resolution PC View"
                      >
                        <Image
                          src={
                            banner.desktop ||
                            banner.image_desktop ||
                            "/assets/site_banners/slide1_desktop.jpg"
                          }
                          alt={banner.kicker || "Desktop Slide"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-end p-4">
                          <div className="text-white">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37]">
                              {banner.kicker}
                            </p>
                            <p className="font-serif text-base font-bold">
                              {Array.isArray(banner.lines) ? banner.lines.join(" ") : banner.lines}
                            </p>
                            <span className="inline-block mt-2 rounded-full bg-white text-black px-3 py-0.5 text-[10px] font-bold shadow">
                              {banner.cta || "Shop Linen"} →
                            </span>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="rounded-full bg-black/85 backdrop-blur-md border border-[#d4af37]/60 px-3.5 py-1.5 text-xs font-bold text-[#d4af37] flex items-center gap-1.5 shadow-2xl">
                            <Maximize2 className="h-3.5 w-3.5" /> Pura Dekho (1920 × 1080 HD Zoom)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Phone Mockup (9:16 portrait ratio) */}
                  <div className="lg:col-span-5 space-y-2.5 flex flex-col items-center">
                    <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 w-full max-w-[260px] gap-1">
                      <span className="flex items-center gap-1 font-semibold text-white text-[11px]">
                        <Smartphone className="h-3.5 w-3.5 text-[#d4af37]" />
                        Mobile (9:16)
                      </span>

                      {/* View Switcher: Phone Mockup Frame vs 100% Uncropped Full Photo */}
                      <div className="flex items-center rounded-lg bg-black/60 p-0.5 border border-white/10">
                        <button
                          type="button"
                          onClick={() => setBannerViewMode((prev) => ({ ...prev, [banner.id]: "frame" }))}
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold transition flex items-center gap-1 ${
                            (bannerViewMode[banner.id] || "frame") === "frame"
                              ? "bg-[#d4af37] text-black font-bold shadow"
                              : "text-zinc-400 hover:text-white"
                          }`}
                          title="Device Frame View"
                        >
                          <Smartphone className="h-2.5 w-2.5" /> Frame
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerViewMode((prev) => ({ ...prev, [banner.id]: "full" }))}
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold transition flex items-center gap-1 ${
                            bannerViewMode[banner.id] === "full"
                              ? "bg-[#d4af37] text-black font-bold shadow"
                              : "text-zinc-400 hover:text-white"
                          }`}
                          title="100% Uncropped Full View"
                        >
                          <Maximize2 className="h-2.5 w-2.5" /> Pura Dekho
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setZoomImageModal({
                            url:
                              banner.mobile ||
                              banner.image_mobile ||
                              "/assets/site_banners/slide1_mobile.jpg",
                            title: `Mobile Phone View: ${banner.kicker || "Hero Slide"}`,
                            isMobile: true,
                          })
                        }
                        className="text-[10px] text-[#d4af37] hover:underline flex items-center gap-0.5 ml-auto"
                        title="Inspect full uncropped mobile image"
                      >
                        <ExternalLink className="h-2.5 w-2.5" /> Zoom
                      </button>
                    </div>

                    {(bannerViewMode[banner.id] || "frame") === "frame" ? (
                      /* Authentic Luxury Flagship Smartphone Mockup */
                      <div
                        onClick={() =>
                          setZoomImageModal({
                            url:
                              banner.mobile ||
                              banner.image_mobile ||
                              "/assets/site_banners/slide1_mobile.jpg",
                            title: `Mobile Phone View: ${banner.kicker || "Hero Slide"}`,
                            isMobile: true,
                          })
                        }
                        className="relative w-[220px] sm:w-[235px] md:w-[250px] aspect-[9/16] rounded-[38px] border-[6px] border-[#252834] bg-black shadow-2xl overflow-hidden ring-1 ring-[#d4af37]/30 group cursor-pointer transition hover:border-[#d4af37]/60"
                        title="Click for HD Zoom Full View"
                      >
                        {/* Dynamic Island Pill Notch */}
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 h-4 w-20 rounded-full bg-black/95 flex items-center justify-between px-2 pointer-events-none ring-1 ring-white/10 shadow-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                          <div className="w-2 h-2 rounded-full bg-blue-500/80 ring-1 ring-white/10" />
                        </div>

                        {/* Phone Top Status Bar */}
                        <div className="absolute top-1.5 inset-x-4 z-20 flex justify-between items-center text-[8px] text-white/90 font-mono pointer-events-none">
                          <span className="font-bold">9:41</span>
                          <span className="flex items-center gap-1 font-sans">
                            <span>5G</span>
                            <span>100%</span>
                          </span>
                        </div>

                        {/* Mobile Image */}
                        <Image
                          src={
                            banner.mobile ||
                            banner.image_mobile ||
                            "/assets/site_banners/slide1_mobile.jpg"
                          }
                          alt={banner.kicker || "Mobile Slide"}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />

                        {/* Storefront Mobile Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent flex items-end p-4 pointer-events-none">
                          <div className="text-white space-y-1">
                            <p className="text-[9px] uppercase tracking-wider font-bold text-[#d4af37]">
                              {banner.kicker}
                            </p>
                            <p className="font-serif text-[13px] font-bold leading-snug line-clamp-2">
                              {Array.isArray(banner.lines) ? banner.lines.join(" ") : banner.lines}
                            </p>
                            <span className="inline-block rounded-full bg-white text-black px-3 py-1 text-[9px] font-bold mt-1 shadow-md">
                              {banner.cta || "Shop"} →
                            </span>
                          </div>
                        </div>

                        {/* Bottom Home Indicator Bar */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 h-1 w-16 rounded-full bg-white/60 pointer-events-none" />

                        {/* Hover Overlay: Zoom */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-semibold backdrop-blur-[2px] z-40 pointer-events-none">
                          <Maximize2 className="h-6 w-6 text-[#d4af37]" />
                          <span className="text-[11px] font-bold text-white">Pura Dekho (HD Zoom)</span>
                          <span className="text-[9px] text-[#d4af37]">Click for Uncropped View</span>
                        </div>
                      </div>
                    ) : (
                      /* 100% Uncropped Raw Mobile Photo View ("Pura Dikhe") */
                      <div
                        onClick={() =>
                          setZoomImageModal({
                            url:
                              banner.mobile ||
                              banner.image_mobile ||
                              "/assets/site_banners/slide1_mobile.jpg",
                            title: `Mobile Uncropped Asset: ${banner.kicker || "Hero Slide"}`,
                            isMobile: true,
                          })
                        }
                        className="relative w-[220px] sm:w-[235px] md:w-[250px] aspect-[9/16] rounded-2xl border-2 border-[#d4af37]/50 bg-zinc-950 p-1.5 shadow-2xl overflow-hidden group cursor-pointer transition hover:border-[#d4af37]"
                        title="100% Uncropped Raw Photo — Zero Device Cropping"
                      >
                        <div className="relative w-full h-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                          <Image
                            src={
                              banner.mobile ||
                              banner.image_mobile ||
                              "/assets/site_banners/slide1_mobile.jpg"
                            }
                            alt={banner.kicker || "Mobile Uncropped"}
                            fill
                            className="object-contain"
                          />
                          <div className="absolute top-2 inset-x-2 z-20 flex justify-between items-center pointer-events-none">
                            <span className="rounded-full bg-black/80 backdrop-blur-md px-2 py-0.5 text-[8px] font-mono font-bold text-[#d4af37] border border-white/10">
                              PURA DIKHE (100%)
                            </span>
                            <span className="rounded-full bg-black/80 backdrop-blur-md px-2 py-0.5 text-[8px] font-mono text-zinc-300 border border-white/10">
                              768 × 1376
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-semibold backdrop-blur-[2px] z-30 pointer-events-none">
                            <Maximize2 className="h-6 w-6 text-[#d4af37]" />
                            <span className="text-[11px] font-bold text-white">Full HD Lightbox</span>
                            <span className="text-[9px] text-[#d4af37]">100% Zero Crop</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <span className="font-mono text-[9px] text-zinc-400">
                      768 × 1376 Vertical Full-Bleed •{" "}
                      {bannerViewMode[banner.id] === "full" ? "Uncropped View" : "Phone Frame Mockup"}
                    </span>
                  </div>
                </div>

                {/* Footer Info Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 text-xs text-zinc-400">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>
                      Button: <strong className="text-white">{banner.cta || "Shop Linen"}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Target Link: <code className="text-[#d4af37] font-mono">{banner.link || "/shop"}</code>
                    </span>
                    {banner.alt && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-[#d4af37]" />
                          Alt: <em className="text-zinc-300 italic truncate max-w-[200px]">"{banner.alt}"</em>
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-[#d4af37]">
                      SEO {banner.seo_heading || "H1"}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Tone: <strong className="text-zinc-200 capitalize">{banner.tone || "light"}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
