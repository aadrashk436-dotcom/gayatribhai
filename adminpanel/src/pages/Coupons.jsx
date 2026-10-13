import React, { useEffect, useState } from "react";
import { Plus, Trash2, TicketPercent, Check, X, RefreshCw } from "lucide-react";
import api from "../api/client";
import Modal from "../components/ui/Modal";

export function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "percentage",
    value: 10,
    min_order_amount: 1500,
    max_discount_amount: 500,
    usage_limit: 100,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/coupons");
      setCoupons(res.data || []);
    } catch (err) {
      console.error("Failed to load coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/coupons", {
        code: formData.code.toUpperCase().trim(),
        description: formData.description,
        type: formData.type,
        value: parseInt(formData.value),
        min_order_amount: Math.round(parseFloat(formData.min_order_amount || 0) * 100),
        max_discount_amount: formData.max_discount_amount
          ? Math.round(parseFloat(formData.max_discount_amount) * 100)
          : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      });
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create coupon");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
            Promotional Coupons
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Create discount codes, cart minimum rules, and redemption limits
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              code: "",
              description: "",
              type: "percentage",
              value: 10,
              min_order_amount: 1500,
              max_discount_amount: 500,
              usage_limit: 100,
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-white/10 bg-[#131518] p-5 shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-bold tracking-wider text-[#d4af37]">
                {c.code}
              </span>
              <button
                onClick={() => handleDelete(c.id)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-300">{c.description || "No description provided"}</p>

            <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-white font-semibold">
                  {c.type === "percentage" ? `${c.value}% OFF` : `₹${c.value / 100} Flat OFF`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Min Order</span>
                <span className="text-white">₹{(c.min_order_amount || 0) / 100}</span>
              </div>
              <div className="flex justify-between">
                <span>Redemptions</span>
                <span className="text-white">
                  {c.used_count || 0} / {c.usage_limit || "∞"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Promotional Coupon"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Coupon Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. LUXURY20"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white uppercase font-mono focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. 20% off on all linen shirts above ₹2,000"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1">Discount Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">
                Value ({formData.type === "percentage" ? "%" : "₹"}) *
              </label>
              <input
                type="number"
                required
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1">Minimum Order Value (₹)</label>
              <input
                type="number"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Usage Limit</label>
              <input
                type="number"
                placeholder="Unlimited if blank"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#d4af37] px-6 py-2 font-semibold text-black hover:brightness-110"
            >
              Save Coupon
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Coupons;
