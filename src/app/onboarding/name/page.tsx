'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShimmerButton, FocusInput, spring } from '../_components'

export default function NamePage() {
  const [name, setName] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      localStorage.setItem('onboarding_name', name.trim())
      router.push('/onboarding/pillars')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          className="text-[38px] font-bold text-[#0F172A] mb-3 text-center tracking-[-0.02em]"
        >
          What should we call you?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.12 }}
          className="text-[18px] text-[#64748B] mb-10 text-center leading-relaxed"
        >
          We'll use this to personalize your experience.
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.18 }}
          className="space-y-4"
        >
          <FocusInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            autoFocus
          />
          <ShimmerButton
            type="submit"
            disabled={!name.trim()}
            className="w-full justify-center py-4"
          >
            Continue
          </ShimmerButton>
        </motion.form>
      </div>
    </div>
  )
}
