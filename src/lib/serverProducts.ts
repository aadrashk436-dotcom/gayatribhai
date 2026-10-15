import fs from "fs"
import path from "path"
import { products as INITIAL_PRODUCTS, type Product } from "./products"

function getDbPath(): string {
  return path.join(process.cwd(), "backend", "src", "data", "db.json")
}

function getProductsJsonPath(): string {
  return path.join(process.cwd(), "backend", "src", "data", "products.json")
}

export function normalizeStoredProduct(p: any): Product {
  // Normalize price and mrp from paise to rupees
  let price = Number(p.price) || 0
  if (price >= 50000) {
    price = Math.round(price / 100)
  }

  let mrp = Number(p.mrp || p.price) || price
  if (mrp >= 50000) {
    mrp = Math.round(mrp / 100)
  }

  const discount =
    mrp > price ? Math.round(((mrp - price) / mrp) * 100) : Number(p.discount) || 0

  return {
    id: String(p.id),
    slug: String(p.slug || p.id),
    name: String(p.name || "Handcrafted Linen Shirt"),
    description: String(p.description || ""),
    price,
    mrp,
    discount,
    category: String(p.category || "Contemporary"),
    sku: String(p.sku || `GB-${p.id}`),
    color: String(p.color || "Ivory"),
    sizes: Array.isArray(p.sizes) ? p.sizes : ["XS", "S", "M", "L", "XL", "XXL"],
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/assets/site_banners/slide1_desktop.jpg"],
    fabric: String(p.fabric || "100% Pure Organic French Linen"),
    occasion: String(p.occasion || "Resort wear, sunset gatherings"),
    rating: Number(p.rating || 4.8),
    reviews: Number(p.reviews_count || p.reviews || 0),
    badge: String(p.badge || "New"),
    stock: typeof p.stock === "object" && p.stock !== null ? p.stock : { XS: 4, S: 5, M: 6, L: 6, XL: 5, XXL: 3 },
    is_visible: p.is_visible !== false,
    weight: Number(p.weight || 0.35),
    length: Number(p.length || 30),
    breadth: Number(p.breadth || 25),
    height: Number(p.height || 4),
  }
}

/**
 * Returns products from backend/src/data/db.json with fallback to initial static array
 */
export function getStoredProducts(includeHidden = false): Product[] {
  try {
    const dbPath = getDbPath()
    if (fs.existsSync(dbPath)) {
      const fileContent = fs.readFileSync(dbPath, "utf8")
      const parsed = JSON.parse(fileContent)
      if (Array.isArray(parsed.products) && parsed.products.length > 0) {
        const normalized = parsed.products.map(normalizeStoredProduct)
        return includeHidden
          ? normalized
          : normalized.filter((p: Product) => p.is_visible !== false)
      }
    }

    const prodJsonPath = getProductsJsonPath()
    if (fs.existsSync(prodJsonPath)) {
      const prodContent = fs.readFileSync(prodJsonPath, "utf8")
      const parsedProd = JSON.parse(prodContent)
      if (Array.isArray(parsedProd) && parsedProd.length > 0) {
        const normalized = parsedProd.map(normalizeStoredProduct)
        return includeHidden
          ? normalized
          : normalized.filter((p: Product) => p.is_visible !== false)
      }
    }
  } catch (err) {
    console.warn("Could not read products from db.json:", err)
  }

  return includeHidden
    ? INITIAL_PRODUCTS
    : INITIAL_PRODUCTS.filter((p) => p.is_visible !== false)
}

/**
 * Look up a product by slug
 */
export function getStoredProductBySlug(slug: string, includeHidden = false): Product | undefined {
  const all = getStoredProducts(includeHidden)
  return all.find((p) => p.slug === slug)
}

/**
 * Look up a product by id or slug
 */
export function getStoredProductById(id: string, includeHidden = false): Product | undefined {
  const all = getStoredProducts(includeHidden)
  return all.find((p) => p.id === id || p.slug === id)
}
