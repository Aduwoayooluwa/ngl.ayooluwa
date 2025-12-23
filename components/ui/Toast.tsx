'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Trash2, X } from 'lucide-react'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
  type?: 'success' | 'error'
}

export default function Toast({ message, isVisible, onClose, type = 'success' }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 px-6 py-4 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {type === 'success' ? <Trash2 size={16} /> : <X size={16} />} 
                {/* Using Trash2 icon for success here because the context is "Deleted Successfully" */}
            </div>
            <span className="text-white font-medium text-nowrap">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
