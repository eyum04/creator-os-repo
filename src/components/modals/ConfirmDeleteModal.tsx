'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ShimmerButton } from '@/components/ui/ShimmerButton'

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 }

interface Props {
  itemName: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

export function ConfirmDeleteModal({ itemName, onConfirm, onClose }: Props) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={spring}
          className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-4">
            <svg viewBox="0 0 20 20" fill="#EF4444" className="w-5 h-5">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-[17px] font-bold text-[#0F172A] mb-1.5">Delete &ldquo;{itemName}&rdquo;?</h2>
          <p className="text-[14px] text-[#64748B] mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <ShimmerButton variant="secondary" onClick={onClose} className="flex-1 py-3 px-4 text-[14px]">
              Cancel
            </ShimmerButton>
            <motion.button
              onClick={handleConfirm}
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="flex-1 py-3 px-4 bg-[#EF4444] hover:bg-[#DC2626] text-white text-[14px] font-medium rounded-xl transition-colors duration-150 disabled:opacity-50"
            >
              {loading ? 'Deleting…' : 'Delete'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
