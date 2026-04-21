'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef } from 'react'

const STEP_MAP: Record<string, number> = {
  '/onboarding/welcome': 1,
  '/onboarding/name': 2,
  '/onboarding/pillars': 3,
  '/onboarding/idea': 4,
  '/onboarding/preview': 5,
}

const PREV_MAP: Record<string, string> = {
  '/onboarding/welcome': '/',
  '/onboarding/name': '/onboarding/welcome',
  '/onboarding/pillars': '/onboarding/name',
  '/onboarding/idea': '/onboarding/pillars',
  '/onboarding/preview': '/onboarding/idea',
}

const TOTAL = 5

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 48 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -48 }),
}

const transition = { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] as const }

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const step = STEP_MAP[pathname] ?? 1
  const progress = (step / TOTAL) * 100
  const prevPath = PREV_MAP[pathname]

  const prevStepRef = useRef(step)
  const directionRef = useRef(1)
  if (prevStepRef.current !== step) {
    directionRef.current = step > prevStepRef.current ? 1 : -1
    prevStepRef.current = step
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0F172A] overflow-x-hidden">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-[#E2E8F0] dark:bg-[#334155] z-50">
        <motion.div
          className="h-full bg-[#2563EB]"
          animate={{ scaleX: progress / 100 }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          style={{ transformOrigin: 'left', scaleX: 0 }}
        />
      </div>

      {/* Back button */}
      <motion.button
        key={prevPath ?? 'none'}
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={() => router.push(prevPath ?? '/')}
        className="fixed top-5 left-5 z-50 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[14px] font-medium text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors duration-150"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Back
      </motion.button>

      {/* Page transitions */}
      <AnimatePresence mode="wait" custom={directionRef.current}>
        <motion.div
          key={pathname}
          custom={directionRef.current}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
