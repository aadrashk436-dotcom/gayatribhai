import React from "react";
import { Menu, Bell, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Header({ setMobileOpen }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-white/10 bg-[#0e0f11]/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
          <span className="text-xs tracking-wider uppercase text-zinc-400 font-medium">
            Shiprocket & Razorpay Live Integrated
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-zinc-200">
            {user?.name || "Atelier Super Admin"}
          </span>
          <span className="rounded bg-[#d4af37]/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#f3e5ab] uppercase">
            {user?.role || "ADMIN"}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
