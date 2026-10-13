"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import type { User, View } from "../../types"
import Icon from "../common/Icon"
import { apiLogin, apiSignup, AuthError } from "../../lib/api"

gsap.registerPlugin(useGSAP)

export interface LoginViewProps {
  mode?: "login" | "signup"
  onLogin: (user: User) => void
  go: (v: View) => void
  showToast: (msg: string) => void
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  error,
  trailing,
  inputMode,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  error?: string
  trailing?: React.ReactNode
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
}) {
  return (
    <div data-auth-item>
      <div className={`group relative rounded-sm border bg-surface transition-colors focus-within:border-foreground ${error ? "border-[#b4321f]" : "border-border"}`}>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder=" "
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="peer h-14 w-full bg-transparent px-4 pb-1.5 pt-5 text-[15px] text-foreground outline-none"
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground transition-all duration-200 peer-focus:top-4 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.12em] peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.12em]"
        >
          {label}
        </label>
        {trailing && <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-[#b4321f]">
          {error}
        </p>
      )}
    </div>
  )
}

export function LoginView({ mode = "login", onLogin, showToast }: LoginViewProps) {
  const isSignup = mode === "signup"
  const router = useRouter()
  const root = useRef<HTMLDivElement>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agree, setAgree] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [switchAction, setSwitchAction] = useState<{ label: string; action: () => void } | null>(null)
  const [loading, setLoading] = useState(false)

  useGSAP(
    () => {
      gsap
        .timeline()
        .fromTo(".auth-visual", { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "expo.inOut" })
        .fromTo(".auth-visual img", { scale: 1.25 }, { scale: 1, duration: 1.6, ease: "expo.out" }, 0.2)
        .from("[data-auth-item]", { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: "power3.out" }, 0.3)
    },
    { scope: root, dependencies: [mode], revertOnUpdate: true },
  )

  const validate = () => {
    const next: Record<string, string> = {}
    setGlobalError(null)
    setSwitchAction(null)

    if (isSignup && name.trim().length < 2) next.name = "Please enter your full name (minimum 2 characters)"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Please enter a valid email address (e.g. name@domain.com)"
    if (isSignup && phone && !/^[0-9+\s-]{10,15}$/.test(phone.trim())) next.phone = "Please enter a valid 10-digit mobile number"
    if (password.length < 6) next.password = "Password must be at least 6 characters"
    if (isSignup && !agree) next.agree = "Please accept the terms to continue"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setGlobalError(null)
    setSwitchAction(null)

    try {
      if (isSignup) {
        const res = await apiSignup({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        })
        onLogin({
          id: res.customer?.id || `usr_${Date.now()}`,
          name: res.customer?.name || name.trim(),
          email: res.customer?.email || email.trim(),
          phone: res.customer?.phone || phone.trim(),
          joinedDate: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
          membershipTier: res.customer?.tier || "Silver",
          points: res.customer?.points || 250,
        })
        showToast("Account created successfully. Welcome to Gayatri Bhai!")
      } else {
        const res = await apiLogin(email.trim(), password)
        onLogin({
          id: res.customer?.id || `usr_${Date.now()}`,
          name: res.customer?.name || email.split("@")[0].replace(/[._]/g, " "),
          email: res.customer?.email || email.trim(),
          phone: res.customer?.phone || phone.trim(),
          joinedDate: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
          membershipTier: res.customer?.tier || "Silver",
          points: res.customer?.points || 1240,
        })
        showToast(res.isAdmin ? "Welcome back, Store Admin!" : `Welcome back, ${res.customer?.name || "Customer"}`)
      }
    } catch (err: any) {
      if (err?.alreadyExists || err?.status === 409 || err?.message?.includes("already registered")) {
        setGlobalError("An account with this email already exists.")
        setSwitchAction({
          label: "Click here to Sign In with this email",
          action: () => router.push("/login"),
        })
      } else if (err?.notFound || err?.status === 404 || err?.message?.includes("No account found")) {
        setGlobalError("No account found with this email.")
        setSwitchAction({
          label: "Click here to Create an Account",
          action: () => router.push("/signup"),
        })
      } else if (err?.incorrectPassword || err?.status === 401 || err?.message?.includes("Incorrect password")) {
        setErrors({ password: "Incorrect password. Please verify and try again." })
        setGlobalError("Incorrect password. Please verify and try again.")
      } else {
        setGlobalError(err?.message || "Authentication failed. Please verify your details.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={root} className="grid min-h-[calc(100svh-100px)] bg-background text-foreground md:min-h-[calc(100svh-112px)] lg:grid-cols-2">
      <div className="auth-visual relative h-56 overflow-hidden sm:h-72 lg:h-auto">
        <Image
          src="/assets/banners/auth-portrait.jpg"
          alt="Model in a sage linen shirt against a terracotta wall"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-[center_25%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-6 left-5 right-5 text-white md:bottom-10 md:left-10 lg:bottom-14 lg:left-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] opacity-85">AVYR Inner Circle</p>
          <p className="mt-2 font-display text-3xl leading-tight md:text-5xl">
            {isSignup ? "Join for early drops." : "Good to see you."}
          </p>
        </div>
      </div>

      <div className="flex items-start justify-center px-5 pb-28 pt-8 md:px-10 md:pb-16 md:pt-14 lg:items-center lg:px-16">
        <div className="w-full max-w-md">
          <div data-auth-item className="relative mb-8 grid grid-cols-2 rounded-full border border-border p-1">
            <span
              aria-hidden="true"
              className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-foreground transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] ${
                isSignup ? "translate-x-full" : "translate-x-0"
              }`}
            />
            <Link
              href="/login"
              replace
              className={`relative z-10 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${!isSignup ? "text-background" : "text-foreground"}`}
              aria-current={!isSignup ? "page" : undefined}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              replace
              className={`relative z-10 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${isSignup ? "text-background" : "text-foreground"}`}
              aria-current={isSignup ? "page" : undefined}
            >
              Create account
            </Link>
          </div>

          <h1 data-auth-item className="font-display text-4xl leading-tight md:text-5xl">
            {isSignup ? "Create account" : "Sign in"}
          </h1>
          <p data-auth-item className="mt-2 text-[15px] text-muted-foreground">
            {isSignup ? "Track orders, save favourites and get 10% off." : "Access your orders, wishlist and addresses."}
          </p>

          {globalError && (
            <div data-auth-item className="mt-6 rounded-sm border border-[#b4321f]/40 bg-[#b4321f]/10 p-4 text-sm text-[#b4321f]">
              <p className="font-semibold">{globalError}</p>
              {switchAction && (
                <button
                  type="button"
                  onClick={switchAction.action}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-foreground underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  {switchAction.label} &rarr;
                </button>
              )}
            </div>
          )}

          <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-4">
            {isSignup && <Field id="name" label="Full name" value={name} onChange={setName} autoComplete="name" error={errors.name} />}
            <Field id="email" label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" inputMode="email" error={errors.email} />
            {isSignup && (
              <Field id="phone" label="Phone (optional)" type="tel" value={phone} onChange={setPhone} autoComplete="tel" inputMode="tel" error={errors.phone} />
            )}
            <Field
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              autoComplete={isSignup ? "new-password" : "current-password"}
              error={errors.password}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
                </button>
              }
            />

            {isSignup ? (
              <label data-auth-item className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 accent-current" />
                <span>
                  I agree to the <span className="text-foreground underline underline-offset-2">Terms</span> and{" "}
                  <span className="text-foreground underline underline-offset-2">Privacy Policy</span>.
                  {errors.agree && <span className="mt-1 block text-xs font-medium text-[#b4321f]">{errors.agree}</span>}
                </span>
              </label>
            ) : (
              <div data-auth-item className="flex justify-end">
                <button type="button" onClick={() => showToast("Reset link sent to your email")} className="text-sm font-medium text-foreground underline underline-offset-4">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              data-auth-item
              type="submit"
              disabled={loading}
              className="group mt-2 flex h-14 items-center justify-center gap-3 rounded-full bg-foreground text-sm font-semibold uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
              {!loading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14m-5-5 5 5-5 5" />
                </svg>
              )}
            </button>

            {/* Quick Demo & Social Login Options */}
            <div data-auth-item className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-background px-4 text-muted-foreground">or quick access</span>
              </div>
            </div>

            <div data-auth-item className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  setTimeout(() => {
                    onLogin({
                      id: "usr_demo",
                      name: "Kabir Mehta",
                      email: "kabir.mehta@avyr.in",
                      phone: "+91 98201 44552",
                      joinedDate: "October 2025",
                      membershipTier: "Gold",
                      points: 1450,
                    })
                    showToast("Signed in as Kabir Mehta (Demo Member)")
                    setLoading(false)
                  }, 400)
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 text-xs font-semibold uppercase tracking-[0.1em] text-foreground transition-all hover:bg-surface-2 active:scale-98"
              >
                <Icon name="check" size={14} />
                <span>One-Click Demo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  setTimeout(() => {
                    onLogin({
                      id: `usr_google_${Date.now()}`,
                      name: isSignup ? "Aarav Sharma" : "Aarav Sharma",
                      email: "aarav.sharma@gmail.com",
                      phone: "+91 98765 12345",
                      joinedDate: "April 2026",
                      membershipTier: "Silver",
                      points: 300,
                    })
                    showToast("Signed in with Google")
                    setLoading(false)
                  }, 500)
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 text-xs font-semibold uppercase tracking-[0.1em] text-foreground transition-all hover:bg-surface-2 active:scale-98"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                </svg>
                <span>Google</span>
              </button>
            </div>
          </form>

          <p data-auth-item className="mt-8 text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account? " : "New to AVYR? "}
            <Link href={isSignup ? "/login" : "/signup"} replace className="font-semibold text-foreground underline underline-offset-4">
              {isSignup ? "Sign in" : "Create account"}
            </Link>
          </p>

          <ul data-auth-item className="mt-10 grid grid-cols-3 gap-3 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            {[
              ["truck", "Free shipping"],
              ["refresh", "7-day returns"],
              ["shield", "Secure checkout"],
            ].map(([icon, label]) => (
              <li key={label} className="flex flex-col items-center gap-2">
                <Icon name={icon as "truck"} size={18} />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default LoginView
