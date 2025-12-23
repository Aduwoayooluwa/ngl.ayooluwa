
'use client'

import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1 w-full relative group">
      {label && (
        <label className="text-sm font-medium text-gray-400 group-focus-within:text-white transition-colors ml-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary/50 focus:bg-white/10 transition-all duration-300 w-full ${className}`}
        {...props}
      />
      {error && (
        <span className="text-red-500 text-xs ml-1">{error}</span>
      )}
    </div>
  )
})

Input.displayName = "Input"

export default Input
