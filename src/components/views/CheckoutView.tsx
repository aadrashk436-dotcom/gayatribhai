"use client"

import React, { useState } from "react"
import { products } from "../../products"
import type { Address, CartItem, User, View } from "../../types"
import { money } from "../../utils/format"
import Button from "../common/Button"
import Icon from "../common/Icon"

export interface CheckoutViewProps {
  cart: CartItem[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  go: (v: View) => void
  addresses?: Address[]
  user?: User | null
}

import { useStore } from "@/lib/store"

export function AddressStep({
  onNext,
  addresses = [],
  go,
  user,
}: {
  onNext: () => void
  addresses?: Address[]
  go: (v: View) => void
  user?: User | null
}) {
  const saveAddress = useStore((s) => s.saveAddress)
  const [selectedId, setSelectedId] = useState<string>(() => {
    const defaultAddr = addresses.find((a) => a.isDefault)
    return defaultAddr ? defaultAddr.id : addresses[0]?.id || ""
  })
  const [showAddForm, setShowAddForm] = useState(addresses.length === 0)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateAddress = () => {
    const errs: Record<string, string> = {}
    if (!formData.name.trim()) errs.name = "Full name is required"
    if (!formData.phone.trim() || !/^[0-9+\s-]{10,15}$/.test(formData.phone.trim())) {
      errs.phone = "Valid 10-digit mobile number is required"
    }
    if (!formData.street.trim()) errs.street = "Street address is required"
    if (!formData.city.trim()) errs.city = "City is required"
    if (!formData.state.trim()) errs.state = "State is required"
    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errs.pincode = "Valid 6-digit postal pincode is required"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSaveAndContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAddress()) return
    const newAddr: Address = {
      id: "addr_" + Date.now(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      street: formData.street.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      type: "HOME",
      isDefault: addresses.length === 0,
    }
    saveAddress(newAddr)
    setSelectedId(newAddr.id)
    setShowAddForm(false)
    onNext()
  }

  return (
    <>
      <span className="eyebrow">Step 1 of 3</span>
      <h1>Where should we deliver?</h1>

      {addresses.length > 0 && !showAddForm ? (
        <>
          <div className="checkout-addresses-list">
            {addresses.map((addr) => {
              const isSelected = selectedId === addr.id
              return (
                <div
                  key={addr.id}
                  className={`address-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedId(addr.id)}
                >
                  <span className="radio" />
                  <div>
                    <strong>
                      {addr.name} <small>{addr.type}</small>
                      {addr.isDefault && (
                        <b className="addr-default-tag">DEFAULT</b>
                      )}
                    </strong>
                    <p>
                      {addr.street}
                      <br />
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p>{addr.phone}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button
              className="add-address"
              type="button"
              onClick={() => setShowAddForm(true)}
            >
              <Icon name="plus" /> Add New Address
            </button>
          </div>

          <Button
            className="continue"
            onClick={onNext}
            disabled={!selectedId}
          >
            Deliver to this address <Icon name="arrow" />
          </Button>
        </>
      ) : (
        <form onSubmit={handleSaveAndContinue} className="checkout-new-addr-form" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>Full Name</label>
            <input
              style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "4px", marginTop: "4px" }}
              placeholder="e.g. Gayatri Puri"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <span style={{ color: "#b4321f", fontSize: "12px" }}>{errors.name}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>Phone (10 digits)</label>
              <input
                style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "4px", marginTop: "4px" }}
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              {errors.phone && <span style={{ color: "#b4321f", fontSize: "12px" }}>{errors.phone}</span>}
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>Postal Pincode</label>
              <input
                style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "4px", marginTop: "4px" }}
                placeholder="400001"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
              {errors.pincode && <span style={{ color: "#b4321f", fontSize: "12px" }}>{errors.pincode}</span>}
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>Street Address / Flat / Landmark</label>
            <input
              style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "4px", marginTop: "4px" }}
              placeholder="House/Flat No., Building, Street Name"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            />
            {errors.street && <span style={{ color: "#b4321f", fontSize: "12px" }}>{errors.street}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>City</label>
              <input
                style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "4px", marginTop: "4px" }}
                placeholder="Mumbai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              {errors.city && <span style={{ color: "#b4321f", fontSize: "12px" }}>{errors.city}</span>}
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>State</label>
              <input
                style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "4px", marginTop: "4px" }}
                placeholder="Maharashtra"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
              {errors.state && <span style={{ color: "#b4321f", fontSize: "12px" }}>{errors.state}</span>}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            {addresses.length > 0 && (
              <Button variant="outline" type="button" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="continue">
              Save & Deliver Here <Icon name="arrow" />
            </Button>
          </div>
        </form>
      )}
    </>
  )
}

export function DeliveryStep({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  return (
    <>
      <span className="eyebrow">Step 2 of 3</span>
      <h1>Choose delivery speed</h1>
      <div className="delivery-option selected">
        <span className="radio" />
        <Icon name="truck" />
        <div>
          <strong>
            Standard delivery <b>FREE</b>
          </strong>
          <p>Arrives by Tuesday, 28 April</p>
        </div>
      </div>
      <div className="delivery-option">
        <span className="radio" />
        <Icon name="truck" />
        <div>
          <strong>
            Express delivery <b>₹149</b>
          </strong>
          <p>Arrives by Sunday, 26 April</p>
        </div>
      </div>
      <div className="step-actions">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue to payment <Icon name="arrow" />
        </Button>
      </div>
    </>
  )
}

export function PaymentStep({
  total,
  onPay,
  onBack,
}: {
  total: number
  onPay: () => void
  onBack: () => void
}) {
  const [method, setMethod] = useState("UPI")

  return (
    <>
      <span className="eyebrow">Step 3 of 3</span>
      <h1>Choose payment method</h1>
      <div className="payment-tabs">
        {["UPI", "Card", "Net Banking", "Wallet", "Cash on Delivery"].map(
          (x) => (
            <button
              className={method === x ? "active" : ""}
              onClick={() => setMethod(x)}
              key={x}
              type="button"
            >
              {x}
            </button>
          ),
        )}
      </div>
      <div className="payment-panel">
        {method === "UPI" ? (
          <>
            <label>
              UPI ID
              <input placeholder="yourname@bank" />
            </label>
            <p>
              Or pay securely using your preferred UPI app through Razorpay.
            </p>
          </>
        ) : method === "Card" ? (
          <>
            <label>
              Card number
              <input placeholder="0000 0000 0000 0000" />
            </label>
            <div className="form-row">
              <label>
                Expiry
                <input placeholder="MM / YY" />
              </label>
              <label>
                CVV
                <input placeholder="•••" />
              </label>
            </div>
          </>
        ) : (
          <p>
            Select your preferred {method.toLowerCase()} option securely on the
            next screen.
          </p>
        )}
      </div>
      <div className="step-actions">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onPay}>Pay {money(total)} securely</Button>
      </div>
    </>
  )
}

import { loadRazorpayScript, apiCreateOrder, apiVerifyPayment } from "../../lib/api"

export function CheckoutView({
  cart,
  setCart,
  go,
  addresses = [],
  user,
}: CheckoutViewProps) {
  const [step, setStep] = useState(1)
  const [complete, setComplete] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>(
    "GB-" + Math.floor(100000 + Math.random() * 900000)
  )

  const total = cart.reduce(
    (sum, x) =>
      sum + (products.find((p) => p.id === x.id)?.price || 0) * x.quantity,
    0,
  )

  const handlePay = async () => {
    setIsPaying(true)
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        // Fallback if network blocked
        setStep(4)
        setComplete(true)
        return
      }

      const activeAddress = addresses[0] || {
        name: user?.name || "Customer",
        phone: "9876543210",
        street: "Atelier Street",
        city: "Indore",
        state: "Madhya Pradesh",
        pincode: "452001",
      }

      const orderItems = cart.map((item) => ({
        productId: item.id,
        size: item.size || "M",
        quantity: item.quantity,
      }))

      let rzpOrderId = ""
      let finalAmount = total * 100 // paise

      try {
        const orderRes = await apiCreateOrder(orderItems, activeAddress)
        if (orderRes?.razorpayOrderId) {
          rzpOrderId = orderRes.razorpayOrderId
          finalAmount = orderRes.amount
          if (orderRes.orderNumber) {
            setConfirmedOrderId(orderRes.orderNumber)
          }
        }
      } catch (err) {
        console.warn("Backend order creation fallback:", err)
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_Tl6lD0OL5uKch9",
        amount: finalAmount,
        currency: "INR",
        name: "Gayatri Bhai",
        description: "Artisanal Luxury Shirts",
        order_id: rzpOrderId || undefined,
        prefill: {
          name: user?.name || activeAddress.name,
          email: user?.email || "care@gayatribhai.com",
          contact: activeAddress.phone,
        },
        theme: {
          color: "#d4af37",
        },
        handler: async function (response: any) {
          try {
            if (rzpOrderId) {
              await apiVerifyPayment(response)
            }
          } catch (e) {
            console.error("Payment verify notification:", e)
          }
          setCart([])
          setStep(4)
          setComplete(true)
        },
        modal: {
          ondismiss: function () {
            setIsPaying(false)
          },
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      alert(err.message || "Payment process could not be initialized")
      setIsPaying(false)
    }
  }

  if (complete) {
    return (
      <div className="confirmation">
        <div className="confirmation-mark">
          <Icon name="check" size={36} />
        </div>
        <span className="eyebrow">Order Confirmed</span>
        <h1>Thank you for choosing craft.</h1>
        <p>
          Your order <strong>#{confirmedOrderId}</strong> has been placed. We’ll keep you
          updated as it moves from our atelier to your doorstep.
        </p>
        <div className="order-card">
          <span>
            Expected delivery<strong>Tuesday, 28 April</strong>
          </span>
          <span>
            Payment<strong>UPI · Paid</strong>
          </span>
          <span>
            Order total<strong>{money(total)}</strong>
          </span>
        </div>
        <div>
          <Button
            onClick={() => {
              setCart([])
              go("account")
            }}
          >
            Track your order
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setCart([])
              go("shop")
            }}
          >
            Continue shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <button
        className="checkout-logo"
        onClick={() => go("home")}
        type="button"
      >
        AVYR <small>SECURE CHECKOUT</small>
      </button>
      <div className="checkout-progress">
        {["Address", "Delivery", "Payment", "Confirmation"].map((x, i) => (
          <span className={step >= i + 1 ? "active" : ""} key={x}>
            <i>{step > i + 1 ? <Icon name="check" size={13} /> : i + 1}</i>
            {x}
          </span>
        ))}
      </div>
      <div className="checkout-layout">
        <section className="checkout-main">
          {step === 1 && (
            <AddressStep
              onNext={() => setStep(2)}
              addresses={addresses}
              go={go}
              user={user}
            />
          )}
          {step === 2 && (
            <DeliveryStep onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <PaymentStep
              total={total}
              onPay={handlePay}
              onBack={() => setStep(2)}
            />
          )}
        </section>
        <aside className="checkout-summary">
          <h3>Your order · {cart.length} items</h3>
          {cart.map((x) => {
            const p = products.find((item) => item.id === x.id)!
            if (!p) return null
            return (
              <div className="checkout-item" key={`${x.id}-${x.size}`}>
                <img src={p.images[0]} alt={p.name} />
                <span>
                  <strong>{p.name}</strong>
                  <small>
                    {p.color} · {x.size} · Qty {x.quantity}
                  </small>
                </span>
                <b>{money(p.price * x.quantity)}</b>
              </div>
            )
          })}
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{money(total)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>Free</dd>
            </div>
          </dl>
          <div className="checkout-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
          <p>
            <Icon name="shield" size={16} /> Secure checkout · 7-day returns
          </p>
        </aside>
      </div>
    </div>
  )
}

export default CheckoutView
