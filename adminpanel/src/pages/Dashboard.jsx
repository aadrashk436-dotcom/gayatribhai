import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Truck,
  CreditCard,
  Database,
  RefreshCw,
} from "lucide-react";
import api from "../api/client";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/dashboard");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatPrice = (paise) => {
    if (!paise) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
            Atelier Executive Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Real-time fulfillment metrics, Shiprocket shipments, and revenue analytics
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats?.totalRevenue)}
          subtitle="All completed prepaid & COD payments"
          icon={IndianRupee}
          color="gold"
        />
        <StatCard
          title="Today's Sales"
          value={formatPrice(stats?.todayRevenue)}
          subtitle={`${stats?.todayOrders || 0} orders processed today`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          subtitle={`${stats?.pendingCount || 0} orders pending fulfillment`}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          title="Return / RTO Rate"
          value={`${stats?.rtoRate || 0}%`}
          subtitle={`${stats?.rtoCount || 0} return-to-origin packages`}
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white">Shiprocket</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">LIVE</span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">gayatripuri634@gmail.com</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white">Razorpay</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">LIVE</span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">rzp_live_Tl6lD0OL5uKch9</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white">Supabase DB</span>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400">AUTH & RLS</span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">qnhtnbzeyqbrzjguhgsy</p>
          </div>
        </div>
      </div>

      {/* Orders & Quick Actions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Orders Feed */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#131518] p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Recent Customer Orders</h2>
              <p className="text-xs text-zinc-400">Live order stream awaiting fulfillment</p>
            </div>
            <Link
              to="/orders"
              className="flex items-center gap-1 text-xs font-medium text-[#d4af37] transition hover:underline"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            {stats?.recentOrders?.length ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Order #</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3">Fulfillment</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-mono font-medium text-white">{order.order_number}</td>
                      <td className="py-3 px-3 text-zinc-300">
                        {order.shipping_address?.name || "Customer"}
                        <span className="block text-[10px] text-zinc-400">
                          {order.shipping_address?.city}, {order.shipping_address?.pincode}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">{formatPrice(order.total)}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={order.payment_status} type="payment" />
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={order.order_status} type="order" />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/orders?id=${order.id}`}
                          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
                        >
                          Fulfill
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-xs text-zinc-400">
                <ShoppingBag className="mx-auto h-8 w-8 text-zinc-400 mb-2 opacity-40" />
                No orders received yet. Once customers order on the website, they will appear here live.
              </div>
            )}
          </div>
        </div>

        {/* Catalog & Quick Stats */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#131518] p-6 shadow-xl">
            <h2 className="text-base font-semibold text-white">Catalog & Inventory</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-[#d4af37]" />
                  <span className="text-xs text-zinc-300">Total Products</span>
                </div>
                <span className="font-semibold text-white">{stats?.totalProducts || 0}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-zinc-300">Total Customers</span>
                </div>
                <span className="font-semibold text-white">{stats?.totalCustomers || 0}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <Link
                to="/products"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4af37] py-2.5 text-xs font-semibold tracking-wider uppercase text-black transition hover:brightness-110"
              >
                <span>Manage Products & Stock</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
