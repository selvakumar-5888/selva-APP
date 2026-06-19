interface BadgeProps {
  label: string
  color?: 'primary' | 'secondary' | 'tertiary' | 'error'
  className?: string
}

const colorMap = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  tertiary: 'bg-tertiary/10 text-tertiary',
  error: 'bg-error/10 text-error',
}

export function Badge({ label, color = 'primary', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-block px-sm py-xs rounded font-label-md text-label-md uppercase tracking-widest
        ${colorMap[color]}
        ${className}
      `}
    >
      {label}
    </span>
  )
}
