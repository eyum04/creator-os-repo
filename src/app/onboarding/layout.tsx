'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

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
    <div className="relative min-h-screen bg-white dark:bg-[#0F172A]">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-[#E2E8F0] dark:bg-[#334155] z-50">
        <motion.div
          className="h-full bg-[#2563EB] origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          style={{ transformOrigin: 'left' }}
        />
      </div>
      {children}
    </div>
  )
}
