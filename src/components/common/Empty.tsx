import type { IconName } from "../../types"
import Button from "./Button"
import Icon from "./Icon"

export interface EmptyProps {
  icon: IconName
  title: string
  copy: string
  action?: string
  onAction?: () => void
}

export function Empty({ icon, title, copy, action, onAction }: EmptyProps) {
  return (
    <div className="empty">
      <Icon name={icon} size={36} />
      <h2>{title}</h2>
      <p>{copy}</p>
      {action && (
        <Button onClick={onAction}>
          {action} <Icon name="arrow" />
        </Button>
      )}
    </div>
  )
}

export default Empty
