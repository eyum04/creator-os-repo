'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useAuth, useClerk } from '@clerk/nextjs'

// ─── Spring presets ───────────────────────────────────────────────────────────
const sp = { type: 'spring' as const, stiffness: 100, damping: 20 }
const bouncy = { type: 'spring' as const, stiffness: 200, damping: 15 }

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  dark: '#1a1615',
  darkMid: '#453f3d',
  muted: '#757170',
  border: '#e4e2e2',
  cream: '#f4f1ee',
  creamAlt: '#f1ebe5',
  creamWarm: '#f4e6da',
  blueAccent: '#156cc2',
  blueLight: '#84b9ef',
  bluePale: '#e2ecf5',
  canvas: '#9cc1e7',
  white: '#ffffff',
} as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [threshold])
  return scrolled
}

function Reveal({
  children,
  delay = 0,
  y = 32,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-70px 0px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ ...sp, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function LogoMark({ size = 28, light = false }: { size?: number; light?: boolean }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" width={size} height={size}>
      <rect width="28" height="28" rx="7" fill={light ? C.white : C.blueAccent} />
      <rect x="8" y="8" width="5" height="5" rx="1.25" fill={light ? C.blueAccent : C.white} />
      <rect x="15" y="8" width="5" height="5" rx="1.25" fill={light ? C.blueAccent : C.white} opacity="0.65" />
      <rect x="8" y="15" width="5" height="5" rx="1.25" fill={light ? C.blueAccent : C.white} opacity="0.65" />
      <rect x="15" y="15" width="5" height="5" rx="1.25" fill={light ? C.blueAccent : C.white} opacity="0.3" />
    </svg>
  )
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

function DarkButton({
  children,
  href,
  onClick,
  size = 'md',
}: {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}) {
  const [hovered, setHovered] = useState(false)
  const pad =
    size === 'lg'
      ? 'py-4 px-8 text-[17px]'
      : size === 'sm'
      ? 'py-2.5 px-5 text-[13px]'
      : 'py-3.5 px-7 text-[15px]'
  const cls = `relative overflow-hidden rounded-xl font-semibold text-white bg-[#1a1615] hover:bg-[#2d2826] transition-colors duration-150 ${pad} select-none`
  const inner = (
    <>
      {hovered && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '250%' }}
          transition={{ duration: 0.45, ease: 'linear' }}
          className="absolute inset-0 pointer-events-none -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
      )}
      <span className="relative z-10">{children}</span>
    </>
  )
  if (href)
    return (
      <motion.div whileTap={{ scale: 0.98 }} transition={bouncy} className="inline-block">
        <Link href={href} className={cls} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          {inner}
        </Link>
      </motion.div>
    )
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={bouncy}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={cls}
    >
      {inner}
    </motion.button>
  )
}

function OutlineButton({
  children,
  onClick,
  size = 'md',
  onDark = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  onDark?: boolean
}) {
  const pad =
    size === 'lg'
      ? 'py-4 px-8 text-[17px]'
      : size === 'sm'
      ? 'py-2.5 px-5 text-[13px]'
      : 'py-3.5 px-7 text-[15px]'
  const colorCls = onDark
    ? 'border-white/30 text-white hover:bg-white/10'
    : 'border-[#1a1615]/25 text-[#1a1615] hover:bg-[#1a1615]/5'
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={bouncy}
      className={`rounded-xl font-semibold border transition-colors duration-150 ${pad} ${colorCls} select-none`}
    >
      {children}
    </motion.button>
  )
}

