'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import React from 'react'

export const spring = { type: 'spring' as const, stiffness: 100, damping: 20 }
export const bouncySpring = { type: 'spring' as const, stiffness: 200, damping: 15 }

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

export function FocusInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  className = '',
  autoFocus = false,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  required?: boolean
  className?: string
  autoFocus?: boolean
}) {
  const [focused, setFocused] = useState(false)

  return (
    <motion.div
      animate={
        focused
          ? { boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)' }
          : { boxShadow: '0 0 0 0px rgba(37, 99, 235, 0)' }
      }
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`rounded-xl ${className}`}
    >
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          borderColor: focused ? '#2563EB' : '#E2E8F0',
          transition: 'border-color 0.18s ease',
        }}
        className="w-full px-4 py-3.5 bg-white border rounded-xl text-[#0F172A] text-[15px] placeholder-[#94A3B8] focus:outline-none"
      />
    </motion.div>
  )
}

export function LogoMark({ size = 56 }: { size?: number }) {
  const s = size / 56
  return (
    <motion.div
      animate={{ scale: [1, 1.06, 1], rotate: [0, 3, -1, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
        <rect width="56" height="56" rx="14" fill="#2563EB" />
        <rect x="16" y="16" width="10" height="10" rx="2.5" fill="white" />
        <rect x="30" y="16" width="10" height="10" rx="2.5" fill="white" opacity="0.65" />
        <rect x="16" y="30" width="10" height="10" rx="2.5" fill="white" opacity="0.65" />
        <rect x="30" y="30" width="10" height="10" rx="2.5" fill="white" opacity="0.3" />
      </svg>
    </motion.div>
  )
}
