'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useState, useEffect } from 'react'
import { subscribeToPush } from '@/utils/push'

interface NotificationPromptModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationPromptModal({ isOpen, onClose }: NotificationPromptModalProps) {
  const [loading, setLoading] = useState(false)

  const handleEnable = async () => {
    setLoading(true)
    try {
      await subscribeToPush()
      onClose()
    } catch (error) {
      console.error(error)
      alert("Failed to enable notifications. Please try via the bell icon.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#1a1a1a] border border-brand-primary/20 w-full max-w-sm rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_-10px_rgba(255,0,80,0.3)] text-center"
              onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="mx-auto w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-6 animate-pulse-slow">
                    <Bell size={40} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Don't Miss Out!</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    Get instant alerts when someone sends you an anonymous message. Never miss the tea. 🍵
                </p>

                <div className="space-y-3">
                    <Button 
                        onClick={handleEnable} 
                        loading={loading}
                        className="w-full justify-center"
                        size="lg"
                    >
                        Enable Notifications
                    </Button>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 text-sm hover:text-white transition-colors py-2"
                    >
                        Maybe Later
                    </button>
                </div>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
