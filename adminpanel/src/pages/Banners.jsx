import React, { useEffect, useState } from "react";
import { Plus, Trash2, Image as ImageIcon, ExternalLink, RefreshCw } from "lucide-react";
import api from "../api/client";
import Modal from "../components/ui/Modal";

export function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_desktop: "",
    image_mobile: "",
    link: "/shop",
    sort_order: 0,
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/banners");
      setBanners(res.data || []);
    } catch (err) {
      console.error("Failed to load banners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/banners", formData);
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      alert("Failed to save banner");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this hero banner?")) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert("Failed to delete banner");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
            Homepage Hero Banners
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Control the high-impact editorial banners showcased on the storefront home
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: "",
              subtitle: "",
              image_desktop: "",
              image_mobile: "",
              link: "/shop",
              sort_order: banners.length,
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          <span>Add Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {banners.map((b) => (
          <div
            key={b.id}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#131518] shadow-xl"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
              {b.image_desktop ? (
                <img
                  src={b.image_desktop}
                  alt={b.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400">
                  <ImageIcon className="h-10 w-10 opacity-40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-serif text-lg font-bold text-white">{b.title}</h3>
                {b.subtitle && <p className="text-xs text-zinc-300 mt-0.5">{b.subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 text-xs">
              <span className="text-zinc-400">Target: <code className="text-white">{b.link}</code></span>
              <button
                onClick={() => handleDelete(b.id)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Hero Banner">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Banner Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. The Artisanal Linen Atelier"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Subtitle / Tagline</label>
            <input
              type="text"
              placeholder="e.g. Handcrafted French Knot Embroidery & Pure Luxury"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Desktop Image URL *</label>
            <input
              type="text"
              required
              placeholder="/assets/banners/hero_desktop.jpg"
              value={formData.image_desktop}
              onChange={(e) => setFormData({ ...formData, image_desktop: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Mobile Image URL (Optional)</label>
            <input
              type="text"
              placeholder="/assets/banners/hero_mobile.jpg"
              value={formData.image_mobile}
              onChange={(e) => setFormData({ ...formData, image_mobile: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1">Call to Action Link</label>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#d4af37] px-6 py-2 font-semibold text-black hover:brightness-110"
            >
              Save Banner
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Banners;
