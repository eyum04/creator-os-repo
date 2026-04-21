'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import React from 'react'

export function FocusInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  className = '',
  autoFocus = false,
  onKeyDown,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  required?: boolean
  className?: string
  autoFocus?: boolean
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
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
        onKeyDown={onKeyDown}
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
