import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, AlertCircle, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const [email, setEmail] = useState("gayatripuri634@gmail.com");
  const [password, setPassword] = useState("AdminPassword123!");
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(email, password);
    if (res.success) {
      navigate("/");
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c0d0e] p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[140px]" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#131518]/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] shadow-inner">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-serif text-2xl font-bold tracking-[0.2em] text-[#d4af37]">
            GAYATRI BHAI
          </h1>
          <p className="mt-1 text-xs tracking-wider uppercase text-zinc-400">
            Artisanal E-Commerce Administration
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Admin Email
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0e1012] pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-400 focus:border-[#d4af37] focus:outline-none transition"
                placeholder="admin@gayatribhai.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Password
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0e1012] pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-400 focus:border-[#d4af37] focus:outline-none transition"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38e22] py-3 text-sm font-semibold tracking-wider uppercase text-black shadow-lg shadow-[#d4af37]/20 transition duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Console"}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-6 border-t border-white/5 pt-4 text-center">
          <p className="text-[11px] text-zinc-400">
            Secured via Supabase RLS & JWT Auth
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
