import React from "react"

export interface ButtonProps {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  variant?: "dark" | "light" | "outline" | "text" | "gold"
  className?: string
  disabled?: boolean
  type?: "button" | "submit"
  style?: React.CSSProperties
}

export function Button({
  children,
  onClick,
  variant = "dark",
  className = "",
  disabled = false,
  type = "button",
  style,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button
