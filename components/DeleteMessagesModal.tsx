'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertTriangle, X, Calendar } from 'lucide-react'
import { DatePicker } from 'antd'
import Button from '@/components/ui/Button'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

interface DeleteMessagesModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (startDate?: Date, endDate?: Date) => Promise<void>
}

export default function DeleteMessagesModal({ isOpen, onClose, onConfirm }: DeleteMessagesModalProps) {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'all' | 'date'>('all')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      if (mode === 'all') {
        await onConfirm()
      } else if (dateRange && dateRange[0] && dateRange[1]) {
        await onConfirm(dateRange[0].toDate(), dateRange[1].toDate())
      }
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      // Reset state on close
      setTimeout(() => {
          setMode('all')
          setDateRange(null)
      }, 300)
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
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-lg rounded-3xl p-6 shadow-2xl pointer-events-auto relative overflow-hidden">
              
              {/* Decorative Gradient Blob */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Clear Inbox</h2>
                            <p className="text-gray-400 text-sm">Remove messages from your history</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6">
                    <button 
                        onClick={() => setMode('all')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'all' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Clear Everything
                    </button>
                    <button 
                        onClick={() => setMode('date')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'date' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Select Date Range
                    </button>
                </div>

                {/* Content */}
                <div className="mb-8 min-h-[120px]">
                    {mode === 'all' ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-200">
                            <AlertTriangle className="shrink-0" />
                            <p className="text-sm">
                                <strong>Warning:</strong> This action is irreversible. All messages in your inbox will be permanently deleted.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-gray-300 text-sm">Select the start and end date to clear messages from.</p>
                            <Calendar className="absolute top-0 right-0 opacity-0 pointer-events-none" /> {/* Preload lucide icon just in case */}
                            <div className="custom-datepicker-wrapper">
                                <RangePicker 
                                    className="w-full bg-white/5 border-white/10 py-3 rounded-xl hover:bg-white/10 text-white "
                                    dropdownClassName="dark-theme-datepicker"
                                    onChange={(dates) => setDateRange(dates)}
                                    format="MMM D, YYYY"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3">
                    <Button variant="ghost" className="flex-1" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirm} 
                        loading={loading}
                        className={`flex-1 ${mode === 'all' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                        disabled={mode === 'date' && (!dateRange || !dateRange[0])}
                    >
                        {mode === 'all' ? 'Delete All Messages' : 'Delete Selected'}
                    </Button>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
