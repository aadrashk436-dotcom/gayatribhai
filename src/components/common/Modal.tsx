import React from "react"
import Icon from "./Icon"

export interface ModalProps {
  children: React.ReactNode
  onClose: () => void
}

export function Modal({ children, onClose }: ModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <Icon name="close" />
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal
