import React from "react"
import { products } from "../../products"
import { allSizes, categories } from "../../types"
import Button from "../common/Button"
import Icon from "../common/Icon"
import FilterGroup from "./FilterGroup"

export interface ColorOption {
  name: string
  label: string
  hex: string
}

export const COLOR_OPTIONS: ColorOption[] = [
  { name: "White", label: "White & Ivory", hex: "#fcfbf7" },
  { name: "Blue", label: "Sky & Sea Blue", hex: "#7eb8da" },
  { name: "Green", label: "Mint & Sea Green", hex: "#7fb79e" },
  { name: "Rust", label: "Rust & Terracotta", hex: "#b85d34" },
  { name: "Pink", label: "Salmon & Rose", hex: "#e8a598" },
  { name: "Red", label: "True Red", hex: "#b33939" },
  { name: "Maroon", label: "Maroon & Berry", hex: "#7b1126" },
  { name: "Brown", label: "Earth Brown", hex: "#8a5c38" },
]

export interface ShopFilterSidebarProps {
  filtersOpen: boolean
  setFiltersOpen: (open: boolean) => void
  activeFilterCount: number
  hasActiveFilters: boolean
  clearAllFilters: () => void
  category: string
  setCategory: (c: string) => void
  size: string
  setSize: (s: string) => void
  priceRange: string
  setPriceRange: (p: string) => void
  selectedColors: string[]
  toggleColor: (c: string) => void
  selectedFit: string
  setSelectedFit: (f: string) => void
  selectedSleeve: string
  setSelectedSleeve: (s: string) => void
  selectedCollar: string
  setSelectedCollar: (c: string) => void
  selectedPattern: string
  setSelectedPattern: (p: string) => void
  selectedFabric: string
  setSelectedFabric: (f: string) => void
  selectedOccasion: string
  setSelectedOccasion: (o: string) => void
  minDiscount: number
  setMinDiscount: (d: number) => void
  minRating: number
  setMinRating: (r: number) => void
  availability: string
  setAvailability: (a: string) => void
  totalCount: number
}

