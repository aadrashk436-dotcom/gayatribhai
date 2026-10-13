import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Layers,
  Image as ImageIcon,
  Check,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import api from "../api/client";
import Modal from "../components/ui/Modal";

export function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    category: "Contemporary",
    price: "",
    mrp: "",
    discount: 0,
    color: "",
    fabric: "Premium Cotton Linen",
    occasion: "Resort & Casual",
    badge: "",
    description: "",
    weight: 0.35,
    length: 30,
    breadth: 25,
    height: 4,
    images: "",
    stockS: 10,
    stockM: 10,
    stockL: 10,
    stockXL: 10,
    stockXXL: 10,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/products");
      setProducts(res.data.products || res.data || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatPrice = (paise) => {
    if (!paise) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  const handleToggleVisibility = async (productId, currentVisibility) => {
    try {
      await api.patch(`/admin/products/${productId}/visibility`, {
        is_visible: !currentVisibility,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_visible: !currentVisibility } : p))
      );
    } catch (err) {
      alert("Failed to toggle visibility");
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      sku: `GB-SHIRT-${Math.floor(Math.random() * 10000)}`,
      category: "Contemporary",
      price: "",
      mrp: "",
      discount: 0,
      color: "",
      fabric: "Pure French Linen",
      occasion: "Resort & Casual",
      badge: "New",
      description: "",
      weight: 0.35,
      length: 30,
      breadth: 25,
      height: 4,
      images: "",
      stockS: 10,
      stockM: 10,
      stockL: 10,
      stockXL: 10,
      stockXXL: 10,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || "",
      slug: p.slug || "",
      sku: p.sku || "",
      category: p.category || "Contemporary",
      price: p.price ? p.price / 100 : "",
      mrp: p.mrp ? p.mrp / 100 : "",
      discount: p.discount || 0,
      color: p.color || "",
      fabric: p.fabric || "",
      occasion: p.occasion || "",
      badge: p.badge || "",
      description: p.description || "",
      weight: p.weight || 0.35,
      length: p.length || 30,
      breadth: p.breadth || 25,
      height: p.height || 4,
      images: Array.isArray(p.images) ? p.images.join("\n") : "",
      stockS: p.stock?.S || 0,
      stockM: p.stock?.M || 0,
      stockL: p.stock?.L || 0,
      stockXL: p.stock?.XL || 0,
      stockXXL: p.stock?.XXL || 0,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const imagesArray = formData.images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        sku: formData.sku,
        category: formData.category,
        price: Math.round(parseFloat(formData.price) * 100),
        mrp: Math.round(parseFloat(formData.mrp || formData.price) * 100),
        discount: parseInt(formData.discount) || 0,
        color: formData.color,
        fabric: formData.fabric,
        occasion: formData.occasion,
        badge: formData.badge,
        description: formData.description,
        weight: parseFloat(formData.weight) || 0.35,
        length: parseFloat(formData.length) || 30,
        breadth: parseFloat(formData.breadth) || 25,
        height: parseFloat(formData.height) || 4,
        images: imagesArray,
        sizes: ["S", "M", "L", "XL", "XXL"],
        stock: {
          S: parseInt(formData.stockS) || 0,
          M: parseInt(formData.stockM) || 0,
          L: parseInt(formData.stockL) || 0,
          XL: parseInt(formData.stockXL) || 0,
          XXL: parseInt(formData.stockXXL) || 0,
        },
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
      } else {
        await api.post("/admin/products", payload);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save product");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ? true : p.category?.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
            Product & Inventory Catalog
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Manage luxury linens, variants, sizes, live stock, and Shiprocket dimensions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38e22] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black shadow-lg shadow-[#d4af37]/20 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title, SKU, category..."
            className="w-full rounded-xl border border-white/10 bg-[#141618] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-400 focus:border-[#d4af37] focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Contemporary">Contemporary</option>
            <option value="BeachSide">BeachSide</option>
            <option value="Classic">Classic</option>
            <option value="Formal">Formal</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-white/10 bg-[#131518] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181a1d] border-b border-white/10 text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock Breakdown</th>
                <th className="py-3.5 px-4">Dimensions (Shiprocket)</th>
                <th className="py-3.5 px-4">Visibility</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.length ? (
                filteredProducts.map((p) => {
                  const coverImg = p.images?.[p.cover_image_index || 0] || p.images?.[0] || "";
                  const totalStock = p.stock ? Object.values(p.stock).reduce((a, b) => a + (b || 0), 0) : 0;

                  return (
                    <tr key={p.id} className="transition hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {coverImg ? (
                            <img
                              src={coverImg}
                              alt={p.name}
                              className="h-12 w-9 rounded object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="flex h-12 w-9 items-center justify-center rounded bg-white/5 text-zinc-400">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-white block max-w-xs truncate">{p.name}</span>
                            <span className="text-[11px] text-zinc-400">
                              {p.fabric} • {p.color}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-300">{p.sku}</td>
                      <td className="py-3.5 px-4">
                        <span className="rounded bg-white/5 px-2 py-1 text-[11px] text-zinc-300">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {formatPrice(p.price)}
                        {p.mrp > p.price && (
                          <span className="block text-[10px] text-zinc-400 line-through">
                            {formatPrice(p.mrp)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            totalStock > 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
                        </span>
                        <div className="mt-0.5 flex gap-1 text-[10px] text-zinc-400">
                          {p.stock &&
                            Object.entries(p.stock).map(([sz, qty]) => (
                              <span key={sz}>
                                {sz}:{qty}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-zinc-300">
                        {p.weight || 0.35} kg • {p.length || 30}×{p.breadth || 25}×{p.height || 4} cm
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleVisibility(p.id, p.is_visible)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition ${
                            p.is_visible
                              ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                              : "bg-zinc-500/15 text-zinc-400 hover:bg-zinc-500/25"
                          }`}
                        >
                          {p.is_visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          <span>{p.is_visible ? "Visible" : "Hidden"}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-300 transition hover:bg-white/10 hover:text-white"
                            title="Edit Product"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-400 transition hover:bg-rose-500/20"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-zinc-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Luxury Product" : "Create New Product"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">SKU (Unique Identifier) *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              >
                <option value="Contemporary">Contemporary</option>
                <option value="BeachSide">BeachSide</option>
                <option value="Classic">Classic</option>
                <option value="Formal">Formal</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Price (₹) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">MRP (Original ₹)</label>
              <input
                type="number"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Fabric</label>
              <input
                type="text"
                value={formData.fabric}
                onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Badge</label>
              <input
                type="text"
                placeholder="New, Bestseller..."
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          {/* Shiprocket Dimension Fields */}
          <div className="rounded-xl border border-white/10 bg-[#181a1d] p-4">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Shiprocket Logistics Dimensions
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Weight (KG)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-[#141618] px-3 py-1.5 text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Length (CM)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-[#141618] px-3 py-1.5 text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Breadth (CM)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.breadth}
                  onChange={(e) => setFormData({ ...formData, breadth: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-[#141618] px-3 py-1.5 text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Height (CM)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-[#141618] px-3 py-1.5 text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Stock Counts per Size */}
          <div className="rounded-xl border border-white/10 bg-[#181a1d] p-4">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Size Stock Inventory
            </h4>
            <div className="grid grid-cols-5 gap-3">
              {["S", "M", "L", "XL", "XXL"].map((sz) => (
                <div key={sz}>
                  <label className="block text-zinc-400 mb-1 font-medium">{sz}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData[`stock${sz}`]}
                    onChange={(e) => setFormData({ ...formData, [`stock${sz}`]: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-[#141618] px-3 py-1.5 text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-zinc-400 mb-1 font-medium">
              Image URLs (one URL per line)
            </label>
            <textarea
              rows={3}
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              placeholder="/assets/products/Azure_Leaf/main.jpg&#10;/assets/products/Azure_Leaf/view_1.jpg"
              className="w-full rounded-xl border border-white/10 bg-[#141618] p-3 text-white font-mono focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-zinc-400 mb-1 font-medium">Editorial Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#141618] p-3 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-zinc-300 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#d4af37] px-6 py-2 font-semibold text-black transition hover:brightness-110"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Products;
