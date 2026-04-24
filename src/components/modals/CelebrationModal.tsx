'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PHRASES = [
  'You posted! Stay consistent.',
  'Keep it up — consistency compounds.',
  'One more posted. Keep the momentum going.',
  'Posted! Your audience is watching.',
  'That\'s a wrap. Keep showing up.',
]

export function CelebrationModal({ onClose }: { onClose: () => void }) {
  const phrase = useRef(PHRASES[Math.floor(Math.random() * PHRASES.length)]).current

  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl px-10 py-10 flex flex-col items-center text-center max-w-xs w-full mx-4"
        >
          {/* Trophy */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl mb-5 select-none"
          >
            🏆
          </motion.div>

          <h2 className="text-[22px] font-bold text-[#0F172A] tracking-tight mb-2">
            Congrats!
          </h2>
          <p className="text-[15px] text-[#64748B] mb-8 leading-snug">{phrase}</p>

          <button
            onClick={onClose}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-semibold px-6 py-3 rounded-xl transition-colors duration-150"
          >
            Keep going →
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
