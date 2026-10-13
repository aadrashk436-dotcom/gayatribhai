import React from "react";

export function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "gold" }) {
  const colorMap = {
    gold: "text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  };

  const badgeStyle = colorMap[color] || colorMap.gold;

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#141618] p-5 shadow-xl transition-all duration-300 hover:border-white/10 hover:bg-[#181a1d]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</h3>
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${badgeStyle}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      
      {(subtitle || trendValue) && (
        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
          {trendValue && (
            <span className={`font-semibold ${trend === "down" ? "text-rose-400" : "text-emerald-400"}`}>
              {trend === "down" ? "↓" : "↑"} {trendValue}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

export default StatCard;
