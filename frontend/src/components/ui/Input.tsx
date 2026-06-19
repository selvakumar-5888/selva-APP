import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: string
  error?: string
  rightElement?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, rightElement, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="flex flex-col gap-xs w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="font-label-md text-label-md text-secondary uppercase tracking-widest px-xs"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors select-none pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full bg-surface-container-lowest border-0 border-b border-outline-variant
              focus:border-primary focus:ring-0 focus:outline-none
              text-on-surface placeholder:text-outline-variant
              transition-all rounded-t-lg py-md pr-md
              ${icon ? 'pl-xl' : 'pl-md'}
              ${error ? 'border-error' : ''}
              ${className}
            `}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-md top-1/2 -translate-y-1/2">{rightElement}</div>
          )}
        </div>
        {error && (
          <p className="text-error font-label-md text-label-md px-xs">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
