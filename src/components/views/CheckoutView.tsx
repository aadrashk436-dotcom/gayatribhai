"use client"

import React, { useState, useEffect } from "react"
import { products } from "../../products"
import type { Address, CartItem, User, View } from "../../types"
import { money } from "../../utils/format"
import Button from "../common/Button"
import Icon from "../common/Icon"
import { useStore } from "@/lib/store"
import { loadRazorpayScript, apiCreateOrder, apiVerifyPayment } from "../../lib/api"

export interface CheckoutViewProps {
  cart: CartItem[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  go: (v: View) => void
  addresses?: Address[]
  user?: User | null
}

export function AddressStep({
  onNext,
  addresses = [],
  go,
  user,
  onSelectAddress,
}: {
  onNext: () => void
  addresses?: Address[]
  go: (v: View) => void
  user?: User | null
  onSelectAddress?: (addr: Address) => void
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
    onSelectAddress?.(newAddr)
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
                  onClick={() => {
                    setSelectedId(addr.id)
                    onSelectAddress?.(addr)
                  }}
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
                      {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="phone">Phone: {addr.phone}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="step-actions">
            <Button variant="outline" onClick={() => setShowAddForm(true)}>
              + Add New Address
            </Button>
            <Button
              className="continue"
              onClick={() => {
                const chosen = addresses.find((a) => a.id === selectedId) || addresses[0]
                if (chosen) onSelectAddress?.(chosen)
                onNext()
              }}
            >
              Continue to Delivery <Icon name="arrow" />
            </Button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSaveAndContinue} className="address-form-grid">
          <div className="form-row">
            <div>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Receiver's name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <span className="err-text">{errors.name}</span>}
            </div>
            <div>
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              {errors.phone && <span className="err-text">{errors.phone}</span>}
            </div>
          </div>

          <div>
            <label>Street Address / Flat / Floor</label>
            <textarea
              rows={2}
              placeholder="House/Flat number, Building name, Street, Landmark"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            />
            {errors.street && <span className="err-text">{errors.street}</span>}
          </div>

          <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div>
              <label>City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              {errors.city && <span className="err-text">{errors.city}</span>}
            </div>
            <div>
              <label>State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
              {errors.state && <span className="err-text">{errors.state}</span>}
            </div>
            <div>
              <label>Pincode</label>
              <input
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
              {errors.pincode && <span className="err-text">{errors.pincode}</span>}
            </div>
          </div>

          <div className="step-actions">
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
  cart,
  pincode,
  subtotal,
  selectedCourier,
  onSelectCourier,
  packageSummary,
  onPackageCalculated,
  onNext,
  onBack,
}: {
  cart: CartItem[]
  pincode: string
  subtotal: number
  selectedCourier: any
  onSelectCourier: (courier: any, rate: number) => void
  packageSummary: any
  onPackageCalculated: (summary: any) => void
  onNext: () => void
  onBack: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [couriers, setCouriers] = useState<any[]>([])

  useEffect(() => {
    let cancelled = false
    async function calculateShipment() {
      setLoading(true)
      try {
        const res = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deliveryPincode: pincode || "400001",
            items: cart.map((c) => ({ productId: c.id, quantity: c.quantity })),
          }),
        })
        const data = await res.json()
        if (!cancelled && data) {
          if (Array.isArray(data.couriers)) {
            setCouriers(data.couriers)
          }
          if (data.packageSummary) {
            onPackageCalculated(data.packageSummary)
          }

          // Set default courier if none selected
          if (!selectedCourier && data.couriers && data.couriers.length > 0) {
            const first = data.couriers[0]
            const initialRate = subtotal >= 1999 ? 0 : first.rate
            onSelectCourier(first, initialRate)
          }
        }
      } catch (e) {
        console.warn("Could not calculate live shipping:", e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    calculateShipment()
    return () => {
      cancelled = true
    }
  }, [pincode, cart.length])

  return (
    <>
      <span className="eyebrow">Step 2 of 3</span>
      <h1>Select Delivery Speed & Courier Partner</h1>

      {/* ── PACKAGE WEIGHT & VOLUMETRIC DIMENSIONS BANNER (AMAZON / LOGISTICS) ── */}
      <div
        style={{
          border: "1px solid var(--border)",
          background: "rgba(212, 175, 55, 0.05)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <strong style={{ fontSize: "13px", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Icon name="truck" size={16} />
            Consolidated Order Shipment ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
          </strong>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#d4af37", fontFamily: "monospace" }}>
            Destination PIN: {pincode}
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12px", color: "var(--muted-foreground)" }}>
          <span>
            Dead Weight: <b style={{ color: "var(--foreground)" }}>{packageSummary?.deadWeightKg ?? (cart.length * 0.35).toFixed(2)} kg</b>
          </span>
          <span>•</span>
          <span>
            Dimensions: <b style={{ color: "var(--foreground)" }}>
              {packageSummary?.dimensions?.length ?? 30} × {packageSummary?.dimensions?.breadth ?? 25} × {packageSummary?.dimensions?.height ?? (cart.length * 4)} cm
            </b>
          </span>
          <span>•</span>
          <span>
            Volumetric: <b style={{ color: "var(--foreground)" }}>{packageSummary?.volumetricWeightKg ?? 0.6} kg</b>
          </span>
          <span>•</span>
          <span>
            Billable Weight: <b style={{ color: "#d4af37" }}>{packageSummary?.billableWeightKg ?? 0.6} kg</b>
          </span>
        </div>

        {subtotal >= 1999 && (
          <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#10b981", fontWeight: 600 }}>
            🎉 You have unlocked Complimentary Free Atelier Shipping on orders over ₹1,999!
          </p>
        )}
      </div>

      {loading ? (
        <div style={{ padding: "30px", textAlign: "center", color: "var(--muted-foreground)", fontSize: "13px" }}>
          Calculating live courier serviceability and rates for PIN {pincode}...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {couriers.map((courier: any) => {
            const isSelected = selectedCourier?.id === courier.id || selectedCourier?.name === courier.name
            // Standard delivery is free if subtotal >= 1999
            const isFreeEligible = subtotal >= 1999 && (courier.mode === "SURFACE" || courier.rate <= 99)
            const effectiveRate = isFreeEligible ? 0 : courier.rate

            return (
              <div
                key={courier.id || courier.name}
                className={`delivery-option ${isSelected ? "selected" : ""}`}
                style={{
                  cursor: "pointer",
                  border: isSelected ? "1.5px solid #d4af37" : "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  background: isSelected ? "rgba(212, 175, 55, 0.08)" : "transparent",
                  transition: "all 0.2s ease",
                }}
                onClick={() => onSelectCourier(courier, effectiveRate)}
              >
                <span className="radio" style={{ borderColor: isSelected ? "#d4af37" : "inherit" }} />
                <Icon name="truck" size={20} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "14px", color: "var(--foreground)" }}>
                      {courier.name}{" "}
                      {courier.tag && (
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: "rgba(212, 175, 55, 0.2)",
                            color: "#d4af37",
                            marginLeft: "6px",
                            fontWeight: 700,
                          }}
                        >
                          {courier.tag}
                        </span>
                      )}
                    </strong>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: effectiveRate === 0 ? "#10b981" : "#d4af37" }}>
                      {effectiveRate === 0 ? "FREE" : money(effectiveRate)}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--muted-foreground)" }}>
                    Estimated transit: {courier.etd || "2-3 business days"} • Mode: {courier.mode || "EXPRESS"}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="step-actions" style={{ marginTop: "24px" }}>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} className="continue">
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
        {["UPI", "Card", "Net Banking", "Wallet", "Cash on Delivery"].map((x) => (
          <button
            className={method === x ? "active" : ""}
            onClick={() => setMethod(x)}
            key={x}
            type="button"
          >
            {x}
          </button>
        ))}
      </div>
      <div className="payment-panel">
        {method === "UPI" ? (
          <>
            <label>
              UPI ID
              <input placeholder="yourname@bank" />
            </label>
            <p>Or pay securely using your preferred UPI app through Razorpay.</p>
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
            Select your preferred {method.toLowerCase()} option securely on the next screen.
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

  const subtotal = cart.reduce(
    (sum, x) =>
      sum + (products.find((p) => p.id === x.id)?.price || 0) * x.quantity,
    0
  )

  const [selectedAddress, setSelectedAddress] = useState<Address>(() => {
    return (
      addresses.find((a) => a.isDefault) ||
      addresses[0] || {
        id: "addr_default",
        name: user?.name || "Customer",
        phone: user?.phone || "9876543210",
        street: "Atelier Street",
        city: "Indore",
        state: "Madhya Pradesh",
        pincode: "452001",
        type: "HOME",
        isDefault: true,
      }
    )
  })

  const [selectedCourier, setSelectedCourier] = useState<any>(null)
  const [shippingFee, setShippingFee] = useState<number>(subtotal >= 1999 ? 0 : 99)
  const [packageSummary, setPackageSummary] = useState<any>(null)

  const finalTotal = subtotal + shippingFee

  const handlePay = async () => {
    setIsPaying(true)
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        setStep(4)
        setComplete(true)
        return
      }

      const orderItems = cart.map((item) => ({
        productId: item.id,
        size: item.size || "M",
        quantity: item.quantity,
      }))

      let rzpOrderId = ""
      let finalAmount = finalTotal * 100 // paise

      try {
        const orderRes = await apiCreateOrder(
          orderItems,
          selectedAddress,
          undefined,
          undefined,
          {
            shippingFee,
            selectedCourier,
            packageSummary,
          }
        )
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
          name: user?.name || selectedAddress.name,
          email: user?.email || "care@gayatribhai.com",
          contact: selectedAddress.phone,
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
        <div className="confirmation-badge">
          <Icon name="check" size={24} />
        </div>
        <h1>Order Confirmed</h1>
        <p className="order-num">Reference: #{confirmedOrderId}</p>
        <p className="copy">
          Thank you for choosing Gayatri Bhai. Your garments are being hand-pressed and packaged in our signature box. We have dispatched tracking details to your registered phone.
        </p>

        {selectedCourier && (
          <div
            style={{
              margin: "16px auto",
              padding: "12px 18px",
              background: "rgba(212, 175, 55, 0.08)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: "10px",
              maxWidth: "400px",
              fontSize: "12px",
              textAlign: "left",
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, color: "#d4af37" }}>
              🚚 Shipping Partner: {selectedCourier.name}
            </p>
            <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)" }}>
              Estimated transit: {selectedCourier.etd || "2-3 business days"}
            </p>
          </div>
        )}

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
      <button className="checkout-logo" onClick={() => go("home")} type="button">
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
              onSelectAddress={(addr) => setSelectedAddress(addr)}
            />
          )}
          {step === 2 && (
            <DeliveryStep
              cart={cart}
              pincode={selectedAddress?.pincode || "400001"}
              subtotal={subtotal}
              selectedCourier={selectedCourier}
              onSelectCourier={(courier, rate) => {
                setSelectedCourier(courier)
                setShippingFee(rate)
              }}
              packageSummary={packageSummary}
              onPackageCalculated={(summary) => setPackageSummary(summary)}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <PaymentStep
              total={finalTotal}
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
              <dd>{money(subtotal)}</dd>
            </div>
            <div>
              <dt>Shipping {selectedCourier ? `(${selectedCourier.name})` : ""}</dt>
              <dd style={{ color: shippingFee === 0 ? "#10b981" : "inherit" }}>
                {shippingFee === 0 ? "FREE" : money(shippingFee)}
              </dd>
            </div>
            {packageSummary && (
              <div style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                <dt>Combined Package</dt>
                <dd>
                  {packageSummary.billableWeightKg} kg ({packageSummary.dimensions.length}×{packageSummary.dimensions.breadth}×{packageSummary.dimensions.height} cm)
                </dd>
              </div>
            )}
          </dl>
          <div className="checkout-total">
            <span>Total</span>
            <strong>{money(finalTotal)}</strong>
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
