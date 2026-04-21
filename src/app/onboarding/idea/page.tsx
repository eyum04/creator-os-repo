'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShimmerButton, FocusInput, spring, bouncySpring } from '../_components'

interface Pillar {
  id: string
  name: string
  color: string
}

function SelectPillar({
  pillars,
  selectedId,
  onChange,
}: {
  pillars: Pillar[]
  selectedId: string
  onChange: (id: string) => void
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
      className="rounded-xl"
    >
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 py-3.5 bg-white border rounded-xl text-[15px] focus:outline-none appearance-none cursor-pointer"
        style={{
          borderColor: focused ? '#2563EB' : '#E2E8F0',
          color: selectedId ? '#0F172A' : '#94A3B8',
          transition: 'border-color 0.18s ease',
        }}
      >
        <option value="">Select a pillar (optional)</option>
        {pillars.map((pillar) => (
          <option key={pillar.id} value={pillar.id}>
            {pillar.name}
          </option>
        ))}
      </select>
    </motion.div>
  )
}

export default function IdeaPage() {
  const [title, setTitle] = useState('')
  const [selectedPillarId, setSelectedPillarId] = useState('')
  const [pillars, setPillars] = useState<Pillar[]>([])
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('onboarding_pillars')
    if (saved) setPillars(JSON.parse(saved))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && selectedPillarId) {
      localStorage.setItem('onboarding_idea', JSON.stringify({ title: title.trim(), pillarId: selectedPillarId }))
    }
    router.push('/onboarding/preview')
  }

  const handleSkip = () => {
    localStorage.removeItem('onboarding_idea')
    router.push('/onboarding/preview')
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
          Capture your first idea
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.12 }}
          className="text-[18px] text-[#64748B] mb-10 text-center leading-relaxed"
        >
          What's one video idea you've been thinking about?
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.18 }}
          className="space-y-4"
        >
          <FocusInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video idea title"
            autoFocus
          />

          <SelectPillar
            pillars={pillars}
            selectedId={selectedPillarId}
            onChange={setSelectedPillarId}
          />

          <div className="flex gap-3 pt-1">
            <ShimmerButton
              type="button"
              onClick={handleSkip}
              variant="secondary"
              className="flex-1 justify-center py-4"
            >
              Skip
            </ShimmerButton>
            <ShimmerButton type="submit" className="flex-1 justify-center py-4">
              Continue →
            </ShimmerButton>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
