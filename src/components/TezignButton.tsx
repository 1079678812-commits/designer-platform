'use client'

import { ReactNode } from 'react'

interface TezignButtonProps {
  children: ReactNode
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link'
  size?: 'small' | 'middle' | 'large'
  htmlType?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  className?: string
  href?: string
}

export default function TezignButton({
  children,
  type = 'default',
  size = 'middle',
  htmlType = 'button',
  onClick,
  disabled = false,
  loading = false,
  icon,
  className = '',
  href,
}: TezignButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-normal transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const typeClasses = {
    primary: 'bg-[#00B578] text-white border border-[#00B578] hover:bg-[#009A63] hover:border-[#009A63] focus:ring-[#00B578]/30',
    default: 'bg-white text-[rgba(0,0,0,0.85)] border border-[#D9D9D9] hover:text-[#00B578] hover:border-[#00B578] focus:ring-[#00B578]/30',
    dashed: 'bg-white text-[rgba(0,0,0,0.85)] border border-dashed border-[#D9D9D9] hover:text-[#00B578] hover:border-[#00B578] focus:ring-[#00B578]/30',
    text: 'bg-transparent text-[rgba(0,0,0,0.85)] border-none hover:text-[#00B578] hover:bg-[#FAFAFA] focus:ring-[#00B578]/30',
    link: 'bg-transparent text-[#00B578] border-none hover:text-[#009A63] hover:underline focus:ring-[#00B578]/30',
  }
  
  const sizeClasses = {
    small: 'h-7 px-3 text-sm rounded-[var(--radius-sm)]',
    middle: 'h-8 px-4 text-base rounded-[var(--radius-base)]',
    large: 'h-9 px-6 text-base rounded-[var(--radius-lg)]',
  }
  
  const buttonClasses = `${baseClasses} ${typeClasses[type]} ${sizeClasses[size]} ${className}`
  
  if (href) {
    return (
      <a
        href={href}
        className={buttonClasses}
        onClick={onClick}
      >
        {loading && (
          <span className="mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {icon && !loading && <span className="mr-2">{icon}</span>}
        {children}
      </a>
    )
  }
  
  return (
    <button
      type={htmlType}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <span className="mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}