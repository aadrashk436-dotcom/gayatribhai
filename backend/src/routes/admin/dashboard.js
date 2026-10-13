import { Router } from "express";
import supabase from "../../config/supabase.js";

const router = Router();

// Dashboard stats
router.get("/", async (req, res) => {
  try {
    // Total revenue
    const { data: orders } = await supabase
      .from("orders")
      .select("total, payment_status, order_status, created_at");

    const paidOrders = (orders || []).filter((o) => o.payment_status === "paid");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Today's revenue
    const today = new Date().toISOString().split("T")[0];
    const todayOrders = paidOrders.filter((o) => o.created_at?.startsWith(today));
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Order status counts
    const statusCounts = {};
    for (const o of orders || []) {
      statusCounts[o.order_status] = (statusCounts[o.order_status] || 0) + 1;
    }

    // RTO count
    const rtoCount = statusCounts.rto || 0;
    const rtoRate = orders?.length ? ((rtoCount / orders.length) * 100).toFixed(1) : 0;

    // Total customers
    const { count: totalCustomers } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    // Total products
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    const { count: visibleProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_visible", true);

    // Pending orders (new, no shiprocket assignment)
    const pendingCount = statusCounts.new || 0;
    const confirmedCount = statusCounts.confirmed || 0;

    // Unread contacts
    const { count: unreadContacts } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    // Recent orders
    const { data: recentOrders } = await supabase
      .from("orders")
      .select("id, order_number, total, order_status, payment_status, shipping_address, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    // Revenue chart data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const revenueByDay = {};
    for (const o of paidOrders.filter((o) => o.created_at >= thirtyDaysAgo)) {
      const day = o.created_at.split("T")[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + o.total;
    }

    res.json({
      totalRevenue,
      todayRevenue,
      totalOrders: orders?.length || 0,
      todayOrders: todayOrders.length,
      totalCustomers: totalCustomers || 0,
      totalProducts: totalProducts || 0,
      visibleProducts: visibleProducts || 0,
      pendingCount,
      confirmedCount,
      rtoRate: parseFloat(rtoRate),
      rtoCount,
      unreadContacts: unreadContacts || 0,
      statusCounts,
      recentOrders: recentOrders || [],
      revenueChart: Object.entries(revenueByDay).map(([date, amount]) => ({ date, amount })),
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

export default router;
