import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Truck,
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  RefreshCw,
  PackageCheck,
  Calendar,
  FileText,
  CreditCard,
  Ban,
} from "lucide-react";
import api from "../api/client";
import StatusBadge from "../components/ui/StatusBadge";
import Modal from "../components/ui/Modal";

export function Orders() {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [trackingData, setTrackingData] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data.orders || res.data || []);
      const urlId = searchParams.get("id");
      if (urlId) {
        const found = (res.data.orders || res.data || []).find((o) => o.id === urlId);
        if (found) setSelectedOrder(found);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchParams]);

  const formatPrice = (paise) => {
    if (!paise) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  const handleCreateShiprocket = async (orderId) => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await api.post(`/admin/orders/${orderId}/shiprocket/create`);
      setActionMessage({ type: "success", text: "Shiprocket order created successfully!" });
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({
          ...prev,
          shiprocket_order_id: res.data.shiprocket?.order_id,
          shiprocket_shipment_id: res.data.shiprocket?.shipment_id,
        }));
      }
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to create Shiprocket order",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignAWB = async (orderId) => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await api.post(`/admin/orders/${orderId}/shiprocket/awb`);
      setActionMessage({
        type: "success",
        text: `AWB Assigned: ${res.data.awb_code} (${res.data.courier_name})`,
      });
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({
          ...prev,
          awb_code: res.data.awb_code,
          courier_name: res.data.courier_name,
        }));
      }
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to assign AWB",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSchedulePickup = async (orderId) => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await api.post(`/admin/orders/${orderId}/shiprocket/pickup`);
      setActionMessage({ type: "success", text: "Pickup scheduled successfully!" });
      await fetchOrders();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to schedule pickup",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTrack = async (orderId) => {
    setActionLoading(true);
    try {
      const res = await api.get(`/admin/orders/${orderId}/shiprocket/track`);
      setTrackingData(res.data);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to fetch tracking info",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadLabel = async (orderId) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}/label`);
      if (res.data.label_url) {
        window.open(res.data.label_url, "_blank");
      }
    } catch (err) {
      alert("Failed to download label");
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}/invoice`);
      if (res.data.invoice_url) {
        window.open(res.data.invoice_url, "_blank");
      }
    } catch (err) {
      alert("Failed to download invoice");
    }
  };

  const handleRefund = async (orderId) => {
    if (!confirm("Are you sure you want to issue a full refund via Razorpay?")) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/admin/orders/${orderId}/refund`);
      setActionMessage({ type: "success", text: "Refund initiated via Razorpay!" });
      await fetchOrders();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to process refund",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/orders/${orderId}/shiprocket/cancel`, { reason });
      setActionMessage({ type: "success", text: "Order and shipment cancelled." });
      await fetchOrders();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to cancel order",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shipping_address?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shipping_address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shipping_address?.phone?.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ? true : o.order_status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
            Order Fulfillment Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Process Shiprocket shipments, generate AWBs, schedule pickups & track deliveries
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order #, customer name, phone, city..."
            className="w-full rounded-xl border border-white/10 bg-[#141618] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-400 focus:border-[#d4af37] focus:outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-[#141618] p-1 text-xs">
          {["all", "new", "confirmed", "processing", "shipped", "delivered", "cancelled", "rto"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`rounded-lg px-3 py-1.5 font-medium uppercase tracking-wider transition ${
                  statusFilter === tab
                    ? "bg-[#d4af37] text-black font-semibold shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-white/10 bg-[#131518] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181a1d] border-b border-white/10 text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer & City</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Shiprocket Info</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="cursor-pointer transition hover:bg-white/[0.03]"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {order.order_number}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-zinc-200">
                        {order.shipping_address?.name || "Customer"}
                      </span>
                      <span className="block text-[11px] text-zinc-400">
                        {order.shipping_address?.city}, {order.shipping_address?.pincode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      {order.items?.length || 0} pcs
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.payment_status} type="payment" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.order_status} type="order" />
                    </td>
                    <td className="py-3.5 px-4">
                      {order.awb_code ? (
                        <div>
                          <span className="font-mono text-emerald-400 font-semibold">{order.awb_code}</span>
                          <span className="block text-[10px] text-zinc-400">{order.courier_name}</span>
                        </div>
                      ) : order.shiprocket_order_id ? (
                        <span className="text-[11px] text-yellow-400">Order Created (Pending AWB)</span>
                      ) : (
                        <span className="text-[11px] text-zinc-400">Not Assigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1.5 text-[11px] font-semibold text-[#f3e5ab] transition hover:bg-[#d4af37]/20"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-zinc-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Fulfillment Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => {
            setSelectedOrder(null);
            setActionMessage(null);
            setTrackingData(null);
          }}
          title={`Order Fulfillment — ${selectedOrder.order_number}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            {/* Action Feedback Alert */}
            {actionMessage && (
              <div
                className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
                  actionMessage.type === "success"
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                }`}
              >
                {actionMessage.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{actionMessage.text}</span>
              </div>
            )}

            {/* Shiprocket Action Control Bar */}
            <div className="rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/5 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                Shiprocket Operations Center
              </h4>
              <p className="mt-0.5 text-xs text-zinc-400">
                Execute automated logistics actions directly to your Shiprocket account
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                {!selectedOrder.shiprocket_order_id && selectedOrder.order_status !== "cancelled" && (
                  <button
                    onClick={() => handleCreateShiprocket(selectedOrder.id)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 rounded-lg bg-[#d4af37] px-3.5 py-2 text-xs font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
                  >
                    <Truck className="h-4 w-4" />
                    <span>Create Shiprocket Order</span>
                  </button>
                )}

                {selectedOrder.shiprocket_order_id && !selectedOrder.awb_code && (
                  <button
                    onClick={() => handleAssignAWB(selectedOrder.id)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                  >
                    <PackageCheck className="h-4 w-4" />
                    <span>Assign AWB & Courier</span>
                  </button>
                )}

                {selectedOrder.awb_code && !selectedOrder.pickup_scheduled_date && (
                  <button
                    onClick={() => handleSchedulePickup(selectedOrder.id)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Schedule Courier Pickup</span>
                  </button>
                )}

                {selectedOrder.awb_code && (
                  <button
                    onClick={() => handleTrack(selectedOrder.id)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-white/20"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Track Live</span>
                  </button>
                )}

                {selectedOrder.awb_code && (
                  <button
                    onClick={() => handleDownloadLabel(selectedOrder.id)}
                    className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-white/20"
                  >
                    <Download className="h-4 w-4" />
                    <span>Shipping Label</span>
                  </button>
                )}

                {selectedOrder.shiprocket_order_id && (
                  <button
                    onClick={() => handleDownloadInvoice(selectedOrder.id)}
                    className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-white/20"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Invoice</span>
                  </button>
                )}

                {selectedOrder.order_status !== "cancelled" && !selectedOrder.awb_code && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-500/20"
                  >
                    <Ban className="h-4 w-4" />
                    <span>Cancel Order</span>
                  </button>
                )}

                {selectedOrder.payment_status === "paid" && selectedOrder.order_status === "cancelled" && (
                  <button
                    onClick={() => handleRefund(selectedOrder.id)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-rose-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Issue Razorpay Refund</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Tracking Information */}
            {trackingData && (
              <div className="rounded-xl border border-white/10 bg-[#181a1d] p-4 text-xs">
                <h4 className="font-semibold text-white">Live Tracking Milestones</h4>
                <p className="mt-1 text-zinc-400">
                  Current Status:{" "}
                  <span className="font-bold text-emerald-400">
                    {trackingData.tracking_data?.shipment_track?.[0]?.current_status || "In Transit"}
                  </span>
                </p>
                {trackingData.tracking_data?.shipment_track_activities?.length && (
                  <ul className="mt-3 space-y-2 border-l border-white/10 pl-3">
                    {trackingData.tracking_data.shipment_track_activities.map((act, i) => (
                      <li key={i} className="text-[11px] text-zinc-300">
                        <span className="font-semibold text-white">{act.activity}</span> — {act.location} ({act.date})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Order Items Table */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Purchased Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="mt-3 divide-y divide-white/5 rounded-xl border border-white/10 bg-[#181a1d] p-3">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-10 rounded object-cover border border-white/10"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-[11px] text-zinc-400">
                          SKU: {item.sku} | Size: <span className="text-white font-medium">{item.size}</span> | Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Two Column Details */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-xs">
              {/* Shipping Address */}
              <div className="rounded-xl border border-white/10 bg-[#181a1d] p-4">
                <h4 className="font-semibold uppercase tracking-wider text-zinc-400">
                  Delivery Destination
                </h4>
                <div className="mt-2 space-y-1 text-zinc-300">
                  <p className="font-bold text-white">{selectedOrder.shipping_address?.name}</p>
                  <p>{selectedOrder.shipping_address?.street}</p>
                  {selectedOrder.shipping_address?.area && <p>{selectedOrder.shipping_address.area}</p>}
                  <p>
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} -{" "}
                    <span className="font-mono font-bold text-white">{selectedOrder.shipping_address?.pincode}</span>
                  </p>
                  <p className="pt-1 text-zinc-400">Phone: {selectedOrder.shipping_address?.phone}</p>
                </div>
              </div>

              {/* Payment & Totals */}
              <div className="rounded-xl border border-white/10 bg-[#181a1d] p-4 space-y-2">
                <h4 className="font-semibold uppercase tracking-wider text-zinc-400">
                  Billing Breakdown
                </h4>
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({selectedOrder.coupon_code || "Coupon"})</span>
                    <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping Cost</span>
                  <span className="text-white">
                    {selectedOrder.shipping_cost === 0 ? "FREE" : formatPrice(selectedOrder.shipping_cost)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-white text-sm">
                  <span>Total</span>
                  <span className="text-[#d4af37]">{formatPrice(selectedOrder.total)}</span>
                </div>
                <div className="pt-2 border-t border-white/5 text-[11px] text-zinc-400">
                  <p>Razorpay Order: {selectedOrder.razorpay_order_id || "N/A"}</p>
                  <p>Razorpay Payment: {selectedOrder.razorpay_payment_id || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Orders;
