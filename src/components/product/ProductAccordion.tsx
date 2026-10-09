import { useState } from "react"
import type { Product } from "../../types"
import Icon from "../common/Icon"

export interface ProductAccordionProps {
  product: Product
}

export function ProductAccordion({ product }: ProductAccordionProps) {
  const sections = [
    ["Story & details", product.description],
    [
      "Product specifications",
      `Fit: Relaxed · Fabric: ${product.fabric} · Pattern: Hand embroidered · Collar: Cuban collar · Sleeve: Half sleeve · SKU: ${product.sku}`,
    ],
    [
      "Craft & care",
      "Gentle hand wash separately in cold water. Do not bleach. Dry in shade and use a warm iron on reverse. Slight variations are signatures of hand craft.",
    ],
    [
      "Shipping & returns",
      "Dispatches within 48 hours. Complimentary shipping above ₹1,999. Eligible for return or size exchange within 7 days of delivery.",
    ],
  ]
  const [open, setOpen] = useState(0)

  return (
    <div className="accordions">
      {sections.map(([title, copy], i) => (
        <div key={title}>
          <button onClick={() => setOpen(open === i ? -1 : i)}>
            <strong>{title}</strong>
            <Icon name={open === i ? "minus" : "plus"} size={17} />
          </button>
          {open === i && <p>{copy}</p>}
        </div>
      ))}
    </div>
  )
}

export default ProductAccordion
