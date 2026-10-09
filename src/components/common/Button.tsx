import React from "react"

export interface ButtonProps {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  variant?: "dark" | "light" | "outline" | "text" | "gold"
  className?: string
  disabled?: boolean
  type?: "button" | "submit"
}

export function Button({
  children,
  onClick,
  variant = "dark",
  className = "",
  disabled = false,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button
