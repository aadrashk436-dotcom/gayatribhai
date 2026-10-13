import React, { useEffect, useState } from "react";
import { Plus, Trash2, Film, RefreshCw } from "lucide-react";
import api from "../api/client";
import Modal from "../components/ui/Modal";

export function Reels() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    caption: "",
    video_url: "",
    poster_url: "",
    tag: "Resort Lookbook",
  });

  const fetchReels = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/reels");
      setReels(res.data || []);
    } catch (err) {
      console.error("Failed to load reels:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/reels", formData);
      setIsModalOpen(false);
      fetchReels();
    } catch (err) {
      alert("Failed to save reel");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this video lookbook?")) return;
    try {
      await api.delete(`/admin/reels/${id}`);
      setReels((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Failed to delete reel");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
            Video Lookbooks & Reels
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Showcase dynamic Instagram-style craftsmanship clips and model try-ons
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: "",
              caption: "",
              video_url: "",
              poster_url: "",
              tag: "Resort Lookbook",
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Reel</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {reels.map((r) => (
          <div
            key={r.id}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#131518] shadow-xl"
          >
            <div className="relative aspect-[9/16] w-full overflow-hidden bg-black/60">
              {r.poster_url ? (
                <img src={r.poster_url} alt={r.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400">
                  <Film className="h-8 w-8 opacity-40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-xs">
                <span className="text-[10px] text-[#d4af37] font-semibold">{r.tag}</span>
                <p className="font-semibold text-white line-clamp-1">{r.title}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 text-[11px] text-zinc-400">
              <span>{r.views || 0} views</span>
              <button
                onClick={() => handleDelete(r.id)}
                className="text-zinc-400 hover:text-rose-400 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Lookbook Reel">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. French Knotted Leaves in Motion"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Video Stream URL (MP4 / CDN) *</label>
            <input
              type="text"
              required
              placeholder="https://assets.gayatribhai.com/reels/linen1.mp4"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Poster Thumbnail URL</label>
            <input
              type="text"
              placeholder="/assets/products/view_1.jpg"
              value={formData.poster_url}
              onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
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
              Save Reel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Reels;
