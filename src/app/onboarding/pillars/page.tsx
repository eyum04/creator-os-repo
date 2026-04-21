'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShimmerButton, FocusInput, spring, bouncySpring } from '../_components'

const COLORS = [
  '#2563EB', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
]

interface Pillar {
  id: string
  name: string
  color: string
}

export default function PillarsPage() {
  const [pillars, setPillars] = useState<Pillar[]>([])
  const [newPillarName, setNewPillarName] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('onboarding_pillars')
    if (saved) setPillars(JSON.parse(saved))
  }, [])

  const addPillar = () => {
    if (!newPillarName.trim()) return
    const updated = [...pillars, { id: Date.now().toString(), name: newPillarName.trim(), color: selectedColor }]
    setPillars(updated)
    localStorage.setItem('onboarding_pillars', JSON.stringify(updated))
    setNewPillarName('')
  }

  const removePillar = (id: string) => {
    const updated = pillars.filter(p => p.id !== id)
    setPillars(updated)
    localStorage.setItem('onboarding_pillars', JSON.stringify(updated))
  }

  const getHint = () => {
    if (pillars.length === 0) return 'We recommend starting with 3 pillars.'
    if (pillars.length === 1) return 'Great start. Add a second pillar to diversify.'
    if (pillars.length === 2) return "One more will give you a solid foundation."
    return `${pillars.length} pillars added. Keep going or continue.`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="max-w-xl w-full">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          className="text-[38px] font-bold text-[#0F172A] mb-3 text-center tracking-[-0.02em]"
        >
          Set up your content pillars
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.12 }}
          className="text-[18px] text-[#64748B] mb-10 text-center"
        >
          {getHint()}
        </motion.p>

        {/* Add pillar card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.18 }}
          className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl p-6 mb-5"
        >
          {/* Color swatches */}
          <div className="flex gap-3 mb-5 flex-wrap">
            {COLORS.map((color) => (
              <motion.button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                whileHover={{ scale: 1.14 }}
                whileTap={{ scale: 0.9 }}
                transition={bouncySpring}
                className="relative w-10 h-10 rounded-full flex-shrink-0 focus:outline-none"
                style={{ backgroundColor: color }}
              >
                <AnimatePresence>
                  {selectedColor === color && (
                    <motion.div
                      key="ring"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={bouncySpring}
                      className="absolute inset-[-4px] rounded-full border-[2.5px] border-[#2563EB] pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          <div className="flex gap-3">
            <FocusInput
              value={newPillarName}
              onChange={(e) => setNewPillarName(e.target.value)}
              placeholder="Pillar name (e.g. Fitness Tips)"
              className="flex-1"
            />
            <ShimmerButton onClick={addPillar} disabled={!newPillarName.trim()}>
              Add
            </ShimmerButton>
          </div>
        </motion.div>

        {/* Pillar list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.24 }}
        >
          <AnimatePresence>
            {pillars.map((pillar) => (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.96 }}
                transition={spring}
                className="flex items-center justify-between bg-[#F8F9FA] border border-[#E2E8F0] px-4 py-3.5 rounded-xl mb-2.5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-[18px] h-[18px] rounded-full flex-shrink-0"
                    style={{ backgroundColor: pillar.color }}
                  />
                  <span className="text-[#0F172A] font-medium">{pillar.name}</span>
                </div>
                <motion.button
                  type="button"
                  onClick={() => removePillar(pillar.id)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  transition={bouncySpring}
                  className="text-[#CBD5E1] hover:text-[#EF4444] transition-colors text-xl leading-none w-6 h-6 flex items-center justify-center"
                >
                  ×
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {pillars.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.05 }}
                className="mt-3"
              >
                <ShimmerButton
                  onClick={() => router.push('/onboarding/idea')}
                  className="w-full justify-center py-4"
                >
                  Continue →
                </ShimmerButton>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
