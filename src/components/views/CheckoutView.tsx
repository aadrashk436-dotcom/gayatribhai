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

export function AddressStep({
  onNext,
  addresses = [],
  go,
}: {
  onNext: () => void
  addresses?: Address[]
  go: (v: View) => void
}) {
  const [selectedId, setSelectedId] = useState<string>(() => {
    const defaultAddr = addresses.find((a) => a.isDefault)
    return defaultAddr ? defaultAddr.id : addresses[0]?.id || ""
  })

  return (
    <>
      <span className="eyebrow">Step 1 of 3</span>
      <h1>Where should we deliver?</h1>

      {addresses.length === 0 ? (
        <div className="checkout-no-addr">
          <p>No saved delivery address found in your account.</p>
          <Button onClick={() => go("account")}>
            <Icon name="plus" size={15} /> Add Delivery Address in Profile
          </Button>
        </div>
      ) : (
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
                    {addr.area ? `, ${addr.area}` : ""}
                    <br />
                    {addr.city}, {addr.state} {addr.pincode}
                  </p>
                  <p>{addr.phone}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      go("account")
                    }}
                  >
                    Edit in Profile
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button
        className="add-address"
        type="button"
        onClick={() => go("account")}
      >
        <Icon name="plus" /> Manage or Add New Address in Profile
      </button>
      <Button
        className="continue"
        onClick={onNext}
        disabled={addresses.length === 0 || !selectedId}
      >
        Deliver to this address <Icon name="arrow" />
      </Button>
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

export function CheckoutView({
  cart,
  setCart,
  go,
  addresses = [],
  user,
}: CheckoutViewProps) {
  const [step, setStep] = useState(1)
  const [complete, setComplete] = useState(false)
  const total = cart.reduce(
    (sum, x) =>
      sum + (products.find((p) => p.id === x.id)?.price || 0) * x.quantity,
    0,
  )

  if (complete) {
    return (
      <div className="confirmation">
        <div className="confirmation-mark">
          <Icon name="check" size={36} />
        </div>
        <span className="eyebrow">Order Confirmed</span>
        <h1>Thank you for choosing craft.</h1>
        <p>
          Your order <strong>#AVY260418</strong> has been placed. We’ll keep you
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
            />
          )}
          {step === 2 && (
            <DeliveryStep onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <PaymentStep
              total={total}
              onPay={() => {
                setStep(4)
                setComplete(true)
              }}
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
