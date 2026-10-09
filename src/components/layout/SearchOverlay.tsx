"use client"

import { products } from "../../products"
import type { Product } from "../../types"
import { money } from "../../utils/format"
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
    <div className="search-overlay">
      <div className="search-box">
        <Icon name="search" size={26} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search handcrafted shirts..."
        />
        <button onClick={onClose} aria-label="Close search" type="button">
          <Icon name="close" />
        </button>
      </div>
      <div className="search-content">
        {query ? (
          <>
            <span className="eyebrow">{results.length} Results</span>
            {results.length ? (
              <div className="search-results">
                {results.map((p) => (
                  <button
                    type="button"
                    onClick={() => {
                      openProduct(p)
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
                  </button>
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
                <button
                  type="button"
                  onClick={() => {
                    openProduct(p)
                    onClose()
                  }}
                  key={p.id}
                >
                  <img src={p.images[0]} alt="" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SearchOverlay
