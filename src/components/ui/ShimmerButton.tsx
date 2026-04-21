'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import React from 'react'

const bouncySpring = { type: 'spring' as const, stiffness: 200, damping: 15 }

export function ShimmerButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  variant = 'primary',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
  variant?: 'primary' | 'secondary'
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onHoverStart={() => !disabled && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={bouncySpring}
      className={[
        'relative overflow-hidden rounded-xl font-medium text-[15px] cursor-pointer',
        'py-[14px] px-7 select-none',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
        variant === 'primary'
          ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
          : 'bg-[#F8F9FA] text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]',
        'transition-colors duration-150',
        className,
      ].join(' ')}
    >
      <AnimatePresence>
        {isHovered && !disabled && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '250%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'linear' }}
            className="absolute inset-0 pointer-events-none -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />
        )}
      </AnimatePresence>
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
