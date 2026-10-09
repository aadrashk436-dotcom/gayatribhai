import Button from "./Button"
import Icon from "./Icon"

export interface SectionTitleProps {
  eyebrow?: string
  title: string
  action?: string
  onAction?: () => void
}

export function SectionTitle({
  eyebrow,
  title,
  action,
  onAction,
}: SectionTitleProps) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action && (
        <Button variant="text" onClick={onAction}>
          {action} <Icon name="arrow" size={17} />
        </Button>
      )}
    </div>
  )
}

export default SectionTitle
