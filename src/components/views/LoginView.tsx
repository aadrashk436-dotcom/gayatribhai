"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import type { User, View } from "../../types"
import Icon from "../common/Icon"
import { apiLogin, apiSignup, apiGoogleLogin, apiDirectGmailLogin, apiForgotPassword, apiResetPassword, AuthError } from "../../lib/api"

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
  placeholder,
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
    <div data-auth-item className="w-full">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80 mb-1.5"
      >
        {label}
      </label>
      <div
        className={`group relative flex items-center rounded-xl border bg-surface/80 px-4 transition-all duration-200 focus-within:bg-surface focus-within:ring-2 ${
          error
            ? "border-[#b4321f] focus-within:border-[#b4321f] focus-within:ring-[#b4321f]/20"
            : "border-border/80 hover:border-border focus-within:border-foreground focus-within:ring-foreground/10"
        }`}
      >
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
          className="h-12 sm:h-13 w-full bg-transparent text-base sm:text-[15px] font-normal text-foreground placeholder:text-muted-foreground/45 outline-none"
        />
        {trailing && <div className="ml-2 shrink-0">{trailing}</div>}
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
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")
  const root = useRef<HTMLDivElement>(null)

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agree, setAgree] = useState(true)

  // Google GIS & Modal state
  const googleBtnContainerRef = useRef<HTMLDivElement>(null)
  const [gisLoaded, setGisLoaded] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [googleDirectEmail, setGoogleDirectEmail] = useState("")
  const [googleDirectName, setGoogleDirectName] = useState("")

  // Forgot / Reset Password state
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetOtp, setResetOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [resetStep, setResetStep] = useState<1 | 2>(1)

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
    { scope: root, dependencies: [mode, isForgotPassword, resetStep], revertOnUpdate: true },
  )

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "766014429369-udhugg1ba4nmig8j16622loo6ou88dnm.apps.googleusercontent.com"

  // Load Google Identity Services (GIS) client script
  useEffect(() => {
    if (typeof window === "undefined") return

    const existingScript = document.getElementById("google-gsi-client")
    if (existingScript) {
      if ((window as any).google?.accounts?.id) setGisLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.id = "google-gsi-client"
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => {
      setGisLoaded(true)
    }
    script.onerror = () => {
      console.warn("Google Identity Services script could not be loaded")
    }
    document.head.appendChild(script)
  }, [])

  // Initialize GIS when script loaded and Google Client ID is configured
  useEffect(() => {
    if (!gisLoaded || !(window as any).google?.accounts?.id || !googleClientId) return

    try {
      ;(window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          if (response?.credential) {
            await handleGoogleCredentialToken(response.credential)
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      ;(window as any).google.accounts.id.prompt()
    } catch (gErr) {
      console.warn("Google Identity Services initialization warning:", gErr)
    }
  }, [gisLoaded, googleClientId, isSignup])

  const validatePasswordForm = () => {
    const next: Record<string, string> = {}
    setGlobalError(null)
    setSwitchAction(null)

    if (isSignup && name.trim().length < 2) next.name = "Please enter your full name (minimum 2 characters)"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Please enter a valid email address (e.g. name@domain.com)"
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
          phone: "",
          password,
        })
        onLogin({
          id: res.customer?.id || `usr_${Date.now()}`,
          name: res.customer?.name || name.trim(),
          email: res.customer?.email || email.trim(),
          phone: res.customer?.phone || "",
          joinedDate: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
          membershipTier: res.customer?.tier || "Silver",
          points: res.customer?.points || 0,
        })
        showToast("Account created successfully. Welcome to Gayatri Bhai!")
      } else {
        const res = await apiLogin(email.trim(), password)
        onLogin({
          id: res.customer?.id || `usr_${Date.now()}`,
          name: res.customer?.name || email.split("@")[0].replace(/[._]/g, " "),
          email: res.customer?.email || email.trim(),
          phone: res.customer?.phone || "",
          joinedDate: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
          membershipTier: res.customer?.tier || "Silver",
          points: res.customer?.points || 0,
        })
        showToast(res.isAdmin ? "Welcome back, Store Admin!" : `Welcome back, ${res.customer?.name || "Customer"}`)
      }
    } catch (err: any) {
      if (err?.alreadyExists || err?.status === 409 || err?.message?.includes("already registered")) {
        setGlobalError("An account with this email already exists.")
        setSwitchAction({
          label: "Click here to Sign In with this email",
          action: () => router.push(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"),
        })
      } else if (err?.notFound || err?.status === 404 || err?.message?.includes("No account found")) {
        setGlobalError("No account found with this email.")
        setSwitchAction({
          label: "Click here to Create an Account",
          action: () => router.push(redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : "/signup"),
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

  // Handle Direct Google / Gmail Authentication
  const handleGoogleDirectAuth = async (targetEmail: string, targetName?: string) => {
    setGlobalError(null)
    setErrors({})

    const clean = targetEmail.trim().toLowerCase()
    if (!clean) {
      setErrors({ googleDirectEmail: "Please enter your Google / Gmail address" })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setErrors({ googleDirectEmail: "Please enter a valid email address (e.g. name@gmail.com)" })
      return
    }

    setLoading(true)
    try {
      const res = await apiDirectGmailLogin(clean, targetName?.trim())
      const customerName = res.customer?.name || targetName?.trim() || clean.split("@")[0]

      setShowGoogleModal(false)
      onLogin({
        id: res.customer?.id || `usr_${Date.now()}`,
        name: customerName,
        email: res.customer?.email || clean,
        phone: res.customer?.phone || "",
        avatar: res.customer?.avatar || "",
        joinedDate: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
        membershipTier: res.customer?.tier || "Silver",
        points: res.customer?.points || 0,
      })
      showToast(res.message || `Signed in with Google as ${customerName}!`)
    } catch (err: any) {
      setGlobalError(err.message || "Google authentication failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }


  // Handle Google Credential Token (from GIS One Tap or Official Button)
  const handleGoogleCredentialToken = async (credential: string) => {
    setLoading(true)
    setGlobalError(null)
    try {
      const res = await apiGoogleLogin({ credential })
      onLogin({
        id: res.customer?.id || `usr_${Date.now()}`,
        name: res.customer?.name || "Patron",
        email: res.customer?.email || "",
        phone: res.customer?.phone || "",
        avatar: res.customer?.avatar || "",
        joinedDate: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
        membershipTier: res.customer?.tier || "Silver",
        points: res.customer?.points || 0,
      })
      showToast(res.message || `Signed in with Google as ${res.customer?.name}!`)
    } catch (err: any) {
      setGlobalError(err.message || "Google authentication failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle Google OAuth Access Token
  const handleGoogleAccessToken = async (accessToken: string) => {
    setLoading(true)
    setGlobalError(null)
    try {
      const res = await apiGoogleLogin({ accessToken })
      onLogin({
        id: res.customer?.id || `usr_${Date.now()}`,
        name: res.customer?.name || "Patron",
        email: res.customer?.email || "",
        phone: res.customer?.phone || "",
        avatar: res.customer?.avatar || "",
        joinedDate: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
        membershipTier: res.customer?.tier || "Silver",
        points: res.customer?.points || 0,
      })
      showToast(res.message || `Signed in with Google as ${res.customer?.name}!`)
    } catch (err: any) {
      setGlobalError(err.message || "Google authentication failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Trigger Google Sign-in on button click
  const handleGoogleBtnClick = () => {
    setGlobalError(null)

    // Option 1: Native OAuth2 Token popup if client ID configured
    if (gisLoaded && (window as any).google?.accounts?.oauth2 && googleClientId) {
      try {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "openid email profile",
          callback: async (tokenRes: any) => {
            if (tokenRes?.error) {
              setGlobalError(`Google authorization cancelled or failed: ${tokenRes.error}`)
              return
            }
            if (tokenRes?.access_token) {
              await handleGoogleAccessToken(tokenRes.access_token)
            }
          },
        })
        tokenClient.requestAccessToken({ prompt: "select_account" })
        return
      } catch (err) {
        console.warn("Google OAuth2 token client error:", err)
      }
    }

    // Option 2: GIS One-Tap prompt if available
    if (gisLoaded && (window as any).google?.accounts?.id && googleClientId) {
      try {
        ;(window as any).google.accounts.id.prompt()
        return
      } catch (err) {
        console.warn("Google ID prompt error:", err)
      }
    }

    // Option 3: Open Google Account Chooser for Direct Authentication
    if (email.trim()) {
      setGoogleDirectEmail(email.trim())
    }
    if (name.trim()) {
      setGoogleDirectName(name.trim())
    }
    setShowGoogleModal(true)
    setIsForgotPassword(false)
  }

  // Handle Send Password Reset Code
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)
    setErrors({})

    const clean = resetEmail.trim().toLowerCase()
    if (!clean) {
      setErrors({ resetEmail: "Please enter your account email address" })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setErrors({ resetEmail: "Please enter a valid email address (e.g. name@domain.com)" })
      return
    }

    setLoading(true)
    try {
      const res = await apiForgotPassword(clean)
      setResetStep(2)
      showToast(res.message || "Reset code sent to your email!")
    } catch (err: any) {
      setGlobalError(err.message || "Failed to send reset code. Please check your email and try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle Confirm Password Reset & Auto Sign-In
  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)
    setErrors({})

    const cleanOtp = resetOtp.trim()
    if (!cleanOtp || cleanOtp.length < 4) {
      setErrors({ resetOtp: "Please enter the 6-digit verification code" })
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setErrors({ newPassword: "Password must be at least 6 characters" })
      return
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match. Please verify." })
      return
    }

    setLoading(true)
    try {
      const res = await apiResetPassword(resetEmail.trim().toLowerCase(), cleanOtp, newPassword)
      setIsForgotPassword(false)
      onLogin({
        id: res.customer?.id || `usr_${Date.now()}`,
        name: res.customer?.name || "Patron",
        email: res.customer?.email || resetEmail.trim().toLowerCase(),
        phone: res.customer?.phone || "",
        avatar: res.customer?.avatar || "",
        joinedDate: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
        membershipTier: res.customer?.tier || "Silver",
        points: res.customer?.points || 0,
      })
      showToast(res.message || "Password updated successfully! Welcome back.")
    } catch (err: any) {
      setGlobalError(err.message || "Failed to reset password. Please check your verification code.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={root} className="grid min-h-[calc(100svh-80px)] bg-background text-foreground md:min-h-[calc(100svh-100px)] lg:grid-cols-2">
      {/* Left Visual Column */}
      <div className="auth-visual relative h-32 sm:h-48 overflow-hidden lg:h-auto lg:min-h-full">
        <Image
          src="/assets/banners/auth-portrait.jpg"
          alt="Artisanal Hand-Embroidered Luxury Shirt"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
        <div className="absolute bottom-3 left-4 right-4 text-white sm:bottom-6 sm:left-6 sm:right-6 lg:bottom-14 lg:left-14 lg:right-14">
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d4af37]">GAYATRI BHAI ATELIER</p>
          <p className="mt-0.5 font-display text-xl sm:text-2xl md:text-3xl lg:text-5xl leading-tight">
            {isSignup ? "Artistry in Every Thread." : "Welcome to Haute Luxury."}
          </p>
          <p className="hidden sm:block mt-1 text-[11px] uppercase tracking-widest text-zinc-300">
            Heritage Craft • Pure Silk & Linen • Surat Atelier
          </p>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="flex items-center justify-center px-4 py-6 sm:px-8 sm:py-10 md:px-12 md:py-14 lg:px-16 w-full">
        <div className="w-full max-w-md mx-auto">
          {isForgotPassword ? (
            <div data-auth-item className="mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false)
                  setResetStep(1)
                  setGlobalError(null)
                  setErrors({})
                }}
                className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                &larr; Back to Sign In
              </button>

              <h1 className="font-display text-3xl leading-tight md:text-4xl">
                Reset Password
              </h1>
              <p className="mt-2 text-[14px] text-muted-foreground">
                {resetStep === 1
                  ? "Enter your account email to receive a secure 6-digit verification code."
                  : `Enter the 6-digit code sent to ${resetEmail} and your new password.`}
              </p>

              {globalError && (
                <div className="mt-5 rounded-lg border border-[#b4321f]/40 bg-[#b4321f]/10 p-4 text-sm text-[#b4321f]">
                  <p className="font-semibold">{globalError}</p>
                </div>
              )}

              {resetStep === 1 ? (
                <form onSubmit={handleSendResetCode} noValidate className="mt-6 flex flex-col gap-4">
                  <Field
                    id="resetEmail"
                    label="Account Email address"
                    type="email"
                    value={resetEmail}
                    onChange={setResetEmail}
                    autoComplete="email"
                    inputMode="email"
                    placeholder="e.g. name@domain.com"
                    error={errors.resetEmail}
                  />

                  <p className="text-[11px] text-muted-foreground pt-0.5">
                    A secure 6-digit password reset code will be delivered to your registered email.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex h-14 items-center justify-center gap-3 rounded-full bg-foreground text-sm font-semibold uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90 disabled:opacity-60 shadow-md"
                  >
                    {loading ? "Sending reset code..." : "Send Reset Code"}
                    {!loading && <Icon name="arrow" size={16} />}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmResetPassword} noValidate className="mt-6 flex flex-col gap-4">
                  <div className="rounded-lg border border-border bg-surface p-4 text-sm">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Verification Code Sent</p>
                    <p className="font-semibold text-foreground mt-1">{resetEmail}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setResetStep(1)
                        setResetOtp("")
                      }}
                      className="mt-2 text-xs font-bold text-[#d4af37] underline underline-offset-2"
                    >
                      Change email
                    </button>
                  </div>

                  <Field
                    id="resetOtp"
                    label="Enter 6-digit verification code"
                    value={resetOtp}
                    onChange={setResetOtp}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="• • • • • •"
                    error={errors.resetOtp}
                  />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Didn&apos;t receive the code?</span>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSendResetCode}
                      className="font-semibold text-foreground underline underline-offset-2 hover:opacity-80"
                    >
                      Resend code
                    </button>
                  </div>

                  <Field
                    id="newPassword"
                    label="New Password (min 6 characters)"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={setNewPassword}
                    autoComplete="new-password"
                    error={errors.newPassword}
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        <Icon name={showNewPassword ? "eye-off" : "eye"} size={18} />
                      </button>
                    }
                  />

                  <Field
                    id="confirmPassword"
                    label="Confirm New Password"
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    autoComplete="new-password"
                    error={errors.confirmPassword}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex h-14 items-center justify-center gap-3 rounded-full bg-foreground text-sm font-semibold uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90 disabled:opacity-60 shadow-md"
                  >
                    {loading ? "Updating password..." : "Set New Password & Sign In"}
                    {!loading && <Icon name="check" size={16} />}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Sign In / Sign Up Top Switcher */}
              <div data-auth-item className="relative mb-6 grid grid-cols-2 rounded-full border border-border p-1">
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-foreground transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] ${
                    isSignup ? "translate-x-full" : "translate-x-0"
                  }`}
                />
                <Link
                  href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
                  replace
                  className={`relative z-10 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${!isSignup ? "text-background" : "text-foreground"}`}
                  aria-current={!isSignup ? "page" : undefined}
                >
                  Sign in
                </Link>
                <Link
                  href={redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : "/signup"}
                  replace
                  className={`relative z-10 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${isSignup ? "text-background" : "text-foreground"}`}
                  aria-current={isSignup ? "page" : undefined}
                >
                  Create account
                </Link>
              </div>

              <h1 data-auth-item className="font-display text-2xl sm:text-3xl md:text-4xl leading-tight">
                {isSignup ? "Create your account" : "Sign in to your account"}
              </h1>
              <p data-auth-item className="mt-1.5 text-xs sm:text-[14px] text-muted-foreground">
                {isSignup ? "Track bespoke orders, access exclusive drops, and enjoy patron benefits." : "Access your bespoke orders, wishlist, and exclusive patron benefits."}
              </p>

              {/* ── Prominent Google 1-Click SSO Button ── */}
              <div data-auth-item className="mt-5 sm:mt-6">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleBtnClick}
                  className="flex w-full h-12 sm:h-13 items-center justify-center gap-2.5 sm:gap-3 rounded-full border border-border bg-surface px-4 sm:px-6 text-xs sm:text-sm font-semibold tracking-wide text-foreground transition-all hover:bg-surface-2 active:scale-98 shadow-sm hover:border-[#4285F4]/50"
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                  </svg>
                  <span>{loading ? "Connecting to Google..." : "Continue with Google"}</span>
                </button>
              </div>

              {/* ── Divider ── */}
              <div data-auth-item className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-background px-4 text-muted-foreground">or continue with email</span>
                </div>
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

              {/* ── Email & Password Form ── */}
              <form onSubmit={submitPassword} noValidate className="mt-6 flex flex-col gap-4">
                {isSignup && <Field id="name" label="Full name" value={name} onChange={setName} autoComplete="name" placeholder="e.g. Rahul Sharma" error={errors.name} />}
                <Field id="email" label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" inputMode="email" placeholder="e.g. name@domain.com" error={errors.email} />
                <Field
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  placeholder="••••••••"
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
                    <label className="flex items-center gap-2 text-muted-foreground cursor-pointer select-none text-[12px]">
                      <input type="checkbox" defaultChecked className="size-3.5 rounded accent-foreground" />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true)
                        setResetEmail(email || "")
                        setResetStep(1)
                        setGlobalError(null)
                        setErrors({})
                      }}
                      className="font-medium text-foreground underline underline-offset-4 hover:opacity-80 transition-opacity"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  data-auth-item
                  type="submit"
                  disabled={loading}
                  className="group mt-2 flex h-14 items-center justify-center gap-3 rounded-full bg-foreground text-sm font-semibold uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90 disabled:opacity-60 shadow-md"
                >
                  {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
                  {!loading && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14m-5-5 5 5-5 5" />
                    </svg>
                  )}
                </button>
              </form>

              {/* Switch to Login / Signup Bottom Link */}
              <p data-auth-item className="mt-8 text-center text-sm text-muted-foreground">
                {isSignup ? "Already have an account? " : "New to Gayatri Bhai? "}
                <Link href={isSignup ? "/login" : "/signup"} replace className="font-semibold text-foreground underline underline-offset-4">
                  {isSignup ? "Sign in" : "Create account"}
                </Link>
              </p>
            </>
          )}

          {/* Store Admin Portal Access Info */}
          <div data-auth-item className="mt-6 rounded-lg border border-border/80 bg-surface/50 p-3.5 text-center">
            <p className="text-xs text-muted-foreground">
              Store Owner or Administrator?{" "}
              <Link href="/admin" className="font-bold text-[#d4af37] underline underline-offset-4 hover:opacity-85">
                Open Admin Panel &rarr;
              </Link>
            </p>
          </div>

          <ul data-auth-item className="mt-8 grid grid-cols-3 gap-2 border-t border-border pt-6 text-center text-[11px] sm:text-xs text-muted-foreground">
            {[
              ["truck", "Express Delivery"],
              ["refresh", "7-Day Returns"],
              ["shield", "Pure Handloom"],
            ].map(([icon, label]) => (
              <li key={label} className="flex flex-col items-center gap-1.5 sm:gap-2">
                <Icon name={icon as "truck"} size={16} />
                <span className="leading-tight">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Google Direct Authentication Modal ── */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-background p-5 sm:p-8 shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setShowGoogleModal(false)
                setErrors({})
              }}
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
              aria-label="Close dialog"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Google Brand Header */}
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface shadow-inner">
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                </svg>
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground">
                Sign in with Google
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                to continue to <span className="font-semibold text-foreground">Gayatri Bhai Atelier</span>
              </p>
            </div>

            {/* Custom Google Account Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleGoogleDirectAuth(googleDirectEmail, googleDirectName)
              }}
              className="mt-6 space-y-4"
            >
              <div>
                <label htmlFor="googleDirectEmail" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Google / Gmail Address
                </label>
                <input
                  id="googleDirectEmail"
                  type="email"
                  value={googleDirectEmail}
                  onChange={(e) => {
                    setGoogleDirectEmail(e.target.value)
                    if (errors.googleDirectEmail) {
                      setErrors((prev) => ({ ...prev, googleDirectEmail: "" }))
                    }
                  }}
                  placeholder="e.g. yourname@gmail.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#4285F4] focus:outline-none transition-colors"
                />
                {errors.googleDirectEmail && (
                  <p className="mt-1.5 text-xs text-[#b4321f]">{errors.googleDirectEmail}</p>
                )}
              </div>

              <div>
                <label htmlFor="googleDirectName" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Display Name <span className="font-normal lowercase text-muted-foreground/70">(optional)</span>
                </label>
                <input
                  id="googleDirectName"
                  type="text"
                  value={googleDirectName}
                  onChange={(e) => setGoogleDirectName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  autoComplete="name"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#4285F4] focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full h-12 items-center justify-center gap-2 rounded-full bg-[#4285F4] text-white text-sm font-semibold tracking-wide transition-all hover:bg-[#3367D6] active:scale-98 disabled:opacity-60 shadow-md"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" fill="#FFF"/>
                  </svg>
                  <span>{loading ? "Authenticating with Google..." : "Continue with Google"}</span>
                </button>
              </div>

              <p className="text-center text-[11px] text-muted-foreground pt-1">
                Instant authentication &bull; Fast & Secure Access &bull; 100% Encrypted
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginView
