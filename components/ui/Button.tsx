
'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false,
  ...props 
}: ButtonProps) {
  
  const baseStyles = "relative overflow-hidden rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-black"
  
  const variants = {
    primary: "bg-gradient-to-r from-[var(--color-brand-gradient-start)] to-[var(--color-brand-gradient-end)] text-white shadow-[0_0_20px_rgba(255,0,80,0.5)] hover:shadow-[0_0_30px_rgba(255,0,80,0.7)] border-none",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
  }

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-4 py-3 md:px-6 text-base",
    lg: "px-6 py-4 md:px-8 text-lg"
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${loading ? 'opacity-80 cursor-wait' : ''}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </motion.button>
  )
}
