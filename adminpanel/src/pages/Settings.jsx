import React, { useEffect, useState } from "react";
import { Save, Shield, Truck, CreditCard, Mail, CheckCircle2, AlertCircle, RefreshCw, Zap } from "lucide-react";
import api from "../api/client";

export function Settings() {
  const [settings, setSettings] = useState({
    pickup_pincode: "452001",
    shiprocket_email: "gayatripuri634@gmail.com",
    razorpay_key_id: "rzp_live_Tl6lD0OL5uKch9",
    smtp_email: "purigayatri006@gmail.com",
    free_shipping_threshold: 3000,
    support_phone: "+91 9876543210",
  });
  const [saved, setSaved] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState({});

  const fetchSettings = async () => {
    try {
      const res = await api.get("/admin/settings");
      if (res.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put("/admin/settings/general", { value: settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Failed to save settings");
    }
  };

  const runTest = async (type) => {
    setTesting((prev) => ({ ...prev, [type]: true }));
    try {
      const res = await api.get(`/admin/settings/test/${type}`);
      setTestResults((prev) => ({ ...prev, [type]: { success: true, message: res.data.message } }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [type]: { success: false, message: err.response?.data?.error || err.message },
      }));
    } finally {
      setTesting((prev) => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
          System & Integration Settings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Configure Shiprocket warehouse postal codes, Razorpay credentials, and atelier details
        </p>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Configuration settings successfully saved to Supabase!</span>
        </div>
      )}

      {/* Live Integration Diagnostics Panel */}
      <div className="rounded-2xl border border-[#d4af37]/30 bg-[#141618] p-5 shadow-xl">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <Zap className="h-4 w-4 text-[#d4af37]" />
          <span>Live API Integration Diagnostics</span>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Test real-time connectivity with your configured third-party services:
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Test Shiprocket */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">Shiprocket API</span>
                <button
                  type="button"
                  disabled={testing.shiprocket}
                  onClick={() => runTest("shiprocket")}
                  className="rounded-lg bg-emerald-500/20 text-emerald-300 px-2 py-1 text-[11px] font-medium hover:bg-emerald-500/30 transition disabled:opacity-50"
                >
                  {testing.shiprocket ? "Testing..." : "Test Connection"}
                </button>
              </div>
              <p className="text-[11px] text-zinc-400">Checks token generation & rate calculation</p>
            </div>
            {testResults.shiprocket && (
              <div
                className={`mt-2 p-2 rounded text-[11px] ${
                  testResults.shiprocket.success
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                }`}
              >
                {testResults.shiprocket.message}
              </div>
            )}
          </div>

          {/* Test Razorpay */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">Razorpay Live</span>
                <button
                  type="button"
                  disabled={testing.razorpay}
                  onClick={() => runTest("razorpay")}
                  className="rounded-lg bg-emerald-500/20 text-emerald-300 px-2 py-1 text-[11px] font-medium hover:bg-emerald-500/30 transition disabled:opacity-50"
                >
                  {testing.razorpay ? "Testing..." : "Test Connection"}
                </button>
              </div>
              <p className="text-[11px] text-zinc-400">Verifies live API key & HMAC secret</p>
            </div>
            {testResults.razorpay && (
              <div
                className={`mt-2 p-2 rounded text-[11px] ${
                  testResults.razorpay.success
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                }`}
              >
                {testResults.razorpay.message}
              </div>
            )}
          </div>

          {/* Test Database */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">Database Layer</span>
                <button
                  type="button"
                  disabled={testing.database}
                  onClick={() => runTest("database")}
                  className="rounded-lg bg-indigo-500/20 text-indigo-300 px-2 py-1 text-[11px] font-medium hover:bg-indigo-500/30 transition disabled:opacity-50"
                >
                  {testing.database ? "Testing..." : "Test Query"}
                </button>
              </div>
              <p className="text-[11px] text-zinc-400">Verifies schema & product tables access</p>
            </div>
            {testResults.database && (
              <div
                className={`mt-2 p-2 rounded text-[11px] ${
                  testResults.database.success
                    ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                }`}
              >
                {testResults.database.message}
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Logistics Section */}
        <div className="rounded-2xl border border-white/10 bg-[#131518] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Truck className="h-4 w-4 text-[#d4af37]" />
            <span>Shiprocket Logistics Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1">Origin Warehouse Pincode *</label>
              <input
                type="text"
                value={settings.pickup_pincode}
                onChange={(e) => setSettings({ ...settings, pickup_pincode: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
              <span className="block text-[11px] text-zinc-400 mt-1">Used for pickup rate calculation</span>
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Free Shipping Order Threshold (₹)</label>
              <input
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="rounded-2xl border border-white/10 bg-[#131518] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <CreditCard className="h-4 w-4 text-[#d4af37]" />
            <span>Razorpay Payments Gateway</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1">Razorpay Live Key ID</label>
              <input
                type="text"
                disabled
                value={settings.razorpay_key_id}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-zinc-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Mode</label>
              <input
                type="text"
                disabled
                value="LIVE PRODUCTION"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-emerald-400 font-semibold uppercase"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-white/10 bg-[#131518] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Mail className="h-4 w-4 text-[#d4af37]" />
            <span>Email & Support Contacts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1">Automated Dispatch Email (SMTP)</label>
              <input
                type="text"
                disabled
                value={settings.smtp_email}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-zinc-400"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Customer Support Phone</label>
              <input
                type="text"
                value={settings.support_phone}
                onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#141618] px-3.5 py-2 text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-[#d4af37] px-6 py-2.5 font-semibold text-black hover:brightness-110 shadow-lg shadow-[#d4af37]/20"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
}

export default Settings;
