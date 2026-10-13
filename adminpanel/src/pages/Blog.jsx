import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit, BookOpen, RefreshCw } from "lucide-react";
import api from "../api/client";
import Modal from "../components/ui/Modal";

export function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    slug: "",
    category: "Artisanal Craft",
    author_name: "Gayatri Bhai Atelier",
    cover_image: "",
    excerpt: "",
    read_time: "4 min read",
  });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/blog");
      setPosts(res.data || []);
    } catch (err) {
      console.error("Failed to load blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/blog", formData);
      setIsModalOpen(false);
      fetchPosts();
    } catch (err) {
      alert("Failed to save post");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this story?")) return;
    try {
      await api.delete(`/admin/blog/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
            Editorial Stories & Journals
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Publish brand stories, styling advice, and heritage craft features
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: "",
              subtitle: "",
              slug: "",
              category: "Artisanal Craft",
              author_name: "Gayatri Bhai Atelier",
              cover_image: "",
              excerpt: "",
              read_time: "4 min read",
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          <span>New Article</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#131518] p-5 shadow-xl"
          >
            <div>
              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="h-40 w-full rounded-xl object-cover mb-4"
                />
              )}
              <span className="text-[10px] uppercase tracking-wider text-[#d4af37] font-semibold">
                {post.category} • {post.read_time}
              </span>
              <h3 className="font-serif text-base font-bold text-white mt-1">{post.title}</h3>
              <p className="mt-2 text-xs text-zinc-400 line-clamp-3">{post.excerpt}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-zinc-400">{post.author_name}</span>
              <button
                onClick={() => handleDelete(post.id)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Editorial Article">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Cover Image URL</label>
              <input
                type="text"
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Excerpt / Brief</label>
            <textarea
              rows={3}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#141618] p-3 text-white focus:border-[#d4af37] focus:outline-none"
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
              Publish Article
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Blog;
