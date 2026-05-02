'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ShimmerButton, LogoMark, spring } from '../_components'

const HEADLINE = "Stop holding your content ideas in your head"

export default function WelcomePage() {
  const router = useRouter()
  const words = HEADLINE.split(' ')

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white px-4 overflow-hidden">
      {/* Breathing background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(37,99,235,0.04) 0%, rgba(255,255,255,0) 70%)',
            'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(37,99,235,0.09) 0%, rgba(255,255,255,0) 70%)',
            'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(37,99,235,0.04) 0%, rgba(255,255,255,0) 70%)',
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-3xl w-full text-center">
        {/* Logo mark */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
        >
          <LogoMark size={52} />
        </motion.div>

        {/* Word-by-word headline */}
        <h1 className="text-[clamp(42px,6.5vw,72px)] font-bold leading-[1.08] tracking-[-0.03em] text-[#0F172A] mb-7">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, filter: 'blur(8px)', y: 14 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{
                delay: 0.25 + i * 0.08,
                type: 'spring',
                stiffness: 100,
                damping: 20,
              }}
              className="inline-block mr-[0.28em] last:mr-0"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.25 + words.length * 0.08 + 0.12 }}
          className="text-[18px] text-[#64748B] leading-relaxed mb-12 max-w-xl mx-auto"
        >
          Turn your content dreams into a structured content machine with CreatorOS.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.25 + words.length * 0.08 + 0.3 }}
          className="flex justify-center"
        >
          <ShimmerButton
            onClick={() => router.push('/onboarding/name')}
            className="px-8 py-4 text-[16px]"
          >
            Get Started →
          </ShimmerButton>
        </motion.div>
      </div>
    </div>
  )
}