export default function ShopFilterSidebar({
  filtersOpen,
  setFiltersOpen,
  activeFilterCount,
  hasActiveFilters,
  clearAllFilters,
  category,
  setCategory,
  size,
  setSize,
  priceRange,
  setPriceRange,
  selectedColors,
  toggleColor,
  selectedFit,
  setSelectedFit,
  selectedSleeve,
  setSelectedSleeve,
  selectedCollar,
  setSelectedCollar,
  selectedPattern,
  setSelectedPattern,
  selectedFabric,
  setSelectedFabric,
  selectedOccasion,
  setSelectedOccasion,
  minDiscount,
  setMinDiscount,
  minRating,
  setMinRating,
  availability,
  setAvailability,
  totalCount,
}: ShopFilterSidebarProps) {
  return (
    <aside className={`filters ${filtersOpen ? "open" : ""}`}>
      {/* Sidebar Top Header with Reset All */}
      <div className="filters-sidebar-header">
        <div className="filter-title-box">
          <Icon name="filter" size={17} />
          <strong>Filters</strong>
          {activeFilterCount > 0 && (
            <span className="filter-badge-number">{activeFilterCount}</span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="clear-all-link"
            onClick={clearAllFilters}
          >
            Reset all
          </button>
        )}

        {/* Mobile Close Button */}
        <button
          onClick={() => setFiltersOpen(false)}
          aria-label="Close filters"
          type="button"
          className="filter-mobile-close"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      {/* 1. Category Filter */}
      <FilterGroup
        title="Category"
        activeCount={category !== "All Shirts" ? 1 : 0}
      >
        <div className="filter-checkbox-list">
          {["All Shirts", ...categories].map((x) => {
            const isSelected = category === x
            const count =
              x === "All Shirts"
                ? products.length
                : x === "Linen"
                  ? products.filter((p) =>
                      p.fabric.toLowerCase().includes("linen"),
                    ).length
                  : products.filter(
                      (p) =>
                        p.category.toLowerCase().includes(x.toLowerCase()) ||
                        p.name.toLowerCase().includes(x.toLowerCase()),
                    ).length

            return (
              <label
                key={x}
                className={`filter-radio-label ${isSelected ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="category-filter"
                  checked={isSelected}
                  onChange={() => setCategory(x)}
                />
                <span className="filter-item-name">
                  {x === "All Shirts" ? "All Shirts" : `${x} Shirts`}
                </span>
                <span className="filter-item-count">{count}</span>
              </label>
            )
          })}
        </div>
      </FilterGroup>

      {/* 2. Size Filter */}
      <FilterGroup title="Size" activeCount={size ? 1 : 0}>
        <div className="size-filter-grid">
          {allSizes.map((x) => {
            const count = products.filter(
              (p) => p.stock[x] && p.stock[x] > 0,
            ).length
            const isSelected = size === x

            return (
              <button
                className={`size-btn ${isSelected ? "active" : ""}`}
                onClick={() => setSize(isSelected ? "" : x)}
                key={x}
                type="button"
                title={`${count} shirts available in ${x}`}
              >
                <span>{x}</span>
                <small>{count}</small>
              </button>
            )
          })}
        </div>
      </FilterGroup>

      {/* 3. Price Filter */}
      <FilterGroup title="Price" activeCount={priceRange ? 1 : 0}>
        <div className="filter-checkbox-list">
          {[
            {
              id: "under1500",
              label: "Under ₹1,500",
              count: products.filter((p) => p.price < 1500).length,
            },
            {
              id: "1500-2000",
              label: "₹1,500 – ₹1,999",
              count: products.filter((p) => p.price >= 1500 && p.price <= 2000)
                .length,
            },
            {
              id: "2000-2500",
              label: "₹2,000 – ₹2,499",
              count: products.filter((p) => p.price > 2000 && p.price <= 2500)
                .length,
            },
            {
              id: "above2500",
              label: "₹2,500 & Above",
              count: products.filter((p) => p.price > 2500).length,
            },
          ].map((p) => {
            const isSelected = priceRange === p.id
            return (
              <label
                key={p.id}
                className={`filter-radio-label ${isSelected ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="price-filter"
                  checked={isSelected}
                  onChange={() => setPriceRange(isSelected ? "" : p.id)}
                />
                <span className="filter-item-name">{p.label}</span>
                <span className="filter-item-count">{p.count}</span>
              </label>
            )
          })}
        </div>
      </FilterGroup>

      {/* 4. Color Palette Filter */}
      <FilterGroup title="Color" activeCount={selectedColors.length}>
        <div className="color-filter-list">
          {COLOR_OPTIONS.map((col) => {
            const isSelected = selectedColors.includes(col.name)
            const count = products.filter((p) =>
              p.color.toLowerCase().includes(col.name.toLowerCase()),
            ).length

            if (count === 0) return null

            return (
              <button
                key={col.name}
                type="button"
                className={`color-chip-btn ${isSelected ? "active" : ""}`}
                onClick={() => toggleColor(col.name)}
              >
                <span
                  className="color-dot"
                  style={{
                    backgroundColor: col.hex,
                    border: col.name === "White" ? "1px solid #ccc" : "none",
                  }}
                />
                <span className="color-label">{col.label}</span>
                <span className="color-count">{count}</span>
              </button>
            )
          })}
        </div>
      </FilterGroup>

      {/* 5. Fit Filter */}
      <FilterGroup title="Fit" activeCount={selectedFit ? 1 : 0} collapsed>
        <div className="filter-checkbox-list">
          {[
            { id: "relaxed", label: "Relaxed Fit", count: 18 },
            { id: "regular", label: "Contemporary Regular", count: 9 },
          ].map((f) => {
            const isSelected = selectedFit === f.id
            return (
              <label
                key={f.id}
                className={`filter-radio-label ${isSelected ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="fit-filter"
                  checked={isSelected}
                  onChange={() => setSelectedFit(isSelected ? "" : f.id)}
                />
                <span className="filter-item-name">{f.label}</span>
                <span className="filter-item-count">{f.count}</span>
              </label>
            )
          })}
        </div>
      </FilterGroup>

      {/* 6. Sleeve Filter */}
      <FilterGroup
        title="Sleeve"
        activeCount={selectedSleeve ? 1 : 0}
        collapsed
      >
        <div className="filter-checkbox-list">
          {[
            { id: "half", label: "Half Sleeve (Resort)", count: 15 },
            { id: "full", label: "Full Sleeve", count: 8 },
          ].map((s) => {
            const isSelected = selectedSleeve === s.id
            return (
              <label
                key={s.id}
                className={`filter-radio-label ${isSelected ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="sleeve-filter"
                  checked={isSelected}
                  onChange={() => setSelectedSleeve(isSelected ? "" : s.id)}
                />
                <span className="filter-item-name">{s.label}</span>
                <span className="filter-item-count">{s.count}</span>
              </label>
            )
          })}
        </div>
      </FilterGroup>

      {/* 7. Collar Filter */}
      <FilterGroup
        title="Collar"
        activeCount={selectedCollar ? 1 : 0}
        collapsed
      >
        <div className="filter-checkbox-list">
          {[
            { id: "cuban", label: "Cuban / Resort Collar", count: 12 },
            { id: "classic", label: "Classic Spread Collar", count: 11 },
          ].map((c) => {
            const isSelected = selectedCollar === c.id
            return (
              <label
                key={c.id}
                className={`filter-radio-label ${isSelected ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="collar-filter"
                  checked={isSelected}
                  onChange={() => setSelectedCollar(isSelected ? "" : c.id)}
                />
                <span className="filter-item-name">{c.label}</span>
                <span className="filter-item-count">{c.count}</span>
              </label>
            )
          })}
        </div>
      </FilterGroup>

      {/* 8. Pattern & Craft Filter */}
      <FilterGroup
        title="Pattern"
        activeCount={selectedPattern ? 1 : 0}
        collapsed
      >
        <div className="filter-checkbox-list">
          {[
            { id: "embroidered", label: "Hand Embroidered", count: 16 },
            {
              id: "botanical",
              label: "Botanical & Floral Motifs",
              count: 12,
            },
            {
              id: "handcrafted",
              label: "Handcrafted Threadwork",
              count: 8,
            },
          ].map((pt) => {
            const isSelected = selectedPattern === pt.id
            return (
              <label
                key={pt.id}
                className={`filter-radio-label ${isSelected ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="pattern-filter"
                  checked={isSelected}
                  onChange={() => setSelectedPattern(isSelected ? "" : pt.id)}
                />
                <span className="filter-item-name">{pt.label}</span>
                <span className="filter-item-count">{pt.count}</span>
              </label>
            )
          })}
        </div>
      </FilterGroup>

      {/* 9. Fabric Filter */}
      <FilterGroup
        title="Fabric"
        activeCount={selectedFabric ? 1 : 0}
        collapsed
      >
        <div className="filter-checkbox-list">
          {[
            { id: "linen-blend", label: "Cotton-Linen Blend", count: 21 },
            { id: "cotton", label: "100% Pure Cotton", count: 2 },
          ].map((fb) => {
            const isSelected = selectedFabric === fb.id
            return (
              <label
                key={fb.id}
                className={`filter-radio-label ${isSelected ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="fabric-filter"
                  checked={isSelected}
                  onChange={() => setSelectedFabric(isSelected ? "" : fb.id)}
                />
                <span className="filter-item-name">{fb.label}</span>
                <span className="filter-item-count">{fb.count}</span>
              </label>
            )
          })}
        </div>
      </FilterGroup>

      {/* 10. Occasion Filter */}
      <FilterGroup
        title="Occasion"
        activeCount={selectedOccasion ? 1 : 0}
        collapsed
      >
        <div className="filter-checkbox-list">
          {[
            { id: "beach", label: "Beach & Resort Vacation", count: 8 },
            { id: "casual", label: "Casual Outings & Brunch", count: 14 },
            { id: "evening", label: "Evening Rooftop & Party", count: 6 },
          ].map((oc) => {
            const isSelected = selectedOccasion === oc.id
            return (
              <label
                key={oc.id}
                className={`filter-radio-label ${isSelected ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="occasion-filter"
                  checked={isSelected}
                  onChange={() => setSelectedOccasion(isSelected ? "" : oc.id)}
                />
                <span className="filter-item-name">{oc.label}</span>
                <span className="filter-item-count">{oc.count}</span>
              </label>
            )
          })}
        </div>
      </FilterGroup>

      {/* 11. Discount Filter */}
      <FilterGroup
        title="Discount"
        activeCount={minDiscount > 0 ? 1 : 0}
        collapsed
      >
        <div className="filter-checkbox-list">
          {[
            {
              val: 15,
              label: "15% & Above",
              count: products.filter((p) => p.discount >= 15).length,
            },
            {
              val: 10,
              label: "10% & Above",
              count: products.filter((p) => p.discount >= 10).length,
            },
          ].map((d) => {
            const isSelected = minDiscount === d.val
            return (
              <label
                key={d.val}
                className={`filter-radio-label ${isSelected ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="discount-filter"
                  checked={isSelected}
                  onChange={() => setMinDiscount(isSelected ? 0 : d.val)}
                />
                <span className="filter-item-name">{d.label}</span>
                <span className="filter-item-count">{d.count}</span>
              </label>
            )
          })}
        </div>
      </FilterGroup>

      {/* 12. Rating Filter */}
      <FilterGroup title="Rating" activeCount={minRating > 0 ? 1 : 0} collapsed>
        <div className="filter-checkbox-list">
          {[
            {
              val: 4.5,
              label: "4.5★ & Above",
              count: products.filter((p) => p.rating >= 4.5).length,
            },
            {
              val: 4.0,
              label: "4.0★ & Above",
              count: products.filter((p) => p.rating >= 4.0).length,
            },
          ].map((r) => {
            const isSelected = minRating === r.val
            return (
              <label
                key={r.val}
                className={`filter-radio-label ${isSelected ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="rating-filter"
                  checked={isSelected}
                  onChange={() => setMinRating(isSelected ? 0 : r.val)}
                />
                <span className="filter-item-name">{r.label}</span>
                <span className="filter-item-count">{r.count}</span>
              </label>
            )
          })}
        </div>
      </FilterGroup>

      {/* 13. Availability & Drops */}
      <FilterGroup
        title="Availability"
        activeCount={availability ? 1 : 0}
        collapsed
      >
        <div className="filter-checkbox-list">
          {[
            {
              id: "instock",
              label: "In Stock Only",
              count: products.length,
            },
            {
              id: "new",
              label: "New Arrivals",
              count: products.filter((p) => p.badge === "New").length,
            },
            {
              id: "bestseller",
              label: "Best Sellers",
              count: products.filter((p) => p.badge === "Bestseller").length,
            },
            {
              id: "limited",
              label: "Limited Edition",
              count: products.filter((p) => p.badge === "Limited").length,
            },
          ].map((av) => {
            const isSelected = availability === av.id
            return (
              <label
                key={av.id}
                className={`filter-radio-label ${isSelected ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="availability-filter"
                  checked={isSelected}
                  onChange={() => setAvailability(isSelected ? "" : av.id)}
                />
                <span className="filter-item-name">{av.label}</span>
                <span className="filter-item-count">{av.count}</span>
              </label>
            )
          })}
        </div>
      </FilterGroup>

      {/* Mobile Drawer Bottom CTA */}
      <Button className="apply-filter" onClick={() => setFiltersOpen(false)}>
        Show {totalCount} shirts
      </Button>
    </aside>
  )
}
