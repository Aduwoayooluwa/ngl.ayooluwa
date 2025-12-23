
'use client'

import { motion, HTMLMotionProps } from 'framer-motion'

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  variant?: 'default' | 'strong'
  hoverEffect?: boolean
}

export default function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hoverEffect = false,
  ...props 
}: CardProps) {
  return (
    <motion.div
      initial={hoverEffect ? { y: 0 } : undefined}
      whileHover={hoverEffect ? { y: -5, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' } : undefined}
      className={`
        rounded-3xl p-6
        ${variant === 'default' ? 'glass' : 'glass-strong'}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}
