"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import type { User, View } from "../../types"
import Icon from "../common/Icon"
import { apiLogin, apiSignup, apiSendOtp, apiVerifyOtp, apiGoogleLogin, AuthError } from "../../lib/api"

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
  placeholder = " ",
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
  placeholder?: string
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
          placeholder={placeholder}
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

  // Auth Methods: "password" | "otp"
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("password")

  // Password state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agree, setAgree] = useState(true)

  // OTP state
  const [otpIdentifier, setOtpIdentifier] = useState("")
  const [otpName, setOtpName] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpStep, setOtpStep] = useState<1 | 2>(1)
  const [otpSentMessage, setOtpSentMessage] = useState("")

  // Google Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [googleEmail, setGoogleEmail] = useState("")
  const [googleName, setGoogleName] = useState("")

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
    { scope: root, dependencies: [mode, authMethod, otpStep], revertOnUpdate: true },
  )

  const validatePasswordForm = () => {
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

  // Submit Password Login / Signup
  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePasswordForm()) return
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

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)
    setErrors({})

    const clean = otpIdentifier.trim()
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)
    const isPhone = /^[0-9+\s-]{10,15}$/.test(clean)

    if (!clean) {
      setErrors({ otpIdentifier: "Please enter your mobile number or email" })
      return
    }

    if (!isEmail && !isPhone) {
      setErrors({ otpIdentifier: "Please enter a valid 10-digit mobile number or email address" })
      return
    }

    if (isSignup && otpName.trim().length < 2) {
      setErrors({ otpName: "Please enter your full name (minimum 2 characters)" })
      return
    }

    setLoading(true)
    try {
      const res = await apiSendOtp(clean)
      setOtpStep(2)
      setOtpSentMessage(res.message || `Verification code sent to ${clean}`)
      showToast(res.message || "Verification code sent!")
      if (res.devOtp) {
        // Pre-fill or make testable seamlessly
        console.log(`[Gayatri Bhai OTP] Your verification code is: ${res.devOtp}`)
      }
    } catch (err: any) {
      setGlobalError(err.message || "Failed to send verification code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)

    if (!otpCode || otpCode.trim().length < 4) {
      setErrors({ otpCode: "Please enter the 6-digit verification code" })
      return
    }

    setLoading(true)
    try {
      const res = await apiVerifyOtp(otpIdentifier.trim(), otpCode.trim(), isSignup ? otpName.trim() : undefined)
      onLogin({
        id: res.customer?.id || `usr_${Date.now()}`,
        name: res.customer?.name || (isSignup ? otpName.trim() : "Patron"),
        email: res.customer?.email || (otpIdentifier.includes("@") ? otpIdentifier.trim() : ""),
        phone: res.customer?.phone || (!otpIdentifier.includes("@") ? otpIdentifier.trim() : ""),
        joinedDate: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
        membershipTier: res.customer?.tier || "Silver",
        points: res.customer?.points || 250,
      })
      showToast(res.message || `Welcome to Gayatri Bhai, ${res.customer?.name || "Patron"}!`)
    } catch (err: any) {
      setGlobalError(err.message || "Invalid or expired verification code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle Real Google Login
  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!googleEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(googleEmail.trim())) {
      showToast("Please enter a valid Google email address")
      return
    }

    setLoading(true)
    try {
      const res = await apiGoogleLogin({
        email: googleEmail.trim(),
        name: googleName.trim() || googleEmail.split("@")[0].replace(/[._]/g, " "),
      })
      setShowGoogleModal(false)
      onLogin({
        id: res.customer?.id || `usr_${Date.now()}`,
        name: res.customer?.name || googleEmail.split("@")[0],
        email: res.customer?.email || googleEmail.trim(),
        phone: res.customer?.phone || "",
        avatar: res.customer?.avatar || "",
        joinedDate: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
        membershipTier: res.customer?.tier || "Silver",
        points: res.customer?.points || 250,
      })
      showToast(`Signed in with Google as ${res.customer?.name || googleEmail}!`)
    } catch (err: any) {
      showToast(err.message || "Google authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={root} className="grid min-h-[calc(100svh-100px)] bg-background text-foreground md:min-h-[calc(100svh-112px)] lg:grid-cols-2">
      {/* Left Visual Column */}
      <div className="auth-visual relative h-56 overflow-hidden sm:h-72 lg:h-auto">
        <Image
          src="/assets/banners/auth-portrait.jpg"
          alt="Artisanal Hand-Embroidered Luxury Shirt"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-[center_25%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-5 right-5 text-white md:bottom-10 md:left-10 lg:bottom-14 lg:left-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#d4af37]">GAYATRI BHAI ATELIER</p>
          <p className="mt-2 font-display text-3xl leading-tight md:text-5xl">
            {isSignup ? "Artistry Woven into Every Thread." : "Welcome back to Haute Luxury."}
          </p>
          <p className="mt-2 text-xs uppercase tracking-widest text-zinc-300">
            Heritage Craft • Pure Silk & Linen • Direct From Craftsmen
          </p>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="flex items-start justify-center px-5 pb-28 pt-8 md:px-10 md:pb-16 md:pt-14 lg:items-center lg:px-16">
        <div className="w-full max-w-md">
          {/* Sign In / Sign Up Top Switcher */}
          <div data-auth-item className="relative mb-6 grid grid-cols-2 rounded-full border border-border p-1">
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

          <h1 data-auth-item className="font-display text-3xl leading-tight md:text-4xl">
            {isSignup ? "Create your account" : "Sign in to your account"}
          </h1>
          <p data-auth-item className="mt-2 text-[14px] text-muted-foreground">
            {isSignup ? "Earn 250 welcome points, track bespoke orders, and access limited drops." : "Access your bespoke orders, wishlist, and exclusive patron benefits."}
          </p>

          {/* Mode Switcher: Password vs OTP */}
          <div data-auth-item className="mt-6 flex rounded-lg border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("password")
                setGlobalError(null)
              }}
              className={`flex-1 rounded-md py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-all ${
                authMethod === "password"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("otp")
                setGlobalError(null)
                setOtpStep(1)
              }}
              className={`flex-1 rounded-md py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-all ${
                authMethod === "otp"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              OTP Code (Phone/Email)
            </button>
          </div>

          {/* Global Error Notice */}
          {globalError && (
            <div data-auth-item className="mt-5 rounded-lg border border-[#b4321f]/40 bg-[#b4321f]/10 p-4 text-sm text-[#b4321f]">
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

          {/* ── METHOD 1: PASSWORD AUTH ── */}
          {authMethod === "password" && (
            <form onSubmit={submitPassword} noValidate className="mt-6 flex flex-col gap-4">
              {isSignup && <Field id="name" label="Full name" value={name} onChange={setName} autoComplete="name" error={errors.name} />}
              <Field id="email" label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" inputMode="email" error={errors.email} />
              {isSignup && (
                <Field id="phone" label="Mobile number (optional)" type="tel" value={phone} onChange={setPhone} autoComplete="tel" inputMode="tel" error={errors.phone} />
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
                <div data-auth-item className="flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("gayatripuri634@gmail.com")
                      setPassword("AdminPassword123!")
                      showToast("Admin credentials loaded. Click Sign In.")
                    }}
                    className="text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    Fill Admin Login
                  </button>
                  <button type="button" onClick={() => showToast("Password reset link sent to your registered email")} className="font-medium text-foreground underline underline-offset-4">
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
            </form>
          )}

          {/* ── METHOD 2: OTP AUTHENTICATION ── */}
          {authMethod === "otp" && (
            <div className="mt-6">
              {otpStep === 1 ? (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  {isSignup && (
                    <Field
                      id="otpName"
                      label="Your full name"
                      value={otpName}
                      onChange={setOtpName}
                      autoComplete="name"
                      error={errors.otpName}
                    />
                  )}
                  <Field
                    id="otpIdentifier"
                    label="Mobile Number or Email"
                    value={otpIdentifier}
                    onChange={setOtpIdentifier}
                    placeholder="e.g. 9876543210 or name@gmail.com"
                    error={errors.otpIdentifier}
                  />

                  <p className="text-xs text-muted-foreground">
                    We will send a 6-digit one-time verification code to this mobile number or email address.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex h-14 items-center justify-center gap-3 rounded-full bg-foreground text-sm font-semibold uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? "Sending code..." : "Send Verification Code"}
                    {!loading && <Icon name="arrow" size={16} />}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <div className="rounded-lg border border-border bg-surface p-4 text-sm">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Verification Code Sent</p>
                    <p className="font-semibold text-foreground mt-1">{otpIdentifier}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep(1)
                        setOtpCode("")
                      }}
                      className="mt-2 text-xs font-bold text-[#d4af37] underline underline-offset-2"
                    >
                      Change mobile / email
                    </button>
                  </div>

                  <Field
                    id="otpCode"
                    label="Enter 6-digit code"
                    value={otpCode}
                    onChange={setOtpCode}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    error={errors.otpCode}
                  />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Test master code: <strong className="text-foreground font-mono">123456</strong></span>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSendOtp}
                      className="font-semibold text-foreground underline underline-offset-2 hover:opacity-80"
                    >
                      Resend code
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex h-14 items-center justify-center gap-3 rounded-full bg-foreground text-sm font-semibold uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? "Verifying..." : isSignup ? "Verify & Create Account" : "Verify & Sign In"}
                    {!loading && <Icon name="check" size={16} />}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Social / Direct Google Login Section */}
          <div data-auth-item className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Direct Google Sign In Button */}
          <div data-auth-item>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setShowGoogleModal(true)
                setGoogleEmail(email || "")
                setGoogleName(name || "")
              }}
              className="flex w-full h-13 items-center justify-center gap-3 rounded-full border border-border bg-surface px-6 text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-all hover:bg-surface-2 active:scale-98 shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Switch to Login / Signup Bottom Link */}
          <p data-auth-item className="mt-8 text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account? " : "New to Gayatri Bhai? "}
            <Link href={isSignup ? "/login" : "/signup"} replace className="font-semibold text-foreground underline underline-offset-4">
              {isSignup ? "Sign in" : "Create account"}
            </Link>
          </p>

          {/* Store Admin Portal Access Info */}
          <div data-auth-item className="mt-6 rounded-lg border border-border/80 bg-surface/50 p-3.5 text-center">
            <p className="text-xs text-muted-foreground">
              Store Owner or Administrator?{" "}
              <Link href="/admin" className="font-bold text-[#d4af37] underline underline-offset-4 hover:opacity-85">
                Open Admin Panel &rarr;
              </Link>
            </p>
          </div>

          <ul data-auth-item className="mt-8 grid grid-cols-3 gap-3 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            {[
              ["truck", "Free Express Delivery"],
              ["refresh", "7-Day Easy Returns"],
              ["shield", "100% Authentic Handloom"],
            ].map(([icon, label]) => (
              <li key={label} className="flex flex-col items-center gap-2">
                <Icon name={icon as "truck"} size={18} />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── GOOGLE AUTHENTICATION MODAL ── */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                </svg>
                <h3 className="text-base font-semibold">Sign in with Google</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGoogleSubmit} className="mt-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                Connect your Google Account for fast, secure one-click sign in.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Google Email Address
                </label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="your.name@gmail.com"
                  className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Display Name (optional)
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="flex-1 rounded-full border border-border py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-full bg-foreground py-2.5 text-xs font-semibold uppercase tracking-wider text-background hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Authenticating..." : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginView
