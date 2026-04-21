'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const STEP_MAP: Record<string, number> = {
  '/onboarding/welcome': 1,
  '/onboarding/name': 2,
  '/onboarding/pillars': 3,
  '/onboarding/idea': 4,
  '/onboarding/preview': 5,
}
const TOTAL = 5

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const step = STEP_MAP[pathname] ?? 1
  const progress = (step / TOTAL) * 100

  return (
    <div className="relative min-h-screen bg-white">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-[#E2E8F0] z-50">
        <motion.div
          className="h-full bg-[#2563EB] origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          style={{ transformOrigin: 'left' }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35, type: 'spring', stiffness: 100, damping: 22 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
