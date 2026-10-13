"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Sparkles, Eye, Monitor, ExternalLink, Smartphone, Upload, Globe } from "lucide-react"
import { Banner, ZoomImageModalState } from "../types"

interface BannerModalProps {
  isOpen: boolean
  onClose: () => void
  bannerToEdit: Banner | null
  onSave: (bannerData: any) => void
  onOpenZoom: (zoomState: NonNullable<ZoomImageModalState>) => void
}

export function BannerModal({
  isOpen,
  onClose,
  bannerToEdit,
  onSave,
  onOpenZoom,
}: BannerModalProps) {
  const [bannerKicker, setBannerKicker] = useState("Summer Atelier '26")
  const [bannerLine1, setBannerLine1] = useState("Woven")
  const [bannerLine2, setBannerLine2] = useState("by hand.")
  const [bannerCta, setBannerCta] = useState("Shop collection")
  const [bannerDesktopImg, setBannerDesktopImg] = useState("/assets/site_banners/slide1_desktop.jpg")
  const [bannerMobileImg, setMobileBannerImg] = useState("/assets/site_banners/slide1_mobile.jpg")
  const [bannerLink, setBannerLink] = useState("/shop")
  const [bannerTone, setBannerTone] = useState<"light" | "dark">("light")
  const [bannerActive, setBannerActive] = useState(true)
  const [bannerAlt, setBannerAlt] = useState("Ivory hand-embroidered French linen shirt on an Aegean seaside stone terrace")
  const [bannerSeoHeading, setBannerSeoHeading] = useState("H1")
  const [bannerSeoKeywords, setBannerSeoKeywords] = useState("french linen shirts, luxury menswear, resortwear")
  const [bannerPreviewFit, setBannerPreviewFit] = useState<"cover" | "contain">("cover")

  useEffect(() => {
    if (bannerToEdit) {
      setBannerKicker(bannerToEdit.kicker || "")
      setBannerLine1(Array.isArray(bannerToEdit.lines) ? bannerToEdit.lines[0] || "" : "")
      setBannerLine2(Array.isArray(bannerToEdit.lines) ? bannerToEdit.lines[1] || "" : "")
      setBannerCta(bannerToEdit.cta || "Shop collection")
      setBannerDesktopImg(bannerToEdit.desktop || "")
      setMobileBannerImg(bannerToEdit.mobile || "")
      setBannerLink(bannerToEdit.link || "/shop")
      setBannerTone((bannerToEdit.tone as any) || "light")
      setBannerActive(bannerToEdit.is_active !== false)
      setBannerAlt(bannerToEdit.alt || "")
      setBannerSeoHeading(bannerToEdit.seo_heading || "H1")
      setBannerSeoKeywords(
        Array.isArray(bannerToEdit.seo_keywords)
          ? bannerToEdit.seo_keywords.join(", ")
          : bannerToEdit.seo_keywords || ""
      )
    } else {
      setBannerKicker("Summer Atelier '26")
      setBannerLine1("Woven")
      setBannerLine2("by hand.")
      setBannerCta("Shop collection")
      setBannerDesktopImg("/assets/site_banners/slide1_desktop.jpg")
      setMobileBannerImg("/assets/site_banners/slide1_mobile.jpg")
      setBannerLink("/shop")
      setBannerTone("light")
      setBannerActive(true)
      setBannerAlt("Ivory hand-embroidered French linen shirt on an Aegean seaside stone terrace")
      setBannerSeoHeading("H1")
      setBannerSeoKeywords("french linen shirts, luxury menswear, resortwear")
    }
  }, [bannerToEdit, isOpen])

  if (!isOpen) return null

  const handleUploadBannerDesktop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) setBannerDesktopImg(ev.target.result as string)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleUploadBannerMobile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) setMobileBannerImg(ev.target.result as string)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const bannerObj = {
      id: bannerToEdit ? bannerToEdit.id : `slide_${Date.now()}`,
      kicker: bannerKicker,
      lines: [bannerLine1, bannerLine2],
      cta: bannerCta,
      desktop: bannerDesktopImg,
      mobile: bannerMobileImg,
      alt: bannerAlt || `${bannerKicker} - ${bannerLine1} ${bannerLine2}`,
      tone: bannerTone,
      link: bannerLink,
      is_active: bannerActive,
      seo_heading: bannerSeoHeading,
      seo_keywords: bannerSeoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      sort_order: bannerToEdit?.sort_order || 1,
    }
    onSave(bannerObj)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-3xl border border-[#d4af37]/40 bg-[#12141a] p-5 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white">
                {bannerToEdit ? "Edit Hero Slider Slide & Imagery" : "Create New Homepage Hero Slide"}
              </h3>
              <p className="text-xs text-zinc-400">
                Dual responsive imagery: configure crisp horizontal for PC (16:9) and vertical touch mockup for Phones (9:16)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dual Screen Simulator */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                  <Eye className="h-3.5 w-3.5" />
                </span>
                <span className="font-serif text-sm font-bold text-white">
                  Live Storefront Simulator Preview
                </span>
              </div>

              {/* Preview fit toggle */}
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setBannerPreviewFit("cover")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    bannerPreviewFit === "cover" ? "bg-[#d4af37] text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  📱 Screen Fill (9:16)
                </button>
                <button
                  type="button"
                  onClick={() => setBannerPreviewFit("contain")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    bannerPreviewFit === "contain" ? "bg-[#d4af37] text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                  title="Inspect full uncropped image"
                >
                  🖼️ Full Photo (Pura Dikhe)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1 items-start">
              {/* Desktop Preview */}
              <div className="md:col-span-7 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1 font-semibold text-white">
                    <Monitor className="h-3 w-3 text-[#d4af37]" /> Desktop PC (16:9)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenZoom({
                        url: bannerDesktopImg || "/assets/site_banners/slide1_desktop.jpg",
                        title: `Desktop View: ${bannerKicker || "Hero Slide"}`,
                        isMobile: false,
                      })
                    }
                    className="text-[#d4af37] hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-2.5 w-2.5" /> Pura Dekho
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden border border-white/10 bg-[#161922] shadow-xl">
                  <div className="bg-[#1e222b] px-3 py-1 border-b border-white/10 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500/80" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/80" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                    <span className="text-[9px] font-mono text-zinc-400 ml-2 truncate">
                      gayatribhai.com{bannerLink || "/shop"}
                    </span>
                  </div>
                  <div className="relative aspect-[16/9] w-full bg-black">
                    {bannerDesktopImg ? (
                      <Image
                        src={bannerDesktopImg}
                        alt="Desktop preview"
                        fill
                        className={bannerPreviewFit === "contain" ? "object-contain bg-zinc-950" : "object-cover"}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                        No Desktop Image Selected
                      </div>
                    )}
                    <div
                      className={`absolute inset-0 flex items-end p-4 ${
                        bannerTone === "dark"
                          ? "bg-gradient-to-t from-white/90 via-transparent to-transparent text-black"
                          : "bg-gradient-to-t from-black/85 via-black/20 to-transparent text-white"
                      }`}
                    >
                      <div>
                        <p className="text-[9px] uppercase font-bold tracking-widest text-[#d4af37]">
                          {bannerKicker || "Featured Atelier"}
                        </p>
                        <p className="font-serif text-sm sm:text-base font-bold leading-tight">
                          {bannerLine1 || "Headline Line 1"} {bannerLine2 || "Line 2"}
                        </p>
                        <span className="inline-block mt-2 rounded-full bg-white text-black px-3 py-0.5 text-[9px] font-bold shadow">
                          {bannerCta || "Shop Now"} →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Phone Mockup */}
              <div className="md:col-span-5 space-y-1.5 flex flex-col items-center">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 w-full max-w-[170px]">
                  <span className="flex items-center gap-1 font-semibold text-white">
                    <Smartphone className="h-3 w-3 text-[#d4af37]" /> Phone (9:16)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenZoom({
                        url: bannerMobileImg || "/assets/site_banners/slide1_mobile.jpg",
                        title: `Mobile View: ${bannerKicker || "Hero Slide"}`,
                        isMobile: true,
                      })
                    }
                    className="text-[#d4af37] hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-2.5 w-2.5" /> Pura Dikhe
                  </button>
                </div>

                <div className="relative w-[160px] aspect-[9/16] rounded-[30px] border-[5px] border-[#252831] bg-black shadow-2xl overflow-hidden ring-1 ring-white/10 group">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 h-3.5 w-14 rounded-full bg-black/95 flex items-center justify-between px-2 pointer-events-none ring-1 ring-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
                  </div>

                  <div className="absolute top-1 inset-x-3 z-20 flex justify-between items-center text-[7.5px] text-white/80 font-mono pointer-events-none">
                    <span>9:41</span>
                    <span>●● 100%</span>
                  </div>

                  {bannerMobileImg ? (
                    <Image
                      src={bannerMobileImg}
                      alt="Mobile preview"
                      fill
                      className={bannerPreviewFit === "contain" ? "object-contain bg-zinc-950" : "object-cover"}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                      No Mobile Image
                    </div>
                  )}

                  <div
                    className={`absolute inset-0 flex items-end p-2.5 pointer-events-none ${
                      bannerTone === "dark"
                        ? "bg-gradient-to-t from-white/95 via-white/30 to-transparent text-black"
                        : "bg-gradient-to-t from-black/90 via-black/30 to-transparent text-white"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-[7.5px] uppercase tracking-wider font-bold text-[#d4af37]">
                        {bannerKicker || "Featured"}
                      </p>
                      <p className="font-serif text-[10px] font-bold leading-tight line-clamp-2">
                        {bannerLine1 || "Line 1"} {bannerLine2 || ""}
                      </p>
                      <span className="inline-block rounded-full bg-white text-black px-2 py-0.5 text-[7px] font-bold mt-0.5 shadow">
                        {bannerCta || "Shop"} →
                      </span>
                    </div>
                  </div>

                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 h-1 w-10 rounded-full bg-white/50 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Typography & CTA */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-5 space-y-4">
            <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#d4af37]" />
              <span>Slide Typography, Headlines & Button Links</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Kicker / Top Subtitle <span className="text-[#d4af37]">*</span>
                </label>
                <input
                  type="text"
                  value={bannerKicker}
                  onChange={(e) => setBannerKicker(e.target.value)}
                  placeholder="e.g. Summer Atelier '26"
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  CTA Button Text <span className="text-[#d4af37]">*</span>
                </label>
                <input
                  type="text"
                  value={bannerCta}
                  onChange={(e) => setBannerCta(e.target.value)}
                  placeholder="e.g. Shop linen"
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Hero Headline Line 1 <span className="text-[#d4af37]">*</span>
                </label>
                <input
                  type="text"
                  value={bannerLine1}
                  onChange={(e) => setBannerLine1(e.target.value)}
                  placeholder="e.g. Woven"
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Hero Headline Line 2 (Italic Accent)
                </label>
                <input
                  type="text"
                  value={bannerLine2}
                  onChange={(e) => setBannerLine2(e.target.value)}
                  placeholder="e.g. by hand."
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Target Link <span className="text-[#d4af37]">*</span>
                </label>
                <input
                  type="text"
                  value={bannerLink}
                  onChange={(e) => setBannerLink(e.target.value)}
                  placeholder="/shop"
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Text Contrast Tone
                </label>
                <select
                  value={bannerTone}
                  onChange={(e) => setBannerTone(e.target.value as "light" | "dark")}
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="light">Light (White text with dark gradient)</option>
                  <option value="dark">Dark (Dark text with bright/ivory background)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Responsive Image Inputs */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-5 space-y-5">
            <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#d4af37]" />
              <span>Responsive Images (Tailored for PC & Mobile Devices)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Desktop */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-white">Desktop Image File / URL (16:9)</span>
                <label className="cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition">
                  <Upload className="h-3.5 w-3.5 text-[#d4af37]" />
                  <span>Upload Desktop Image File</span>
                  <input type="file" accept="image/*" onChange={handleUploadBannerDesktop} className="hidden" />
                </label>
                <input
                  type="text"
                  value={bannerDesktopImg}
                  onChange={(e) => setBannerDesktopImg(e.target.value)}
                  placeholder="Or enter desktop image URL"
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none font-mono"
                  required
                />
              </div>

              {/* Mobile */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-white">Mobile Phone Image File / URL (9:16)</span>
                <label className="cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition">
                  <Upload className="h-3.5 w-3.5 text-[#d4af37]" />
                  <span>Upload Mobile Image File</span>
                  <input type="file" accept="image/*" onChange={handleUploadBannerMobile} className="hidden" />
                </label>
                <input
                  type="text"
                  value={bannerMobileImg}
                  onChange={(e) => setMobileBannerImg(e.target.value)}
                  placeholder="Or enter mobile image URL"
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Banner SEO */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-5 space-y-4">
            <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#d4af37]" />
              <span>Banner Image SEO & Semantic Headings</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Image Alt Text</label>
                <input
                  type="text"
                  value={bannerAlt}
                  onChange={(e) => setBannerAlt(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">SEO Heading Level</label>
                <select
                  value={bannerSeoHeading}
                  onChange={(e) => setBannerSeoHeading(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="H1">H1 (Hero Main Heading)</option>
                  <option value="H2">H2 (Secondary Campaign)</option>
                  <option value="H3">H3 (Subordinate Banner)</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Keywords</label>
                <input
                  type="text"
                  value={bannerSeoKeywords}
                  onChange={(e) => setBannerSeoKeywords(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="bannerActiveCheckbox"
              checked={bannerActive}
              onChange={(e) => setBannerActive(e.target.checked)}
              className="h-4 w-4 rounded accent-[#d4af37]"
            />
            <label htmlFor="bannerActiveCheckbox" className="text-xs font-semibold text-zinc-300 cursor-pointer">
              Publish Slide Live on Storefront
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#d4af37] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#b8972e] transition shadow-lg"
            >
              {bannerToEdit ? "Update Slider Slide & SEO" : "Add Slide to Homepage"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
