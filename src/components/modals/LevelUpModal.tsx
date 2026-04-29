'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { TROPHY_CONFIG, type TrophyLevel } from '@/lib/types'
import { ShootingStars } from '@/components/ui/ShootingStars'

interface Props {
  level: TrophyLevel
  onClose: () => void
}

function Particles({ color }: { color: string }) {
  const count = 18
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * 360
        const dist = 80 + Math.random() * 60
        const x = Math.cos((angle * Math.PI) / 180) * dist
        const y = Math.sin((angle * Math.PI) / 180) * dist
        return (
          <motion.div
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{ opacity: 0, x, y, scale: 0 }}
            transition={{ duration: 0.8, delay: 0.1 + i * 0.02, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: color,
              marginLeft: -3,
              marginTop: -3,
            }}
          />
        )
      })}
    </div>
  )
}

const SPRING_POP = [0.34, 1.56, 0.64, 1] as const

const ANIM = {
  Bronze: {
    initial: { scale: 0.5, opacity: 0, y: 40 },
    animate: { scale: [0.5, 1.15, 0.95, 1.05, 1] as number[], opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: SPRING_POP },
  },
  Silver: {
    initial: { scale: 0.6, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.5, ease: SPRING_POP },
  },
  Gold: {
    initial: { scale: 0.4, opacity: 0, rotate: -8 },
    animate: { scale: 1, opacity: 1, rotate: 0 },
    transition: { duration: 0.6, ease: SPRING_POP },
  },
  Legend: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.5, ease: SPRING_POP },
  },
}

export function LevelUpModal({ level, onClose }: Props) {
  const cfg = TROPHY_CONFIG[level]
  const anim = ANIM[level]
  const closedRef = useRef(false)

  const handleClose = () => {
    if (closedRef.current) return
    closedRef.current = true
    onClose()
  }

  useEffect(() => {
    const t = setTimeout(handleClose, 4000)
    return () => clearTimeout(t)
  }, [])

  const showStars = level === 'Gold' || level === 'Legend'
  const starsColor = level === 'Legend' ? 'legend' : 'gold'
  const showParticles = level === 'Legend'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {showStars && (
          <ShootingStars
            color={starsColor}
            onComplete={() => {}}
          />
        )}

        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleClose}
        />

        {/* Card */}
        <motion.div
          className="relative z-10 flex flex-col items-center gap-4 bg-white rounded-2xl shadow-2xl px-10 py-10 max-w-sm w-full mx-4 text-center overflow-hidden"
          initial={anim.initial}
          animate={anim.animate}
          transition={anim.transition}
          style={{ boxShadow: `0 0 60px 0 ${cfg.glowColor}, 0 4px 24px rgba(0,0,0,0.12)` }}
        >
          {showParticles && <Particles color={cfg.color} />}

          {/* Shimmer bar for Silver */}
          {level === 'Silver' && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay: 0.5 }}
            />
          )}

          {/* Glow ring */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-5xl"
            style={{ background: cfg.glowColor, boxShadow: `0 0 30px 6px ${cfg.glowColor}` }}
          >
            {cfg.emoji}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: cfg.color }}>
              Trophy Unlocked
            </p>
            <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight" style={{ color: cfg.color }}>
              {cfg.label}
            </h2>
          </div>

          <p className="text-[#64748B] text-sm leading-relaxed">{cfg.message}</p>

          <button
            onClick={handleClose}
            className="mt-2 text-xs text-[#94A3B8] hover:text-[#64748B] transition-colors"
          >
            Tap to dismiss
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
