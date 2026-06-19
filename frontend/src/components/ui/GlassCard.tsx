import React from 'react'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hoverable?: boolean
  glow?: boolean
  className?: string
}

export function GlassCard({ children, hoverable = true, glow = false, className = '', ...props }: GlassCardProps) {
  return (
    <div
      className={`
        backdrop-blur-[12px] bg-white/[0.03] border border-white/[0.08] rounded-xl
        transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
        ${hoverable ? 'hover:bg-white/[0.06] hover:border-primary/30 hover:shadow-[0_0_20px_rgba(108,99,255,0.1)]' : ''}
        ${glow ? 'animate-pulse-glow' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
