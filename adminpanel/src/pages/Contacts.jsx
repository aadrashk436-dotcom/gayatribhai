import React, { useEffect, useState } from "react";
import { Mail, Phone, CheckCircle, Trash2, RefreshCw } from "lucide-react";
import api from "../api/client";

export function Contacts() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/contacts");
      setMessages(res.data || []);
    } catch (err) {
      console.error("Failed to load inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleRead = async (id, currentRead) => {
    try {
      await api.patch(`/admin/contacts/${id}/read`, { is_read: !currentRead });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: !currentRead } : m))
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this inquiry?")) return;
    try {
      await api.delete(`/admin/contacts/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert("Failed to delete inquiry");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
            Client Inquiries & Concierge Inbox
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Messages, bespoke fitting requests, and feedback submitted via the contact form
          </p>
        </div>

        <button
          onClick={fetchMessages}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        {messages.length ? (
          messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl border p-5 shadow-xl transition ${
                m.is_read
                  ? "border-white/5 bg-[#121315]/60 text-zinc-400"
                  : "border-[#d4af37]/30 bg-[#141619] text-white"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white text-sm">{m.name}</span>
                  <span className="text-xs text-zinc-400">{m.email}</span>
                  {m.phone && <span className="text-xs text-zinc-400 font-mono">{m.phone}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400">
                    {new Date(m.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  <button
                    onClick={() => toggleRead(m.id, m.is_read)}
                    className="rounded-lg p-1.5 text-zinc-400 hover:text-white"
                    title={m.is_read ? "Mark unread" : "Mark as read"}
                  >
                    <CheckCircle
                      className={`h-4 w-4 ${m.is_read ? "text-emerald-400" : "text-zinc-400"}`}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="rounded-lg p-1.5 text-zinc-400 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold text-[#d4af37]">{m.subject}</p>
                <p className="mt-1 text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {m.message}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-xs text-zinc-400">
            No contact messages received yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default Contacts;
