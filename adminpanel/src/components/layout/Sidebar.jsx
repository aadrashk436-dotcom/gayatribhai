import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  TicketPercent,
  Image as ImageIcon,
  BookOpen,
  Film,
  Mail,
  Settings,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/orders", icon: ShoppingBag, label: "Orders" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/customers", icon: Users, label: "Customers" },
  { to: "/coupons", icon: TicketPercent, label: "Coupons" },
  { to: "/banners", icon: ImageIcon, label: "Banners" },
  { to: "/blog", icon: BookOpen, label: "Blog & Stories" },
  { to: "/reels", icon: Film, label: "Reels / Videos" },
  { to: "/contacts", icon: Mail, label: "Inquiries" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-[#111214] transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center border-b border-white/10 px-6">
          <div>
            <span className="font-serif text-lg tracking-[0.25em] text-[#d4af37] font-semibold">
              GAYATRI BHAI
            </span>
            <span className="block text-[10px] tracking-widest text-zinc-400 uppercase">
              Atelier Admin Console
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#d4af37]/15 text-[#f3e5ab] border border-[#d4af37]/30 shadow-inner font-semibold"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer info & Logout */}
        <div className="border-t border-white/10 p-4">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <span>View Live Store</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
            <div className="truncate pr-2">
              <p className="text-xs font-medium text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-rose-500/20 hover:text-rose-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
