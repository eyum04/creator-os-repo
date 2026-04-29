'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'

interface Star {
  id: number
  y: number
  delay: number
  duration: number
  length: number
  thickness: number
}

const COLOR_PRESETS = {
  blue:   { gradient: 'transparent 0%, #93C5FD 30%, #2563EB 70%, #ffffff 100%', glow: '#2563EB55' },
  gold:   { gradient: 'transparent 0%, #FCD34D 30%, #FBBF24 70%, #FEF9C3 100%', glow: '#FBBF2455' },
  legend: { gradient: 'transparent 0%, #C084FC 30%, #A855F7 70%, #EDE9FE 100%', glow: '#A855F755' },
}

export function ShootingStars({
  onComplete,
  color = 'blue',
}: {
  onComplete: () => void
  color?: 'blue' | 'gold' | 'legend'
}) {
  const stars: Star[] = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      y: 5 + (i * 6.5) + Math.random() * 4,
      delay: i * 0.07 + Math.random() * 0.08,
      duration: 0.65 + Math.random() * 0.35,
      length: 70 + Math.floor(Math.random() * 80),
      thickness: 1.5 + Math.random() * 2,
    }))
  , [])

  useEffect(() => {
    const maxDuration = Math.max(...stars.map(s => s.delay + s.duration))
    const t = setTimeout(onComplete, (maxDuration + 0.1) * 1000)
    return () => clearTimeout(t)
  }, [onComplete, stars])

  const preset = COLOR_PRESETS[color]

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {stars.map(star => (
        <motion.div
          key={star.id}
          initial={{ x: '-12vw', opacity: 0 }}
          animate={{ x: '112vw', opacity: [0, 0.9, 0.9, 0] }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            position: 'absolute',
            top: `${star.y}%`,
            width: `${star.length}px`,
            height: `${star.thickness}px`,
            background: `linear-gradient(90deg, ${preset.gradient})`,
            borderRadius: '999px',
            boxShadow: `0 0 6px 1px ${preset.glow}`,
          }}
        />
      ))}
    </div>
  )
}
