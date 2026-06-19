import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  icon?: string
  children: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-container active:scale-[0.98] shadow-lg shadow-primary/20 hover:shadow-primary/40 shimmer-btn',
  secondary:
    'bg-secondary text-on-secondary hover:opacity-90 active:scale-[0.98] shadow-lg shadow-secondary/20',
  ghost:
    'bg-transparent text-primary hover:bg-primary/10 active:scale-[0.98]',
  danger:
    'bg-error text-on-error hover:opacity-90 active:scale-[0.98]',
  outline:
    'bg-transparent border border-white/20 text-on-surface hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'py-sm px-md text-label-md',
  md: 'py-md px-lg text-label-md',
  lg: 'py-lg px-xl text-label-md',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        relative inline-flex items-center justify-center gap-xs
        font-label-md rounded-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="animate-spin">
            <span className="material-symbols-outlined text-sm">progress_activity</span>
          </span>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="material-symbols-outlined text-sm">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}
