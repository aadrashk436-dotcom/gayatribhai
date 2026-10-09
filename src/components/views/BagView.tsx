"use client"

import React from "react"
import { products } from "../../products"
import type { CartItem, Product, View } from "../../types"
import { money } from "../../utils/format"
import Button from "../common/Button"
import Empty from "../common/Empty"
import Icon from "../common/Icon"

export interface BagViewProps {
  cart: CartItem[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  openProduct: (p: Product) => void
  go: (v: View) => void
}

export function BagView({ cart, setCart, openProduct, go }: BagViewProps) {
  const detailed = cart
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.id)!,
    }))
    .filter((x) => Boolean(x.product))

  const subtotal = detailed.reduce(
    (sum, x) => sum + x.product.price * x.quantity,
    0,
  )
  const mrp = detailed.reduce((sum, x) => sum + x.product.mrp * x.quantity, 0)

  const update = (item: CartItem, amount: number) =>
    setCart((prev) =>
      prev.map((x) =>
        x.id === item.id && x.size === item.size
          ? { ...x, quantity: Math.max(1, x.quantity + amount) }
          : x,
      ),
    )

  const remove = (item: CartItem) =>
    setCart((prev) =>
      prev.filter((x) => !(x.id === item.id && x.size === item.size)),
    )

  if (!detailed.length) {
    return (
      <div className="standard-page">
        <Empty
          icon="bag"
          title="Your bag is empty"
          copy="Your next favourite shirt is only a few clicks away."
          action="Shop shirts"
          onAction={() => go("shop")}
        />
      </div>
    )
  }

  return (
    <div className="bag-page">
      <div className="bag-head">
        <span className="eyebrow">Your Selection</span>
        <h1>Shopping bag</h1>
        <p>
          {cart.length} {cart.length === 1 ? "piece" : "pieces"}, reserved for
          15 minutes
        </p>
      </div>
      <div className="bag-layout">
        <div className="bag-items">
          <div className="shipping-progress">
            <div>
              <Icon name="truck" />
              <span>
                {subtotal >= 1999
                  ? "You unlocked complimentary shipping"
                  : `${money(1999 - subtotal)} away from free shipping`}
              </span>
            </div>
            <i style={{ width: `${Math.min(100, subtotal / 19.99)}%` }} />
          </div>
          {detailed.map((item) => (
            <article className="bag-item" key={`${item.id}-${item.size}`}>
              <button
                type="button"
                onClick={() => openProduct(item.product)}
                aria-label={`View ${item.product.name}`}
              >
                <img src={item.product.images[0]} alt={item.product.name} />
              </button>
              <div className="bag-item-copy">
                <small>AVYR · {item.product.category}</small>
                <h3>{item.product.name}</h3>
                <p>
                  {item.product.color} · Size {item.size}
                </p>
                <div className="qty">
                  <button
                    type="button"
                    onClick={() => update(item, -1)}
                    aria-label="Decrease quantity"
                  >
                    <Icon name="minus" size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => update(item, 1)}
                    aria-label="Increase quantity"
                  >
                    <Icon name="plus" size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  className="remove"
                  onClick={() => remove(item)}
                >
                  <Icon name="trash" size={15} /> Remove
                </button>
              </div>
              <div className="bag-price">
                <strong>{money(item.product.price * item.quantity)}</strong>
                <s>{money(item.product.mrp * item.quantity)}</s>
                <span>
                  You save{" "}
                  {money(
                    (item.product.mrp - item.product.price) * item.quantity,
                  )}
                </span>
              </div>
            </article>
          ))}
        </div>
        <aside className="summary">
          <h2>Order summary</h2>
          <div className="coupon">
            <span>
              <strong>Have a coupon?</strong>
              <small>Try FIRST10 on your first order</small>
            </span>
            <Button variant="outline">Apply</Button>
          </div>
          <dl>
            <div>
              <dt>MRP total</dt>
              <dd>{money(mrp)}</dd>
            </div>
            <div>
              <dt>Product discount</dt>
              <dd className="saving">− {money(mrp - subtotal)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd className="saving">
                {subtotal >= 1999 ? "FREE" : money(99)}
              </dd>
            </div>
            <div>
              <dt>Estimated tax</dt>
              <dd>Included</dd>
            </div>
          </dl>
          <div className="summary-total">
            <span>
              <strong>Total</strong>
              <small>Inclusive of all taxes</small>
            </span>
            <b>{money(subtotal + (subtotal >= 1999 ? 0 : 99))}</b>
          </div>
          <Button className="checkout-btn" onClick={() => go("checkout")}>
            Secure checkout <Icon name="arrow" />
          </Button>
          <p className="secure">
            <Icon name="shield" size={16} /> Encrypted and secure payment
          </p>
        </aside>
      </div>
    </div>
  )
}

export default BagView
