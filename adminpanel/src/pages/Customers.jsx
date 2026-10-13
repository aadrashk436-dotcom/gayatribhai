import React, { useEffect, useState } from "react";
import { Search, Mail, Phone, ShoppingBag, IndianRupee, RefreshCw } from "lucide-react";
import api from "../api/client";

export function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/customers");
      setCustomers(res.data.customers || res.data || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const formatPrice = (paise) => {
    if (!paise) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
            Customer Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Registered clientele, order frequency, and lifetime spend records
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, phone..."
          className="w-full rounded-xl border border-white/10 bg-[#141618] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-400 focus:border-[#d4af37] focus:outline-none"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#131518] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181a1d] border-b border-white/10 text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Client Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Lifetime Spent</th>
                <th className="py-3.5 px-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.length ? (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="transition hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-semibold text-white">{c.name}</td>
                    <td className="py-3.5 px-4 text-zinc-300">{c.email}</td>
                    <td className="py-3.5 px-4 text-zinc-400 font-mono">{c.phone || "—"}</td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-zinc-300 font-medium">
                        {c.total_orders || 0} orders
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#d4af37]">
                      {formatPrice(c.total_spent)}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      {new Date(c.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-zinc-400">
                    No customers registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Customers;
