"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import type { User, View } from "../../types"
import Icon from "../common/Icon"
import { apiLogin, apiSignup, apiSendOtp, apiVerifyOtp, apiGoogleLogin, apiDirectGmailLogin, apiForgotPassword, apiResetPassword, AuthError } from "../../lib/api"

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
    { scope: root, dependencies: [mode, authMethod, otpStep, isForgotPassword, resetStep], revertOnUpdate: true },
  )

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

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

      if (googleBtnContainerRef.current) {
        googleBtnContainerRef.current.innerHTML = ""
        ;(window as any).google.accounts.id.renderButton(googleBtnContainerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: isSignup ? "signup_with" : "signin_with",
          shape: "pill",
          logo_alignment: "left",
          width: 380,
        })
      }

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
        points: res.customer?.points || 250,
      })
      showToast(res.message || `Signed in with Google as ${customerName}!`)
    } catch (err: any) {
      setGlobalError(err.message || "Google authentication failed. Please try again.")
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
        points: res.customer?.points || 250,
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
        points: res.customer?.points || 250,
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
      if (res.devOtp) {
        console.log(`[Gayatri Bhai Reset Code] ${res.devOtp}`)
      }
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
        points: res.customer?.points || 250,
      })
      showToast(res.message || "Password updated successfully! Welcome back.")
    } catch (err: any) {
      setGlobalError(err.message || "Failed to reset password. Please check your verification code.")
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
                    placeholder="123456"
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

              {/* ── Prominent Google 1-Click SSO Button ── */}
              <div data-auth-item className="mt-6">
                {googleClientId && (
                  <div
                    ref={googleBtnContainerRef}
                    className="flex w-full justify-center overflow-hidden rounded-full [&>iframe]:!mx-auto mb-3"
                  />
                )}

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleBtnClick}
                  className="flex w-full h-13 items-center justify-center gap-3 rounded-full border border-border bg-surface px-6 text-sm font-semibold tracking-wide text-foreground transition-all hover:bg-surface-2 active:scale-98 shadow-sm hover:border-[#4285F4]/50"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
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

              {/* ── Mode Switcher: Password vs OTP Login ── */}
              <div data-auth-item className="grid grid-cols-2 rounded-lg border border-border bg-surface p-1 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("password")
                    setGlobalError(null)
                  }}
                  className={`rounded-md py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-all ${
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
                  className={`rounded-md py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-all ${
                    authMethod === "otp"
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Email / Phone OTP
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
                        label="Email or Mobile Number"
                        value={otpIdentifier}
                        onChange={setOtpIdentifier}
                        placeholder="e.g. name@gmail.com or 9876543210"
                        error={errors.otpIdentifier}
                      />

                      <p className="text-[11px] text-muted-foreground pt-0.5">
                        We will send a secure 6-digit one-time code to verify your identity.
                      </p>

                      <button
                        type="submit"
                        disabled={loading}
                        className="group mt-2 flex h-14 items-center justify-center gap-3 rounded-full bg-foreground text-sm font-semibold uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90 disabled:opacity-60 shadow-md"
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
                        <span>Didn&apos;t receive code?</span>
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
                        className="group mt-2 flex h-14 items-center justify-center gap-3 rounded-full bg-foreground text-sm font-semibold uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90 disabled:opacity-60 shadow-md"
                      >
                        {loading ? "Verifying..." : isSignup ? "Verify & Create Account" : "Verify & Sign In"}
                        {!loading && <Icon name="check" size={16} />}
                      </button>
                    </form>
                  )}
                </div>
              )}

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

      {/* ── Google Direct Authentication Modal ── */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl sm:p-8">
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

            {/* Quick 1-Click Store Owner Card */}
            <div className="mt-6 space-y-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleGoogleDirectAuth("gayatripuri634@gmail.com", "Gayatri Puri")}
                className="group flex w-full items-center gap-3.5 rounded-xl border border-border bg-surface/60 p-3.5 text-left transition-all hover:border-[#4285F4] hover:bg-surface active:scale-[0.99]"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/20 text-[#d4af37] font-semibold text-sm">
                  GP
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">Gayatri Puri</p>
                    <span className="rounded bg-[#d4af37]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#d4af37]">Owner / Admin</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">gayatripuri634@gmail.com</p>
                </div>
                <div className="text-xs font-semibold text-[#4285F4] group-hover:underline">
                  Sign in &rarr;
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-background px-3 text-muted-foreground">Or connect another Google account</span>
              </div>
            </div>

            {/* Custom Google Account Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleGoogleDirectAuth(googleDirectEmail, googleDirectName)
              }}
              className="space-y-4"
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
                Instant authentication &bull; 250 Welcome Points &bull; 100% Encrypted
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginView
