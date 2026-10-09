"use client"

import { useEffect, useMemo, useState } from "react"
import { products } from "../../products"
import { allSizes, categories, type Product } from "../../types"
import Button from "../common/Button"
import Empty from "../common/Empty"
import Icon from "../common/Icon"
import ProductCard from "../product/ProductCard"
import ShopFilterSidebar from "./ShopFilterSidebar"

export interface ShopViewProps {
  openProduct: (p: Product) => void
  wishlist: string[]
  toggleWish: (id: string) => void
  addToCart: (p: Product) => void
}

export function ShopView({
  openProduct,
  wishlist,
  toggleWish,
  addToCart,
}: ShopViewProps) {
  // Filter states
  const [sort, setSort] = useState("Recommended")
  const [filtersOpen, setFiltersOpen] = useState(false)
  // Desktop filter sidebar position: "left" (default) or "right"
  const [filterPosition, setFilterPosition] = useState<"left" | "right">(() => {
    try {
      const saved = localStorage.getItem("avyr-filter-pos")
      return saved === "right" ? "right" : "left"
    } catch {
      return "left"
    }
  })

  const handlePositionChange = (pos: "left" | "right") => {
    setFilterPosition(pos)
    try {
      localStorage.setItem("avyr-filter-pos", pos)
    } catch {
      // ignore
    }
  }

  // Mobile layout mode: 2 (compact grid) or 1 (large single column feed)
  const [mobileCols, setMobileCols] = useState<1 | 2>(() => {
    try {
      const saved = localStorage.getItem("avyr-mobile-grid-cols")
      return saved === "1" ? 1 : 2
    } catch {
      return 2
    }
  })

  const handleColsChange = (cols: 1 | 2) => {
    setMobileCols(cols)
    try {
      localStorage.setItem("avyr-mobile-grid-cols", String(cols))
    } catch {
      // ignore
    }
  }
  const [category, setCategory] = useState("All Shirts")
  const [size, setSize] = useState("")
  const [priceRange, setPriceRange] = useState("")
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedFit, setSelectedFit] = useState("")
  const [selectedSleeve, setSelectedSleeve] = useState("")
  const [selectedCollar, setSelectedCollar] = useState("")
  const [selectedPattern, setSelectedPattern] = useState("")
  const [selectedFabric, setSelectedFabric] = useState("")
  const [selectedOccasion, setSelectedOccasion] = useState("")
  const [minDiscount, setMinDiscount] = useState<number>(0)
  const [minRating, setMinRating] = useState<number>(0)
  const [availability, setAvailability] = useState("")
  const [visible, setVisible] = useState(24)

  // Whenever any filter changes, reset visible so user sees all filtered products immediately
  useEffect(() => {
    setVisible(24)
  }, [
    category,
    size,
    priceRange,
    selectedColors,
    selectedFit,
    selectedSleeve,
    selectedCollar,
    selectedPattern,
    selectedFabric,
    selectedOccasion,
    minDiscount,
    minRating,
    availability,
  ])

  // Toggle color filter
  const toggleColor = (c: string) => {
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    )
  }

  // Clear all filters
  const clearAllFilters = () => {
    setCategory("All Shirts")
    setSize("")
    setPriceRange("")
    setSelectedColors([])
    setSelectedFit("")
    setSelectedSleeve("")
    setSelectedCollar("")
    setSelectedPattern("")
    setSelectedFabric("")
    setSelectedOccasion("")
    setMinDiscount(0)
    setMinRating(0)
    setAvailability("")
    setVisible(12)
  }

  // Check if any filter is active
  const hasActiveFilters =
    category !== "All Shirts" ||
    Boolean(size) ||
    Boolean(priceRange) ||
    selectedColors.length > 0 ||
    Boolean(selectedFit) ||
    Boolean(selectedSleeve) ||
    Boolean(selectedCollar) ||
    Boolean(selectedPattern) ||
    Boolean(selectedFabric) ||
    Boolean(selectedOccasion) ||
    minDiscount > 0 ||
    minRating > 0 ||
    Boolean(availability)

  // Count active filters
  const activeFilterCount =
    (category !== "All Shirts" ? 1 : 0) +
    (size ? 1 : 0) +
    (priceRange ? 1 : 0) +
    selectedColors.length +
    (selectedFit ? 1 : 0) +
    (selectedSleeve ? 1 : 0) +
    (selectedCollar ? 1 : 0) +
    (selectedPattern ? 1 : 0) +
    (selectedFabric ? 1 : 0) +
    (selectedOccasion ? 1 : 0) +
    (minDiscount > 0 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (availability ? 1 : 0)

  // Filtered and sorted product list
  const list = useMemo(() => {
    let result = [...products]

    // 1. Category
    if (category !== "All Shirts") {
      result = result.filter((p) =>
        category === "Linen"
          ? p.fabric.toLowerCase().includes("linen")
          : p.category.toLowerCase().includes(category.toLowerCase()) ||
            p.name.toLowerCase().includes(category.toLowerCase()),
      )
    }

    // 2. Size
    if (size) {
      result = result.filter((p) => p.stock[size] && p.stock[size] > 0)
    }

    // 3. Price
    if (priceRange === "under1500") {
      result = result.filter((p) => p.price < 1500)
    } else if (priceRange === "1500-2000") {
      result = result.filter((p) => p.price >= 1500 && p.price <= 2000)
    } else if (priceRange === "2000-2500") {
      result = result.filter((p) => p.price > 2000 && p.price <= 2500)
    } else if (priceRange === "above2500") {
      result = result.filter((p) => p.price > 2500)
    }

    // 4. Color
    if (selectedColors.length > 0) {
      result = result.filter((p) => {
        const pColor = p.color.toLowerCase()
        return selectedColors.some((c) => pColor.includes(c.toLowerCase()))
      })
    }

    // 5. Fit
    if (selectedFit === "relaxed") {
      result = result.filter(
        (p) =>
          p.description.toLowerCase().includes("relaxed") ||
          p.occasion.toLowerCase().includes("relaxed"),
      )
    } else if (selectedFit === "regular") {
      result = result.filter(
        (p) =>
          !p.description.toLowerCase().includes("relaxed") ||
          p.category === "Contemporary",
      )
    }

    // 6. Sleeve
    if (selectedSleeve === "half") {
      result = result.filter(
        (p) =>
          p.category === "BeachSide" ||
          p.description.toLowerCase().includes("breezy") ||
          p.price <= 2399,
      )
    } else if (selectedSleeve === "full") {
      result = result.filter(
        (p) => p.category === "Contemporary" || p.price > 2399,
      )
    }

    // 7. Collar
    if (selectedCollar === "cuban") {
      result = result.filter(
        (p) =>
          p.category === "BeachSide" ||
          p.name.toLowerCase().includes("beach") ||
          p.name.toLowerCase().includes("havana"),
      )
    } else if (selectedCollar === "classic") {
      result = result.filter((p) => p.category !== "BeachSide")
    }

    // 8. Pattern
    if (selectedPattern === "embroidered") {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes("embroidered") ||
          p.description.toLowerCase().includes("embroidery"),
      )
    } else if (selectedPattern === "handcrafted") {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes("handcrafted") ||
          p.name.toLowerCase().includes("artisan"),
      )
    } else if (selectedPattern === "botanical") {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes("leaf") ||
          p.name.toLowerCase().includes("tree") ||
          p.name.toLowerCase().includes("leaves") ||
          p.category === "Nature",
      )
    }

    // 9. Fabric
    if (selectedFabric === "linen-blend") {
      result = result.filter((p) => p.fabric.toLowerCase().includes("linen"))
    } else if (selectedFabric === "cotton") {
      result = result.filter((p) => p.fabric.toLowerCase().includes("cotton"))
    }

    // 10. Occasion
    if (selectedOccasion === "beach") {
      result = result.filter(
        (p) =>
          p.category === "BeachSide" ||
          p.occasion.toLowerCase().includes("beach") ||
          p.occasion.toLowerCase().includes("vacation"),
      )
    } else if (selectedOccasion === "casual") {
      result = result.filter(
        (p) =>
          p.category === "Contemporary" ||
          p.occasion.toLowerCase().includes("casual"),
      )
    } else if (selectedOccasion === "evening") {
      result = result.filter(
        (p) =>
          p.occasion.toLowerCase().includes("evening") || p.badge === "Limited",
      )
    }

    // 11. Discount
    if (minDiscount > 0) {
      result = result.filter((p) => p.discount >= minDiscount)
    }

    // 12. Rating
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating)
    }

    // 13. Availability & Badges
    if (availability === "instock") {
      result = result.filter((p) => Object.values(p.stock).some((s) => s > 0))
    } else if (availability === "new") {
      result = result.filter((p) => p.badge.toLowerCase() === "new")
    } else if (availability === "bestseller") {
      result = result.filter((p) => p.badge.toLowerCase() === "bestseller")
    } else if (availability === "limited") {
      result = result.filter((p) => p.badge.toLowerCase() === "limited")
    }

    // Sorting
    if (sort === "Price: Low to High") result.sort((a, b) => a.price - b.price)
    if (sort === "Price: High to Low") result.sort((a, b) => b.price - a.price)
    if (sort === "Customer Rating") result.sort((a, b) => b.rating - a.rating)
    if (sort === "Discount") result.sort((a, b) => b.discount - a.discount)
    if (sort === "Newest") {
      result.sort(
        (a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0),
      )
    }

    return result
  }, [
    category,
    size,
    priceRange,
    selectedColors,
    selectedFit,
    selectedSleeve,
    selectedCollar,
    selectedPattern,
    selectedFabric,
    selectedOccasion,
    minDiscount,
    minRating,
    availability,
    sort,
  ])

  return (
    <div className="shop-page">
      {/* Shop Hero Banner */}
      <div className="shop-hero">
        <span className="eyebrow">The Shirt Collection</span>
        <h1>{"Men's Shirts"}</h1>
        <p>
          Distinctive shirts, naturally made. Explore hand embroidery, relaxed
          resort silhouettes and contemporary classics.
        </p>
        <div className="category-pills">
          {[
            "All Shirts",
            "Contemporary",
            "BeachSide",
            "Nature",
            "Floral",
            "Linen",
          ].map((c) => (
            <button
              className={category === c ? "active" : ""}
              key={c}
              onClick={() => setCategory(c)}
              type="button"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Bar with count and sorting */}
      <div className="catalog-bar">
        <div className="catalog-count-wrap">
          <span>
            Showing <strong>{list.length}</strong> of {products.length} shirts
          </span>
          <div className="catalog-count-right-group">
            {hasActiveFilters && (
              <span className="active-filter-indicator">
                ({activeFilterCount} active)
              </span>
            )}
            {/* Mobile 1-Col vs 2-Col View Switcher */}
            <div
              className="mobile-view-switcher mobile-only"
              role="group"
              aria-label="Grid layout"
            >
              <button
                type="button"
                className={`view-switcher-btn ${
                  mobileCols === 1 ? "active" : ""
                }`}
                onClick={() => handleColsChange(1)}
                title="Single column large view"
                aria-label="Single column large view"
              >
                <Icon name="grid-1" size={13} />
              </button>
              <button
                type="button"
                className={`view-switcher-btn ${
                  mobileCols === 2 ? "active" : ""
                }`}
                onClick={() => handleColsChange(2)}
                title="Two columns grid view"
                aria-label="Two columns grid view"
              >
                <Icon name="grid-2" size={13} />
              </button>
            </div>
          </div>
        </div>

        <div className="catalog-actions-wrap">
          {/* Desktop Left/Right Sidebar Position Switcher */}
          <div
            className="filter-position-switcher desktop-only"
            role="group"
            aria-label="Filter sidebar position"
          >
            <span className="switcher-caption">Sidebar:</span>
            <div className="switcher-pills">
              <button
                type="button"
                className={`switcher-pill ${
                  filterPosition === "left" ? "active" : ""
                }`}
                onClick={() => handlePositionChange("left")}
                title="Keep filter sidebar on Left (Sticky)"
              >
                <Icon name="sliders" size={11} />
                <span>Left</span>
              </button>
              <button
                type="button"
                className={`switcher-pill ${
                  filterPosition === "right" ? "active" : ""
                }`}
                onClick={() => handlePositionChange("right")}
                title="Move filter sidebar to Right (Sticky)"
              >
                <span>Right</span>
                <Icon name="sliders" size={11} />
              </button>
            </div>
          </div>

          <Button
            variant="outline"
            className="filter-toggle"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Icon name="filter" /> Filters
            {activeFilterCount > 0 && <b>{activeFilterCount}</b>}
          </Button>

          <label className="sort-label">
            Sort by:{" "}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {[
                "Recommended",
                "Newest",
                "Customer Rating",
                "Price: Low to High",
                "Price: High to Low",
                "Discount",
              ].map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Semi-transparent Half-Screen Backdrop for Mobile Side Drawer */}
      <div
        className={`filter-backdrop ${filtersOpen ? "open" : ""}`}
        onClick={() => setFiltersOpen(false)}
        aria-hidden="true"
      />

      {/* Main Catalog Layout with Sticky Filters Sidebar (Supports Left or Right position) */}
      <div className={`catalog-layout layout-${filterPosition}`}>
        {/* Product Catalog Display (Independent Scroll) */}
        <div className="catalog-products">
          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div className="active-filters-bar">
              <span className="active-filters-label">Active:</span>

              {category !== "All Shirts" && (
                <button
                  type="button"
                  className="filter-tag-chip"
                  onClick={() => setCategory("All Shirts")}
                >
                  Category: {category}
                  <Icon name="close" size={12} />
                </button>
              )}

              {size && (
                <button
                  type="button"
                  className="filter-tag-chip"
                  onClick={() => setSize("")}
                >
                  Size: {size}
                  <Icon name="close" size={12} />
                </button>
              )}

              {priceRange && (
                <button
                  type="button"
                  className="filter-tag-chip"
                  onClick={() => setPriceRange("")}
                >
                  Price:{" "}
                  {priceRange === "under1500"
                    ? "< ₹1.5k"
                    : priceRange === "1500-2000"
                      ? "₹1.5k–₹2k"
                      : priceRange === "2000-2500"
                        ? "₹2k–₹2.5k"
                        : "> ₹2.5k"}
                  <Icon name="close" size={12} />
                </button>
              )}

              {selectedColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="filter-tag-chip"
                  onClick={() => toggleColor(c)}
                >
                  Color: {c}
                  <Icon name="close" size={12} />
                </button>
              ))}

              {selectedFit && (
                <button
                  type="button"
                  className="filter-tag-chip"
                  onClick={() => setSelectedFit("")}
                >
                  Fit: {selectedFit}
                  <Icon name="close" size={12} />
                </button>
              )}

              {selectedSleeve && (
                <button
                  type="button"
                  className="filter-tag-chip"
                  onClick={() => setSelectedSleeve("")}
                >
                  Sleeve: {selectedSleeve}
                  <Icon name="close" size={12} />
                </button>
              )}

              {selectedCollar && (
                <button
                  type="button"
                  className="filter-tag-chip"
                  onClick={() => setSelectedCollar("")}
                >
                  Collar: {selectedCollar}
                  <Icon name="close" size={12} />
                </button>
              )}

              {selectedPattern && (
                <button
                  type="button"
                  className="filter-tag-chip"
                  onClick={() => setSelectedPattern("")}
                >
                  Pattern: {selectedPattern}
                  <Icon name="close" size={12} />
                </button>
              )}

              {selectedFabric && (
                <button
                  type="button"
                  className="filter-tag-chip"
                  onClick={() => setSelectedFabric("")}
                >
                  Fabric: {selectedFabric}
                  <Icon name="close" size={12} />
                </button>
              )}

              {selectedOccasion && (
                <button
                  type="button"
                  className="filter-tag-chip"
                  onClick={() => setSelectedOccasion("")}
                >
                  Occasion: {selectedOccasion}
                  <Icon name="close" size={12} />
                </button>
              )}

              {minDiscount > 0 && (
                <button
                  type="button"
                  className="filter-tag-chip"
                  onClick={() => setMinDiscount(0)}
                >
                  Discount: {minDiscount}%+
                  <Icon name="close" size={12} />
                </button>
              )}

              {minRating > 0 && (
                <button
                  type="button"
                  className="filter-tag-chip"
                  onClick={() => setMinRating(0)}
                >
                  Rating: {minRating}★+
                  <Icon name="close" size={12} />
                </button>
              )}

              {availability && (
                <button
                  type="button"
                  className="filter-tag-chip"
                  onClick={() => setAvailability("")}
                >
                  {availability}
                  <Icon name="close" size={12} />
                </button>
              )}

              <button
                type="button"
                className="clear-all-chips-btn"
                onClick={clearAllFilters}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Cards Grid or Empty State */}
          {list.length > 0 ? (
            <div
              key={`${category}-${size}-${priceRange}-${selectedColors.join(",")}-${selectedFit}-${selectedSleeve}-${selectedCollar}-${selectedPattern}-${selectedFabric}-${selectedOccasion}-${minDiscount}-${minRating}-${availability}-${sort}`}
              className={`product-grid shop-grid mobile-cols-${mobileCols}`}
            >
              {list.slice(0, visible).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wishlisted={wishlist.includes(p.id)}
                  onWish={() => toggleWish(p.id)}
                  onOpen={() => openProduct(p)}
                  onAdd={() => addToCart(p)}
                />
              ))}
            </div>
          ) : (
            <div className="catalog-empty-wrap">
              <Empty
                icon="filter"
                title="No shirts match your filters"
                copy="Try adjusting your size, color, or price filters to see more handcrafted shirts."
                action="Reset all filters"
                onAction={clearAllFilters}
              />
            </div>
          )}

          {/* Load More Button */}
          {visible < list.length && (
            <Button
              variant="outline"
              className="load-more"
              onClick={() => setVisible(visible + 8)}
            >
              Load more shirts ({list.length - visible} remaining)
            </Button>
          )}
        </div>

        {/* Sticky Filters Sidebar on the Right (PC Desktop) / Half-Screen Drawer on Mobile */}
        <ShopFilterSidebar
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          activeFilterCount={activeFilterCount}
          hasActiveFilters={hasActiveFilters}
          clearAllFilters={clearAllFilters}
          category={category}
          setCategory={setCategory}
          size={size}
          setSize={setSize}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          selectedColors={selectedColors}
          toggleColor={toggleColor}
          selectedFit={selectedFit}
          setSelectedFit={setSelectedFit}
          selectedSleeve={selectedSleeve}
          setSelectedSleeve={setSelectedSleeve}
          selectedCollar={selectedCollar}
          setSelectedCollar={setSelectedCollar}
          selectedPattern={selectedPattern}
          setSelectedPattern={setSelectedPattern}
          selectedFabric={selectedFabric}
          setSelectedFabric={setSelectedFabric}
          selectedOccasion={selectedOccasion}
          setSelectedOccasion={setSelectedOccasion}
          minDiscount={minDiscount}
          setMinDiscount={setMinDiscount}
          minRating={minRating}
          setMinRating={setMinRating}
          availability={availability}
          setAvailability={setAvailability}
          totalCount={list.length}
        />
      </div>
    </div>
  )
}

export default ShopView
