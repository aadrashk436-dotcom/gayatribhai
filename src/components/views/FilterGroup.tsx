import React, { useState } from "react"
import Icon from "../common/Icon"

export interface FilterGroupProps {
  title: string
  children?: React.ReactNode
  collapsed?: boolean
  activeCount?: number
}

export function FilterGroup({
  title,
  children,
  collapsed = false,
  activeCount = 0,
}: FilterGroupProps) {
  const [open, setOpen] = useState(!collapsed)

  return (
    <div className={`filter-group ${open ? "is-open" : "is-collapsed"}`}>
      <button
        type="button"
        className="filter-group-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="filter-group-title">
          <strong>{title}</strong>
          {activeCount > 0 && (
            <span className="filter-count-badge">{activeCount}</span>
          )}
        </span>
        <span className={`filter-chevron ${open ? "rotated" : ""}`}>
          <Icon name="chevron" size={15} />
        </span>
      </button>

      {open && <div className="filter-options">{children}</div>}
    </div>
  )
}

export default FilterGroup
