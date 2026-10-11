"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { products } from "../../products"
import type { Product } from "../../types"
import { money } from "../../utils/format"
import { getProductUrl } from "../../lib/navigation"
import Empty from "../common/Empty"
import Icon from "../common/Icon"

export interface SearchOverlayProps {
  query: string
  setQuery: (x: string) => void
  onClose: () => void
  openProduct: (p: Product) => void
}

export function SearchOverlay({
  query,
  setQuery,
  onClose,
  openProduct,
}: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus input on mount with slight delay for smooth transition
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 60)

    // Close on Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  const handleClear = () => {
    setQuery("")
    inputRef.current?.focus()
  }

  const results = query
    ? products
        .filter((p) =>
          `${p.name} ${p.category} ${p.color}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .slice(0, 5)
    : []

  return (
    <div
      className="search-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Search shirts"
    >
      <div className="search-box">
        {/* Back Button (←) for phone / mobile screen navigation */}
        <button
          type="button"
          onClick={onClose}
          className="search-back-btn"
          aria-label="Back / Close search"
          title="Back"
        >
          <Icon name="arrow-left" size={22} />
          <span className="search-back-text">Back</span>
        </button>

        {/* Input Container with Search Icon & Cut/Clear Button */}
        <div className="search-input-wrap">
          <Icon name="search" size={20} className="search-input-icon" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search handcrafted shirts..."
            className="search-input"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            aria-label="Search shirts"
          />
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="search-cut-btn"
              aria-label="Cut / Clear text"
              title="Clear search text"
            >
              <Icon name="close" size={12} />
            </button>
          ) : null}
        </div>

        {/* Close / Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          className="search-close-btn"
          aria-label="Close search"
          title="Close search"
        >
          <span className="search-close-label">Cancel</span>
          <span className="search-close-esc">ESC</span>
          <Icon name="close" size={18} className="search-close-icon" />
        </button>
      </div>

      <div className="search-content">
        {query ? (
          <>
            <div className="search-results-header">
              <span className="eyebrow">{results.length} Results</span>
              <button
                type="button"
                onClick={handleClear}
                className="search-clear-inline-link"
              >
                Clear
              </button>
            </div>
            {results.length ? (
              <div className="search-results">
                {results.map((p) => (
                  <Link
                    href={getProductUrl(p)}
                    onClick={() => {
                      if (openProduct) openProduct(p)
                      onClose()
                    }}
                    key={p.id}
                  >
                    <img src={p.images[0]} alt="" />
                    <span>
                      <strong>{p.name}</strong>
                      <small>
                        {p.color} · {money(p.price)}
                      </small>
                    </span>
                    <Icon name="arrow" />
                  </Link>
                ))}
              </div>
            ) : (
              <Empty
                icon="search"
                title="No shirts found"
                copy="Try a colour, category, or a simpler term."
              />
            )}
          </>
        ) : (
          <>
            <span className="eyebrow">Popular Searches</span>
            <div className="popular-searches">
              {[
                "Linen shirts",
                "Hand embroidered",
                "Beach shirts",
                "White shirts",
                "Relaxed fit",
                "Cuban collar",
              ].map((x) => (
                <button type="button" onClick={() => setQuery(x)} key={x}>
                  {x}
                  <Icon name="arrow" size={15} />
                </button>
              ))}
            </div>
            <span className="eyebrow">Recently Viewed</span>
            <div className="search-products">
              {products.slice(0, 3).map((p) => (
                <Link
                  href={getProductUrl(p)}
                  onClick={() => {
                    if (openProduct) openProduct(p)
                    onClose()
                  }}
                  key={p.id}
                >
                  <img src={p.images[0]} alt="" />
                  <span>{p.name}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SearchOverlay