function WhiteButton({
  children,
  href,
  size = 'md',
}: {
  children: React.ReactNode
  href?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const pad =
    size === 'lg'
      ? 'py-4 px-8 text-[17px]'
      : size === 'sm'
      ? 'py-2.5 px-5 text-[13px]'
      : 'py-3.5 px-7 text-[15px]'
  const cls = `rounded-xl font-semibold bg-white text-[#1a1615] hover:bg-[#f4f1ee] transition-colors duration-150 ${pad} select-none inline-block`
  if (href)
    return (
      <motion.div whileTap={{ scale: 0.98 }} transition={bouncy} className="inline-block">
        <Link href={href} className={cls}>{children}</Link>
      </motion.div>
    )
  return (
    <motion.button whileTap={{ scale: 0.98 }} transition={bouncy} className={cls}>
      {children}
    </motion.button>
  )
}

// ─── Floating background (cream shapes on blue) ───────────────────────────────

function FloatingBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full"
        style={{ background: 'rgba(255,255,255,0.08)', filter: 'blur(90px)', top: '-15%', left: '-8%' }}
        animate={{ y: [0, 50, 0], x: [0, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[550px] h-[550px] rounded-full"
        style={{ background: 'rgba(255,255,255,0.06)', filter: 'blur(80px)', top: '35%', right: '-10%' }}
        animate={{ y: [0, -40, 0], x: [0, -18, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{ background: 'rgba(244,225,218,0.12)', filter: 'blur(70px)', bottom: '5%', left: '25%' }}
        animate={{ y: [0, 28, 0], x: [0, -14, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Small decorative dots */}
      {[
        { top: '12%', left: '7%', d: 8 },
        { top: '58%', right: '9%', d: 6 },
        { top: '78%', left: '4%', d: 10 },
        { top: '32%', left: '52%', d: 5 },
      ].map(({ d, ...pos }, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: d,
            height: d,
            background: 'rgba(255,255,255,0.25)',
            ...pos,
          }}
          animate={{ y: [0, -14, 0], opacity: [0.3, 0.65, 0.3] }}
          transition={{ duration: 8 + i * 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 }}
        />
      ))}
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const scrolled = useScrolled()
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...sp, delay: 0.1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-[#9cc1e7]/80 border-b border-white/20 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="font-bold text-[#1a1615] text-[17px] tracking-[-0.02em]">CreatorOS</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Features', id: 'features' },
            { label: 'How it works', id: 'how-it-works' },
            { label: 'Pricing', id: 'cta' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-[14px] font-medium text-[#453f3d] hover:text-[#1a1615] transition-colors duration-150"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-[14px] font-medium text-[#453f3d] hover:text-[#1a1615] transition-colors hidden sm:block"
          >
            Sign in
          </Link>
          <DarkButton href="/sign-in" size="sm">
            Get started
          </DarkButton>
        </div>
      </div>
    </motion.nav>
  )
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

const HERO_DARK = "Stop holding your content ideas"
const HERO_ACCENT = "in your head."

function HeroSection() {
  const darkWords = HERO_DARK.split(' ')
  const accentWords = HERO_ACCENT.split(' ')
  const totalWords = darkWords.length + accentWords.length
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="canvas-bg relative min-h-screen flex items-center justify-center px-6 pt-24 pb-20 z-10">
      <div className="max-w-4xl w-full text-center">
        {/* Label pill */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sp, delay: 0.2 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-9"
          style={{ backgroundColor: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.5)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#1a1615]" />
          <span className="text-[13px] font-semibold text-[#1a1615] tracking-wide">Built for All Creators</span>
        </motion.div>

        {/* Headline — word by word */}
        <h1 className="text-[clamp(40px,7vw,72px)] font-bold leading-[1.06] tracking-[-0.03em] text-[#1a1615] mb-6">
          {darkWords.map((word, i) => (
            <motion.span
              key={`d-${i}`}
              initial={{ opacity: 0, filter: 'blur(8px)', y: 12 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, ...sp }}
              className="inline-block mr-[0.28em]"
            >
              {word}
            </motion.span>
          ))}
          <br className="hidden sm:block" />
          {accentWords.map((word, i) => (
            <motion.span
              key={`a-${i}`}
              initial={{ opacity: 0, filter: 'blur(8px)', y: 12 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ delay: 0.3 + (darkWords.length + i) * 0.08, ...sp }}
              className="inline-block mr-[0.28em] last:mr-0"
              style={{ color: C.blueAccent }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sp, delay: 0.3 + totalWords * 0.08 + 0.1 }}
          className="text-[20px] leading-relaxed mb-10 max-w-2xl mx-auto"
          style={{ color: C.darkMid }}
        >
          CreatorOS helps you capture ideas, plan videos, and build a content presence you're proud of.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sp, delay: 0.3 + totalWords * 0.08 + 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
        >
          <DarkButton href="/sign-in" size="lg">
            Get started free
          </DarkButton>
          <OutlineButton onClick={() => scrollTo('how-it-works')} size="lg">
            See how it works
          </OutlineButton>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sp, delay: 0.3 + totalWords * 0.08 + 0.45 }}
          className="flex items-center justify-center gap-2.5"
        >
          <div className="flex -space-x-2">
            {['#1a1615', '#156cc2', '#84b9ef', '#453f3d'].map((color, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: 'rgba(255,255,255,0.6)', backgroundColor: color }}
              >
                <span className="text-white text-[9px] font-bold">{['A', 'S', 'K', 'M'][i]}</span>
              </div>
            ))}
          </div>
          <span className="text-[14px]" style={{ color: C.darkMid }}>
            Join creators already building with CreatorOS
          </span>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Dashboard mockup ─────────────────────────────────────────────────────────

function KanbanCard({
  title,
  pillar,
  color,
  meta,
  script,
}: {
  title: string
  pillar: string
  color: string
  meta?: string
  script?: string
}) {
  return (
    <div
      style={{
        backgroundColor: C.white,
        border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 8,
        padding: '7px 8px',
        marginBottom: 6,
      }}
    >
      <p style={{ fontSize: 10, fontWeight: 500, color: C.dark, lineHeight: 1.35, marginBottom: 5 }}>
        {title}
      </p>
      {script && (
        <p
          style={{
            fontSize: 9,
            color: C.muted,
            backgroundColor: C.cream,
            padding: '3px 6px',
            borderRadius: 4,
            marginBottom: 5,
            lineHeight: 1.3,
            fontStyle: 'italic',
          }}
        >
          {script}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
          <span style={{ fontSize: 9, color: C.muted }}>{pillar}</span>
        </div>
        {meta && <span style={{ fontSize: 9, color: C.muted }}>{meta}</span>}
      </div>
    </div>
  )
}

const PIPELINE_DATA = [
  {
    stage: 'IDEA',
    dot: C.blueAccent,
    cards: [
      { title: '5 gym mistakes beginners make', pillar: 'Fitness', color: C.blueAccent, meta: 'Jun 8' },
      { title: 'My morning routine for creators', pillar: 'Mindset', color: '#c9502e' },
      { title: '3 things I wish I knew before starting', pillar: 'Mindset', color: '#c9502e' },
    ],
  },
  {
    stage: 'SCRIPTED',
    dot: '#0ea158',
    cards: [
      { title: 'Meal prep for a week in 30 min', pillar: 'Nutrition', color: '#0ea158', script: '🎬 Hook: What if I told you...' },
      { title: 'Realistic supplement review', pillar: 'Fitness', color: C.blueAccent },
    ],
  },
  {
    stage: 'FILMED',
    dot: '#cf8d13',
    cards: [
      { title: '10-min beginner workout', pillar: 'Fitness', color: C.blueAccent, meta: '6/8 shots ✓' },
    ],
  },
  {
    stage: 'POSTED',
    dot: C.darkMid,
    cards: [
      { title: 'The mindset shift that changed everything', pillar: 'Mindset', color: '#c9502e', meta: '✓ May 15' },
      { title: 'What nobody tells you about consistency', pillar: 'Mindset', color: '#c9502e', meta: '✓ May 12' },
    ],
  },
]

function DashboardMockup() {
  return (
    <div style={{ backgroundColor: '#fafafa', fontFamily: 'inherit', userSelect: 'none' }}>
      {/* Browser chrome */}
      <div
        style={{
          backgroundColor: C.cream,
          borderBottom: `1px solid ${C.border}`,
          height: 38,
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          {['#c9502e', '#cf8d13', '#0ea158'].map(col => (
            <div key={col} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: col }} />
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              backgroundColor: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: '3px 20px',
              fontSize: 10,
              color: C.muted,
              minWidth: 180,
              textAlign: 'center',
            }}
          >
            creatoros.app/pipeline
          </div>
        </div>
      </div>

      {/* App layout */}
      <div style={{ display: 'flex', height: 430 }}>
        {/* ── Sidebar */}
        <div
          style={{
            width: 158,
            backgroundColor: C.cream,
            borderRight: `1px solid ${C.border}`,
            padding: '12px 8px',
            flexShrink: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: '0 4px' }}>
            <LogoMark size={18} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.dark, letterSpacing: '-0.01em' }}>
              CreatorOS
            </span>
          </div>

          {/* Nav */}
          {[
            { label: 'Home', active: false },
            { label: 'Pipeline', active: true },
            { label: 'Pillars', active: false },
            { label: 'Calendar', active: false },
            { label: 'Shot Lists', active: false },
          ].map(item => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '5px 8px',
                borderRadius: 7,
                marginBottom: 1,
                backgroundColor: item.active ? C.dark : 'transparent',
                color: item.active ? C.white : C.muted,
                fontSize: 11,
                fontWeight: item.active ? 600 : 400,
                cursor: 'default',
              }}
            >
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 3,
                  backgroundColor: 'currentColor',
                  opacity: item.active ? 0.9 : 0.35,
                  flexShrink: 0,
                }}
              />
              {item.label}
            </div>
          ))}

          {/* Pillars */}
          <div style={{ marginTop: 14, padding: '0 4px' }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: C.muted,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              My Pillars
            </div>
            {[
              { name: 'Fitness', color: C.blueAccent },
              { name: 'Mindset', color: '#c9502e' },
              { name: 'Nutrition', color: '#0ea158' },
              { name: 'Lifestyle', color: '#cf8d13' },
            ].map(p => (
              <div
                key={p.name}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', fontSize: 10.5, color: C.darkMid }}
              >
                <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: p.color, flexShrink: 0 }} />
                {p.name}
              </div>
            ))}
          </div>

          {/* Upcoming */}
          <div style={{ marginTop: 14, padding: '0 4px' }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: C.muted,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Upcoming
            </div>
            {[
              { date: 'Jun 1', title: 'Meal prep video' },
              { date: 'Jun 5', title: 'Workout tips' },
              { date: 'Jun 8', title: 'Gym mistakes' },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9, color: C.blueAccent, fontWeight: 600 }}>{item.date}</div>
                <div style={{ fontSize: 9.5, color: C.darkMid, lineHeight: 1.3 }}>{item.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main content */}
        <div style={{ flex: 1, padding: '14px 14px', overflow: 'hidden', backgroundColor: '#fafafa' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, letterSpacing: '-0.01em' }}>
                My Pipeline
              </div>
              <div style={{ fontSize: 9.5, color: C.muted, marginTop: 1 }}>
                10 ideas across 4 stages
              </div>
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: C.white,
                backgroundColor: C.dark,
                padding: '4px 10px',
                borderRadius: 7,
                cursor: 'default',
              }}
            >
              + New idea
            </div>
          </div>

          {/* Kanban */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 10,
              height: 'calc(100% - 48px)',
              overflow: 'hidden',
            }}
          >
            {PIPELINE_DATA.map(col => (
              <div key={col.stage} style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: col.dot, flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: 8.5,
                      fontWeight: 700,
                      color: C.muted,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {col.stage}
                  </span>
                  <span style={{ fontSize: 9, color: C.muted, marginLeft: 2 }}>{col.cards.length}</span>
                </div>
                {col.cards.map((card, i) => (
                  <KanbanCard key={i} {...card} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── App preview section ──────────────────────────────────────────────────────

function AppPreviewSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)
  const inView = useInView(mockupRef, { once: true, margin: '0px 0px -40px 0px' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [16, -40])

  return (
    <section
      ref={sectionRef}
      className="canvas-bg relative z-10 px-6 pb-28"
      style={{ marginTop: -2 }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Section hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ ...sp, delay: 0.6 }}
          className="text-center text-[13px] font-medium mb-8"
          style={{ color: 'rgba(26,22,21,0.45)' }}
        >
          ↓ See what your workspace looks like
        </motion.p>

        <div ref={mockupRef}>
          {/* Outer entrance wrapper — opacity, scale, 3-D tilt */}
          <motion.div
            style={{ transformPerspective: 1400 }}
            initial={{ opacity: 0, scale: 0.92, rotateX: 10 }}
            animate={inView ? { opacity: 1, scale: 1, rotateX: 0 } : {}}
            transition={{ type: 'spring', stiffness: 65, damping: 18, delay: 0.05 }}
          >
            {/* Inner scroll-parallax wrapper */}
            <motion.div style={{ y: parallaxY }}>
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  boxShadow: '0 40px 120px rgba(26,22,21,0.28), 0 8px 24px rgba(26,22,21,0.12)',
                  border: `1px solid rgba(255,255,255,0.6)`,
                }}
              >
                <DashboardMockup />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Devices section ──────────────────────────────────────────────────────────

function MobileAppUI() {
  const pillars = [
    { name: 'Lifestyle', color: '#2563EB' },
    { name: 'Comedy', color: '#EF4444' },
    { name: 'Tutorial', color: '#10B981' },
  ]
  const ideas = [
    { title: 'Morning routine reveal', pillar: 'Lifestyle', stage: 'Scripted', color: '#2563EB' },
    { title: 'POV: first brand deal', pillar: 'Comedy', stage: 'Idea', color: '#EF4444' },
    { title: 'How I batch film 30 vids', pillar: 'Tutorial', stage: 'Filmed', color: '#10B981' },
    { title: 'Studio apartment tour', pillar: 'Lifestyle', stage: 'Posted', color: '#2563EB' },
  ]
  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden rounded-[28px]">
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1">
        <span className="text-[10px] font-semibold text-[#0F172A]">9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 border border-[#0F172A] rounded-[2px] relative">
            <div className="absolute inset-[1px] right-[3px] bg-[#0F172A] rounded-[1px]" />
            <div className="absolute right-0 top-[3px] w-[2px] h-[4px] bg-[#0F172A] rounded-r-[1px]" />
          </div>
          <div className="flex gap-0.5 items-end">
            {[3,4,5,6].map(h => <div key={h} className="w-[2px] bg-[#0F172A] rounded-full" style={{ height: h }} />)}
          </div>
        </div>
      </div>

      {/* App header */}
      <div className="px-4 pt-2 pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <rect width="20" height="20" rx="5" fill="#2563EB" />
              <rect x="5.5" y="5.5" width="3.5" height="3.5" rx="0.8" fill="white" />
              <rect x="11" y="5.5" width="3.5" height="3.5" rx="0.8" fill="white" opacity="0.65" />
              <rect x="5.5" y="11" width="3.5" height="3.5" rx="0.8" fill="white" opacity="0.65" />
              <rect x="11" y="11" width="3.5" height="3.5" rx="0.8" fill="white" opacity="0.3" />
            </svg>
            <span className="font-bold text-[#0F172A] text-[13px] tracking-tight">CreatorOS</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-[#2563EB] flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">A</span>
          </div>
        </div>

        {/* Pillar pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {pillars.map(p => (
            <div key={p.name} className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${p.color}18` }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-[9px] font-semibold" style={{ color: p.color }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-[#F1F5F9]">
        {[{ label: 'Ideas', val: '12' }, { label: 'Filming', val: '4' }, { label: 'Posted', val: '27' }].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-[16px] font-bold text-[#0F172A] leading-none">{s.val}</div>
            <div className="text-[9px] text-[#64748B] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Ideas list */}
      <div className="flex-1 px-4 py-3 space-y-2 overflow-hidden">
        <div className="text-[9px] font-semibold text-[#64748B] uppercase tracking-widest mb-2">Pipeline</div>
        {ideas.map((idea, i) => (
          <div key={i} className="flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2">
            <div>
              <p className="text-[10px] font-semibold text-[#0F172A] leading-tight">{idea.title}</p>
              <p className="text-[9px] text-[#64748B] mt-0.5">{idea.pillar}</p>
            </div>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${idea.color}18`, color: idea.color }}>
              {idea.stage}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-around px-4 py-2 border-t border-[#F1F5F9]">
        {[
          { label: 'Home', active: true },
          { label: 'Ideas', active: false },
          { label: 'Calendar', active: false },
          { label: 'AI', active: false },
        ].map(tab => (
          <div key={tab.label} className="flex flex-col items-center gap-0.5">
            <div className={`w-4 h-4 rounded-[4px] ${tab.active ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'}`} />
            <span className={`text-[8px] font-medium ${tab.active ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`}>{tab.label}</span>
          </div>
        ))}
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pb-2">
        <div className="w-16 h-1 bg-[#0F172A] rounded-full opacity-20" />
      </div>
    </div>
  )
}

function PhoneMockup() {
  return (
    <div className="relative w-[240px] h-[490px]">
      {/* Outer shell */}
      <div className="absolute inset-0 rounded-[44px] border-[7px] border-[#1a1615] shadow-[0_30px_80px_rgba(26,22,21,0.30),0_0_0_1px_rgba(26,22,21,0.08)] bg-[#1a1615]">
        {/* Dynamic island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1a1615] rounded-full z-10" />
        {/* Screen */}
        <div className="absolute inset-0 rounded-[38px] overflow-hidden bg-white">
          <MobileAppUI />
        </div>
      </div>
    </div>
  )
}

function WebPreviewMockup() {
  const ideas = [
    { title: 'Morning routine reveal', pillar: 'Lifestyle', stage: 'Scripted', color: '#2563EB' },
    { title: 'POV: first brand deal', pillar: 'Comedy', stage: 'Idea', color: '#EF4444' },
    { title: 'How I batch film 30 vids', pillar: 'Tutorial', stage: 'Filmed', color: '#10B981' },
  ]
  return (
    <div className="w-full max-w-[620px] rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-[0_20px_60px_rgba(26,22,21,0.14)] bg-white">
      {/* Chrome bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="flex gap-1.5">
          {['#EF4444','#F59E0B','#10B981'].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />)}
        </div>
        <div className="flex-1 bg-white border border-[#E2E8F0] rounded-md px-3 py-1 mx-2">
          <span className="text-[10px] text-[#94A3B8]">app.creatorOS.co/dashboard</span>
        </div>
      </div>
      {/* App content */}
      <div className="flex" style={{ height: 280 }}>
        {/* Sidebar */}
        <div className="w-36 bg-[#F8FAFC] border-r border-[#E2E8F0] p-3 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 mb-1">
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <rect width="16" height="16" rx="4" fill="#2563EB" />
              <rect x="4" y="4" width="3" height="3" rx="0.6" fill="white" />
              <rect x="9" y="4" width="3" height="3" rx="0.6" fill="white" opacity="0.65" />
              <rect x="4" y="9" width="3" height="3" rx="0.6" fill="white" opacity="0.65" />
              <rect x="9" y="9" width="3" height="3" rx="0.6" fill="white" opacity="0.3" />
            </svg>
            <span className="text-[10px] font-bold text-[#0F172A]">CreatorOS</span>
          </div>
          {['Dashboard','Pipeline','Calendar','AI Studio'].map((item, i) => (
            <div key={item} className={`text-[10px] px-2 py-1.5 rounded-lg font-medium ${i === 1 ? 'bg-[#2563EB] text-white' : 'text-[#64748B]'}`}>{item}</div>
          ))}
          <div className="mt-auto">
            <div className="text-[8px] font-semibold text-[#64748B] uppercase tracking-widest mb-1.5">Pillars</div>
            {[{ name: 'Lifestyle', color: '#2563EB' }, { name: 'Comedy', color: '#EF4444' }, { name: 'Tutorial', color: '#10B981' }].map(p => (
              <div key={p.name} className="flex items-center gap-1.5 py-0.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-[9px] text-[#0F172A]">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Main */}
        <div className="flex-1 p-4">
          <div className="text-[11px] font-bold text-[#0F172A] mb-3">Your Pipeline</div>
          <div className="grid grid-cols-3 gap-2 h-full">
            {['Idea','Scripted','Filmed'].map((stage, si) => (
              <div key={stage} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2">
                <div className="text-[8px] font-semibold text-[#64748B] uppercase mb-2">{stage}</div>
                <div className="space-y-1.5">
                  {ideas.filter((_,i) => i === si).map((idea, i) => (
                    <div key={i} className="bg-white border border-[#E2E8F0] rounded-lg p-2">
                      <p className="text-[9px] font-semibold text-[#0F172A] leading-tight">{idea.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: idea.color }} />
                        <span className="text-[7px] text-[#64748B]">{idea.pillar}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DevicesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [20, -30])

  const [activeView, setActiveView] = useState<'mobile' | 'web'>('mobile')

  return (
    <section ref={ref} className="py-28 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-8">
        {/* Label + headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...sp, delay: 0.05 }}
          className="mb-16 max-w-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] mb-3">Anywhere you create</p>
          <h2 className="text-[36px] font-bold text-[#0F172A] leading-[1.15] tracking-tight mb-4">
            Seamless across every device
          </h2>
          <p className="text-[17px] text-[#64748B] leading-relaxed">
            Capture an idea on the go, refine it at your desk. CreatorOS stays in sync wherever you are — mobile or desktop.
          </p>
        </motion.div>

        {/* Device display */}
        <motion.div
          initial={{ opacity: 0, rotateX: 10, scale: 0.92 }}
          animate={inView ? { opacity: 1, rotateX: 0, scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 65, damping: 18, delay: 0.15 }}
          style={{ perspective: 1200 }}
        >
          <motion.div style={{ y: parallaxY }} className="relative flex justify-center">
            <AnimatePresence mode="wait">
              {activeView === 'mobile' ? (
                <motion.div
                  key="mobile"
                  initial={{ opacity: 0, x: 30, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.96 }}
                  transition={{ ...sp }}
                >
                  <PhoneMockup />
                </motion.div>
              ) : (
                <motion.div
                  key="web"
                  initial={{ opacity: 0, x: 30, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.96 }}
                  transition={{ ...sp }}
                  className="flex items-center justify-center"
                  style={{ height: 490 }}
                >
                  <WebPreviewMockup />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle pill — overlaid at bottom */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...sp, delay: 0.4 }}
              className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#0F172A] rounded-full p-1 shadow-lg"
            >
              {(['mobile', 'web'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className="relative px-5 py-2 rounded-full text-[13px] font-semibold transition-colors duration-150"
                  style={{ color: activeView === view ? '#0F172A' : '#94A3B8' }}
                >
                  {activeView === view && (
                    <motion.div
                      layoutId="device-toggle"
                      className="absolute inset-0 bg-white rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 capitalize">{view}</span>
                </button>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Testimonials section ─────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "I went from posting randomly to having a full month planned out in a weekend. CreatorOS is the system I didn't know I needed.",
    name: "Jasmine Cole",
    handle: "@jasminecreates",
    role: "Lifestyle creator",
    color: "#2563EB",
  },
  {
    quote: "The pipeline feature is a game changer. I can see exactly where every idea is — no more losing concepts in my notes app.",
    name: "Marcus T.",
    handle: "@marcustok",
    role: "Comedy creator",
    color: "#EF4444",
  },
  {
    quote: "Setting up my content pillars made me realize I had no real strategy. Now every video has a purpose and a place.",
    name: "Priya Nair",
    handle: "@priyacooks",
    role: "Food & tutorial creator",
    color: "#10B981",
  },
  {
    quote: "I posted 3× more consistently in my first month using this. The visual calendar keeps me accountable.",
    name: "Devon Reyes",
    handle: "@devonbeats",
    role: "Music creator",
    color: "#F59E0B",
  },
  {
    quote: "Finally a tool built for creators, not project managers. It's intuitive, fast, and actually fun to use.",
    name: "Aisha M.",
    handle: "@aishavibes",
    role: "Fashion creator",
    color: "#8B5CF6",
  },
  {
    quote: "The shot list builder alone is worth it. I show up to film knowing exactly what I need — zero wasted sessions.",
    name: "Tyler Brooks",
    handle: "@tylerbrolls",
    role: "Travel creator",
    color: "#EC4899",
  },
  {
    quote: "I used to forget half my ideas before scripting them. Now I capture everything in seconds and it's right there waiting.",
    name: "Sofia R.",
    handle: "@sofiamakes",
    role: "DIY creator",
    color: "#06B6D4",
  },
  {
    quote: "The pillar system helped me niche down without feeling boxed in. My engagement doubled within six weeks.",
    name: "Kofi A.",
    handle: "@kofiandco",
    role: "Fitness creator",
    color: "#10B981",
  },
]

function TestimonialCard({ quote, name, role, color }: typeof TESTIMONIALS[0]) {
  return (
    <div className="flex-shrink-0 w-[300px] bg-[#231f1e] border border-[#2e2a29] rounded-2xl p-5 mx-3 flex flex-col">
      <svg width="18" height="13" viewBox="0 0 20 14" fill="none" className="mb-3 flex-shrink-0" style={{ opacity: 0.3 }}>
        <path d="M0 14V8.4C0 5.6.8 3.4 2.4 1.8 4 .6 6 0 8.4 0L9 1.4C7.4 1.8 6.2 2.6 5.4 3.8 4.6 4.6 4.2 5.6 4.2 6.8H8.4V14H0ZM11.6 14V8.4C11.6 5.6 12.4 3.4 14 1.8 15.6.6 17.6 0 20 0L20.6 1.4C19 1.8 17.8 2.6 17 3.8 16.2 4.6 15.8 5.6 15.8 6.8H20V14H11.6Z" fill="white" />
      </svg>
      <p className="text-[#b8b3af] text-[13.5px] leading-relaxed flex-1 mb-4">{quote}</p>
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {name[0]}
        </div>
        <div>
          <p className="text-white text-[12px] font-semibold leading-tight">{name}</p>
          <p className="text-[#5a5450] text-[11px] mt-0.5">{role}</p>
        </div>
      </div>
    </div>
  )
}

function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })

  const row1 = TESTIMONIALS.slice(0, 4)
  const row2 = TESTIMONIALS.slice(4)

  return (
    <section ref={ref} className="py-28 bg-[#1a1615] overflow-hidden">
      <style>{`
        @keyframes marqueeL { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes marqueeR { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        .marquee-l { animation: marqueeL 30s linear infinite; }
        .marquee-r { animation: marqueeR 36s linear infinite; }
      `}</style>

      <div className="max-w-5xl mx-auto px-8 mb-16">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...sp, delay: 0.05 }}
          className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] mb-3"
        >
          Creators love it
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...sp, delay: 0.12 }}
          className="text-[36px] font-bold text-white leading-[1.15] tracking-tight max-w-xl"
        >
          Built for creators who are serious about growing
        </motion.h2>
      </div>

      {/* Row 1 — scrolls left */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...sp, delay: 0.2 }}
        className="mb-4"
        style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
      >
        <div className="flex marquee-l" style={{ width: 'max-content' }}>
          {[...row1, ...row1].map((t, i) => <TestimonialCard key={i} {...t} />)}
        </div>
      </motion.div>

      {/* Row 2 — scrolls right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...sp, delay: 0.3 }}
        style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
      >
        <div className="flex marquee-r" style={{ width: 'max-content' }}>
          {[...row2, ...row2].map((t, i) => <TestimonialCard key={i} {...t} />)}
        </div>
      </motion.div>
    </section>
  )
}

// ─── Problem section ──────────────────────────────────────────────────────────

const PROBLEMS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    headline: 'Ideas disappear.',
    body: 'A great concept hits in the shower — gone by the time you sit down to create.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    headline: 'No system to stay consistent.',
    body: 'You post when inspiration strikes, then go quiet for two weeks. Growth needs a system.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    headline: 'Content feels scattered.',
    body: 'Notes in your phone, ideas in your head, drafts in a folder. Nothing connects.',
  },
]

function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })

  return (
    <section className="relative py-24 px-6 z-10" style={{ backgroundColor: C.cream }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-14">
          <p className="text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.muted }}>
            Sound familiar?
          </p>
          <h2
            className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.025em] max-w-xl mx-auto"
            style={{ color: C.dark }}
          >
            Every creator faces the same struggle.
          </h2>
        </Reveal>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROBLEMS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
              transition={{ ...bouncy, delay: i * 0.12 }}
              className="rounded-2xl p-7"
              style={{ backgroundColor: C.white, border: `1px solid ${C.border}` }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: C.creamWarm, color: C.darkMid }}
              >
                {p.icon}
              </div>
              <h3 className="text-[17px] font-bold mb-2 tracking-[-0.01em]" style={{ color: C.dark }}>
                {p.headline}
              </h3>
              <p className="text-[15px] leading-relaxed" style={{ color: C.muted }}>
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Feature mockups ──────────────────────────────────────────────────────────

function PipelineMockup() {
  const cols = [
    { label: 'Idea', color: C.blueAccent, cards: 2 },
    { label: 'Scripted', color: '#0ea158', cards: 1 },
    { label: 'Filmed', color: '#cf8d13', cards: 0 },
    { label: 'Posted', color: C.darkMid, cards: 1 },
  ]
  const cardColors = [C.blueAccent, '#c9502e', '#0ea158', '#453f3d']
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: C.white, border: `1px solid ${C.border}` }}>
      <div className="grid grid-cols-4 gap-2">
        {cols.map((col, ci) => (
          <div key={col.label} className="rounded-xl p-2.5" style={{ backgroundColor: C.cream }}>
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.color }} />
              <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                {col.label}
              </span>
            </div>
            {Array.from({ length: col.cards }, (_, i) => (
              <div
                key={i}
                className="rounded-lg p-2 mb-1.5 border-l-2"
                style={{ backgroundColor: C.white, borderColor: cardColors[(ci + i) % cardColors.length] }}
              >
                <div className="h-1.5 rounded mb-1 w-3/4" style={{ backgroundColor: `${C.dark}18` }} />
                <div className="h-1 rounded w-1/2" style={{ backgroundColor: `${C.dark}0c` }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function PillarsMockup() {
  const pillars = [
    { name: 'Fitness Tips', color: C.blueAccent },
    { name: 'Mindset', color: '#c9502e' },
    { name: 'Nutrition', color: '#0ea158' },
    { name: 'Lifestyle', color: '#cf8d13' },
    { name: 'Tutorials', color: C.darkMid },
    { name: 'Behind the scenes', color: '#614a44' },
  ]
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: C.white, border: `1px solid ${C.border}` }}>
      <div className="grid grid-cols-2 gap-2">
        {pillars.map(p => (
          <div
            key={p.name}
            className="flex items-center gap-2.5 rounded-xl p-3"
            style={{ backgroundColor: C.creamAlt }}
          >
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-[11px] font-medium" style={{ color: C.dark }}>{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ShotListMockup() {
  const shots = [
    { text: 'Opening wide shot', done: true },
    { text: 'Close-up product detail', done: true },
    { text: 'B-roll transition', done: false },
    { text: 'Talking head interview', done: false },
    { text: 'Outro with CTA', done: false },
  ]
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: C.white, border: `1px solid ${C.border}` }}>
      <div className="space-y-2.5">
        {shots.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
              style={{
                backgroundColor: s.done ? C.blueAccent : 'transparent',
                borderColor: s.done ? C.blueAccent : C.border,
              }}
            >
              {s.done && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span
              className="text-[12px]"
              style={{
                color: s.done ? C.border : C.dark,
                textDecoration: s.done ? 'line-through' : 'none',
              }}
            >
              {s.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CalendarMockup() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const highlighted = new Set([3, 7, 10, 15, 17, 21, 24, 28])
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: C.white, border: `1px solid ${C.border}` }}>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((d, i) => (
          <div key={i} className="text-[9px] font-semibold pb-1.5" style={{ color: C.muted }}>{d}</div>
        ))}
        {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
          <div
            key={day}
            className="text-[10px] rounded-md py-1 leading-none font-medium"
            style={{
              backgroundColor: highlighted.has(day) ? C.blueAccent : 'transparent',
              color: highlighted.has(day) ? C.white : C.muted,
            }}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Features section ─────────────────────────────────────────────────────────

const FEATURES = [
  {
    badge: 'Pipeline',
    headline: 'From idea to posted without losing momentum.',
    body: 'A four-stage kanban board — Idea, Scripted, Filmed, Posted — so every piece of content has a home and a next step.',
    mockup: <PipelineMockup />,
  },
  {
    badge: 'Content Pillars',
    headline: 'Build a brand, not just a random feed.',
    body: 'Organize every video idea under themed content pillars. Stay focused, stay consistent, and build an audience that knows what to expect.',
    mockup: <PillarsMockup />,
  },
  {
    badge: 'Shot List Builder',
    headline: 'Show up to every shoot prepared.',
    body: 'Build a detailed shot list before you hit record. No more blank staring at the camera wondering what comes next.',
    mockup: <ShotListMockup />,
  },
  {
    badge: 'Content Calendar',
    headline: 'See your whole month at a glance.',
    body: 'Schedule your content and see exactly when each video goes out. Color-coded by pillar, so you can spot gaps instantly.',
    mockup: <CalendarMockup />,
  },
]

function FeatureBlock({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })
  const isEven = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ ...sp, delay: 0.08 }}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
        isEven ? '' : 'lg:grid-flow-col-dense'
      }`}
    >
      <div className={isEven ? '' : 'lg:col-start-2'}>
        <span
          className="text-[11px] font-bold uppercase tracking-widest mb-3 block"
          style={{ color: C.muted }}
        >
          {feature.badge}
        </span>
        <h3
          className="text-[clamp(22px,3vw,32px)] font-bold tracking-[-0.02em] mb-4 leading-tight"
          style={{ color: C.dark }}
        >
          {feature.headline}
        </h3>
        <p className="text-[16px] leading-relaxed" style={{ color: C.muted }}>
          {feature.body}
        </p>
      </div>
      <div className={isEven ? '' : 'lg:col-start-1 lg:row-start-1'}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 18 }}
          animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ ...sp, delay: 0.16 }}
        >
          {feature.mockup}
        </motion.div>
      </div>
    </motion.div>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-6 z-10" style={{ backgroundColor: C.white }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-20">
          <p
            className="text-[12px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: C.muted }}
          >
            Features
          </p>
          <h2
            className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.025em] max-w-2xl mx-auto"
            style={{ color: C.dark }}
          >
            Everything you need to create intentionally.
          </h2>
        </Reveal>
        <div className="space-y-28">
          {FEATURES.map((feature, i) => (
            <FeatureBlock key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '01',
    title: 'Capture your idea',
    body: 'Drop any concept into your pipeline the moment it hits you. Never lose an idea again.',
  },
  {
    n: '02',
    title: 'Build your shot list',
    body: 'Break the video into shots before you film. Walk into every shoot with a clear plan.',
  },
  {
    n: '03',
    title: 'Schedule it',
    body: 'Pick a date on your content calendar. See your whole month and fill the gaps.',
  },
  {
    n: '04',
    title: 'Post with confidence',
    body: 'Move your card through the pipeline. Watch your consistency compound over time.',
  },
]

function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })

  return (
    <section id="how-it-works" className="canvas-bg relative py-28 px-6 z-10">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-[12px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.darkMid }}>
            Process
          </p>
          <h2
            className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.025em]"
            style={{ color: C.dark }}
          >
            From idea to posted in four steps.
          </h2>
        </Reveal>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 32, scale: 0.96 }}
              transition={{ ...bouncy, delay: i * 0.1 }}
              className="rounded-2xl p-6"
              style={{ backgroundColor: C.white, border: `1px solid ${C.border}` }}
            >
              <div
                className="text-[30px] font-bold tracking-[-0.04em] mb-4 leading-none"
                style={{ color: C.blueAccent }}
              >
                {step.n}
              </div>
              <h3 className="text-[15px] font-bold mb-2 tracking-[-0.01em]" style={{ color: C.dark }}>
                {step.title}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA section ──────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section id="cta" className="dark-bg relative py-32 px-6 z-10">
      <div className="max-w-2xl mx-auto text-center">
        <Reveal y={24}>
          <p className="text-[12px] font-semibold uppercase tracking-widest mb-4" style={{ color: C.muted }}>
            Get started
          </p>
          <h2
            className="text-[clamp(32px,5vw,56px)] font-bold tracking-[-0.03em] mb-5 leading-tight text-white"
          >
            Ready to start creating?
          </h2>
          <p className="text-[18px] mb-10" style={{ color: C.muted }}>
            Join for free. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <WhiteButton href="/sign-in" size="lg">
              Get started free →
            </WhiteButton>
            <OutlineButton onClick={() => {}} size="lg" onDark>
              Sign in
            </OutlineButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="canvas-bg px-6 pt-10 pb-6">
      <div className="max-w-5xl mx-auto">
        {/* Main card */}
        <div className="bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl px-8 py-8 mb-4">
          <div className="flex flex-col md:flex-row gap-10 md:gap-0 justify-between">
            {/* Brand column */}
            <div className="max-w-[220px]">
              <div className="flex items-center gap-2 mb-3">
                <LogoMark />
                <span className="font-bold text-[#0F172A] text-[16px] tracking-tight">CreatorOS</span>
              </div>
              <p className="text-[13.5px] text-[#64748B] leading-relaxed mb-5">
                The content operating system for creators who are serious about growing.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-16">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-4">Pages</p>
                <ul className="space-y-3">
                  {['Home', 'Features', 'Pricing', 'Blog'].map(item => (
                    <li key={item}>
                      <a href="#" className="text-[14px] text-[#0F172A] hover:text-[#2563EB] transition-colors duration-150">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-4">Information</p>
                <ul className="space-y-3">
                  {['Contact', 'Privacy', 'Terms of use'].map(item => (
                    <li key={item}>
                      <a href="#" className="text-[14px] text-[#0F172A] hover:text-[#2563EB] transition-colors duration-150">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-2">
          <p className="text-[12px] text-[#1a1615]/50">© 2026 CreatorOS</p>
        </div>
      </div>
    </footer>
  )
}

// ─── Root page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const { signOut } = useClerk()

  useEffect(() => {
    if (isLoaded && isSignedIn) signOut()
  }, [isLoaded, isSignedIn]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative">
      <FloatingBackground />
      <Navbar />
      <main>
        <HeroSection />
        <AppPreviewSection />
        <DevicesSection />
        <TestimonialsSection />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
