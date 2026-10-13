import React from "react";

export function StatusBadge({ status, type = "order" }) {
  if (!status) return null;

  const s = status.toLowerCase();

  const styles = {
    // Order statuses
    new: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    confirmed: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    processing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    shipped: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    cancelled: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    rto: "bg-orange-500/15 text-orange-400 border-orange-500/30",

    // Payment statuses
    paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    refunded: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    failed: "bg-rose-500/15 text-rose-400 border-rose-500/30",

    // General / Visibility
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    hidden: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
    in_stock: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    out_of_stock: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  };

  const currentStyle = styles[s] || "bg-zinc-800 text-zinc-300 border-zinc-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium tracking-wide uppercase rounded-full border ${currentStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default StatusBadge;
