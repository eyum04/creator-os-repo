'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ─── Design tokens ─────────────────────────────────────────────────────────────

const PILLARS = [
  { id: 'lifestyle', name: 'Lifestyle', color: '#2563EB' },
  { id: 'comedy',    name: 'Comedy',    color: '#10B981' },
  { id: 'tutorials', name: 'Tutorials', color: '#F59E0B' },
]

const STAGES = ['Idea', 'Scripted', 'Filmed', 'Posted'] as const

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#2563EB" />
      <path
        d="M7 22 L13 11 L19 18 L23 13"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="23" cy="13" r="2.2" fill="white" />
    </svg>
  )
}

// ─── Browser Frame ─────────────────────────────────────────────────────────────

function Frame({ dark = false, children }: { dark?: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ backgroundColor: dark ? '#1E293B' : '#FFFFFF' }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.10)]"
      style={{ border: `1px solid ${dark ? '#334155' : '#E2E8F0'}` }}
    >
      {/* Browser chrome */}
      <motion.div
        animate={{ backgroundColor: dark ? '#0F172A' : '#F8F9FA' }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ borderBottom: `1px solid ${dark ? '#334155' : '#E2E8F0'}` }}
      >
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>
        <motion.div
          animate={{
            backgroundColor: dark ? '#1E293B' : '#FFFFFF',
            color: dark ? '#475569' : '#94A3B8',
          }}
          transition={{ duration: 0.6 }}
          className="flex-1 mx-2 rounded px-3 py-0.5 text-[10px] font-mono"
          style={{ border: `1px solid ${dark ? '#334155' : '#E2E8F0'}` }}
        >
          app.creatoros.io/dashboard
        </motion.div>
      </motion.div>
      {children}
    </motion.div>
  )
}

// ─── Shared mini components ────────────────────────────────────────────────────

function MiniSidebar({ dark }: { dark?: boolean }) {
  const navItems = [
    { label: 'Home', active: false },
    { label: 'Ideas Pipeline', active: true },
    { label: 'Pillars', active: false },
    { label: 'Calendar', active: false },
    { label: 'Shot Lists', active: false },
  ]
  return (
    <motion.div
      animate={{ backgroundColor: dark ? '#0F172A' : '#F8F9FA' }}
      transition={{ duration: 0.6 }}
      className="w-[110px] flex-shrink-0 flex flex-col"
      style={{ borderRight: `1px solid ${dark ? '#334155' : '#E2E8F0'}` }}
    >
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-3">
        <Logo size={16} />
        <span className={`font-bold text-[10px] tracking-tight ${dark ? 'text-white' : 'text-[#0F172A]'}`}>
          CreatorOS
        </span>
      </div>
      <nav className="px-2 space-y-0.5">
        {navItems.map(({ label, active }) => (
          <div
            key={label}
            className={`px-2 py-1.5 rounded-lg text-[9px] font-medium truncate transition-all ${
              active
                ? 'bg-[#2563EB] text-white'
                : dark
                ? 'text-[#64748B]'
                : 'text-[#94A3B8]'
            }`}
          >
            {label}
          </div>
        ))}
      </nav>
      <div className="mt-auto px-2 pb-3 space-y-1.5">
        {PILLARS.map(p => (
          <div key={p.id} className="flex items-center gap-1.5 px-2">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
            <span className={`text-[8px] truncate ${dark ? 'text-[#475569]' : 'text-[#94A3B8]'}`}>{p.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function IdeaCard({
  title,
  pillar,
  dark,
  delay = 0,
}: {
  title: string
  pillar: (typeof PILLARS)[number]
  dark?: boolean
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 24, delay }}
      className="rounded-xl p-2.5 mb-2 border-l-[3px]"
      style={{
        backgroundColor: dark ? '#1E293B' : '#FFFFFF',
        border: `1px solid ${dark ? '#334155' : '#E2E8F0'}`,
        borderLeft: `3px solid ${pillar.color}`,
      }}
    >
      <p className={`text-[10px] font-semibold leading-tight ${dark ? 'text-white' : 'text-[#0F172A]'}`}>
        {title}
      </p>
      <div className="flex items-center gap-1 mt-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pillar.color }} />
        <span className={`text-[9px] ${dark ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>{pillar.name}</span>
      </div>
    </motion.div>
  )
}

function KanbanColumn({
  stage,
  isActive,
  dark,
  children,
}: {
  stage: string
  isActive?: boolean
  dark?: boolean
  children?: React.ReactNode
}) {
  const dotColor = stage === 'Idea' ? '#2563EB' : '#CBD5E1'
  return (
    <motion.div
      animate={{ backgroundColor: dark ? '#1E293B' : '#F8F9FA' }}
      transition={{ duration: 0.6 }}
      className="flex-1 rounded-xl p-2.5"
      style={{ border: `1px solid ${dark ? '#334155' : '#E2E8F0'}` }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
        <span className={`text-[10px] font-semibold ${isActive ? 'text-[#2563EB]' : dark ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
          {stage}
        </span>
      </div>
      {children}
    </motion.div>
  )
}

// ─── Step 0 – Welcome illustration ─────────────────────────────────────────────

function WelcomeIllustration() {
  return (
    <Frame>
      <div className="flex" style={{ height: 320 }}>
        <MiniSidebar />
        <div className="flex-1 p-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mb-3"
          >
            <h2 className="text-[13px] font-bold text-[#0F172A] tracking-tight">Ideas Pipeline</h2>
            <p className="text-[10px] text-[#64748B] mt-0.5">All your content, organized.</p>
          </motion.div>
          <div className="grid grid-cols-4 gap-2">
            {STAGES.map((stage, si) => (
              <KanbanColumn key={stage} stage={stage}>
                {si === 0 && (
                  <>
                    <IdeaCard
                      title="Morning Routine Tips"
                      pillar={PILLARS[0]}
                      delay={0.5}
                    />
                    <IdeaCard
                      title="3 Comedy Sketches"
                      pillar={PILLARS[1]}
                      delay={0.75}
                    />
                  </>
                )}
                {si === 1 && (
                  <IdeaCard
                    title="Tutorial: Final Cut"
                    pillar={PILLARS[2]}
                    delay={1.0}
                  />
                )}
                {si === 2 && (
                  <IdeaCard
                    title="Day in My Life"
                    pillar={PILLARS[0]}
                    delay={1.25}
                  />
                )}
              </KanbanColumn>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  )
}

// ─── Step 1 – Ideas Pipeline illustration ─────────────────────────────────────

function PipelineIllustration() {
  const [showModal, setShowModal] = useState(false)
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowModal(true), 1200)
    const t2 = setTimeout(() => setShowModal(false), 2600)
    const t3 = setTimeout(() => setShowCard(true), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <Frame>
      <div className="relative flex" style={{ height: 320 }}>
        <MiniSidebar />
        <div className="flex-1 p-4 overflow-hidden">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-[13px] font-bold text-[#0F172A] tracking-tight">Ideas Pipeline</h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">Track every video from idea to posted.</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#2563EB] rounded-lg text-white text-[10px] font-semibold">
              <span>+ New idea</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {STAGES.map((stage, si) => (
              <KanbanColumn key={stage} stage={stage}>
                {si === 0 && showCard && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="rounded-xl p-2.5 border-l-[3px]"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderLeft: `3px solid ${PILLARS[0].color}`,
                    }}
                  >
                    <p className="text-[10px] font-semibold text-[#0F172A] leading-tight">
                      Morning Routine Tips
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                      <span className="text-[9px] text-[#94A3B8]">Lifestyle</span>
                    </div>
                  </motion.div>
                )}
                {si === 1 && (
                  <IdeaCard title="Tutorial: Final Cut" pillar={PILLARS[2]} delay={0.3} />
                )}
                {si === 2 && (
                  <IdeaCard title="Day in My Life" pillar={PILLARS[0]} delay={0.5} />
                )}
              </KanbanColumn>
            ))}
          </div>
        </div>

        {/* Slide-up modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 flex items-end justify-center"
            >
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="bg-white rounded-t-2xl p-4 w-full shadow-2xl border-t border-[#E2E8F0]"
              >
                <p className="text-[12px] font-bold text-[#0F172A] mb-3">New idea</p>
                <div className="mb-2">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-[#94A3B8] mb-1">Title</p>
                  <div className="px-3 py-2 bg-[#F8F9FA] border border-[#2563EB] rounded-lg text-[11px] text-[#0F172A] font-medium">
                    Morning Routine Tips
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-[#94A3B8] mb-1">Pillar</p>
                  <div className="flex gap-1.5">
                    {PILLARS.map(p => (
                      <div
                        key={p.id}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-medium border"
                        style={{
                          backgroundColor: p.id === 'lifestyle' ? `${p.color}18` : undefined,
                          borderColor: p.id === 'lifestyle' ? p.color : '#E2E8F0',
                          color: p.id === 'lifestyle' ? p.color : '#94A3B8',
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Frame>
  )
}

// ─── Step 2 – Stages illustration ─────────────────────────────────────────────

function StagesIllustration() {
  const [cardStage, setCardStage] = useState(0)

  useEffect(() => {
    const timings = [1000, 2500, 4000]
    const timeouts: ReturnType<typeof setTimeout>[] = []

    timings.forEach((delay, i) => {
      timeouts.push(
        setTimeout(() => setCardStage(i + 1), delay)
      )
    })

    // Reset after "Posted"
    timeouts.push(
      setTimeout(() => setCardStage(0), 5800)
    )

    return () => timeouts.forEach(clearTimeout)
  }, [])

  const STAGE_COLORS: Record<string, string> = {
    Idea:     '#2563EB',
    Scripted: '#8B5CF6',
    Filmed:   '#F59E0B',
    Posted:   '#10B981',
  }

  const stageNames = ['Idea', 'Scripted', 'Filmed', 'Posted']

  return (
    <Frame>
      <div className="flex" style={{ height: 320 }}>
        <MiniSidebar />
        <div className="flex-1 p-4 overflow-hidden">
          <div className="mb-3">
            <h2 className="text-[13px] font-bold text-[#0F172A] tracking-tight">Ideas Pipeline</h2>
            <p className="text-[10px] text-[#64748B] mt-0.5">Move cards as your content progresses.</p>
          </div>

          {/* Stage progress strip */}
          <div className="flex items-center gap-1 mb-3">
            {stageNames.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div
                  className="flex-1 flex items-center justify-center py-1 rounded-lg text-[9px] font-semibold transition-all duration-500"
                  style={{
                    backgroundColor: cardStage >= i ? `${STAGE_COLORS[s]}20` : '#F1F5F9',
                    color: cardStage >= i ? STAGE_COLORS[s] : '#94A3B8',
                    border: `1px solid ${cardStage >= i ? STAGE_COLORS[s] + '40' : '#E2E8F0'}`,
                  }}
                >
                  {s}
                </div>
                {i < stageNames.length - 1 && (
                  <div
                    className="w-2 h-0.5 rounded-full transition-all duration-500"
                    style={{ backgroundColor: cardStage > i ? '#CBD5E1' : '#E2E8F0' }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {stageNames.map((stage, si) => (
              <KanbanColumn key={stage} stage={stage} isActive={cardStage === si}>
                <AnimatePresence mode="wait">
                  {cardStage === si && (
                    <motion.div
                      key={`card-${si}`}
                      initial={{ opacity: 0, x: si === 0 ? 0 : 20, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -20, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                      className="rounded-xl p-2.5"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderLeft: `3px solid ${PILLARS[0].color}`,
                      }}
                    >
                      <p className="text-[10px] font-semibold text-[#0F172A] leading-tight">
                        Morning Routine Tips
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                        <span className="text-[9px] text-[#94A3B8]">Lifestyle</span>
                      </div>
                      <div
                        className="mt-1.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full inline-block"
                        style={{
                          backgroundColor: `${STAGE_COLORS[stage]}18`,
                          color: STAGE_COLORS[stage],
                        }}
                      >
                        {stage}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </KanbanColumn>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[9px] text-[#64748B]">
              {cardStage === 3 ? '1 video posted this week!' : `In progress — stage ${cardStage + 1}/4`}
            </span>
          </div>
        </div>
      </div>
    </Frame>
  )
}

// ─── Step 3 – Calendar illustration ────────────────────────────────────────────

function CalendarIllustration() {
  const [showDot, setShowDot] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowDot(true), 1000)
    const t2 = setTimeout(() => setShowTooltip(true), 1500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  // April 2026 starts on Wednesday (index 3)
  const startDay = 3
  const totalDays = 30
  const cells: (number | null)[] = Array(startDay).fill(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)

  return (
    <Frame>
      <div className="flex" style={{ height: 320 }}>
        <MiniSidebar />
        <div className="flex-1 p-4 overflow-hidden">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-[13px] font-bold text-[#0F172A] tracking-tight">Calendar</h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">April 2026</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-[#64748B]">‹</div>
              <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-[#64748B]">›</div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {days.map(d => (
              <div key={d} className="text-center text-[8px] font-semibold text-[#94A3B8] py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              const isTarget = day === 21
              return (
                <div key={i} className="relative">
                  <motion.div
                    animate={
                      isTarget && showDot
                        ? { backgroundColor: '#EFF6FF', borderColor: '#2563EB' }
                        : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }
                    }
                    transition={{ duration: 0.4 }}
                    className="aspect-square flex flex-col items-center justify-center rounded-lg border text-[9px] font-medium cursor-pointer"
                    style={{ color: day ? '#0F172A' : 'transparent' }}
                  >
                    <span style={{ color: isTarget && showDot ? '#2563EB' : '#0F172A' }}>
                      {day ?? ''}
                    </span>
                    {isTarget && showDot && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-0.5"
                      />
                    )}
                  </motion.div>

                  {/* Tooltip */}
                  {isTarget && (
                    <AnimatePresence>
                      {showTooltip && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                          className="absolute z-10 left-1/2 -translate-x-1/2 top-full mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-xl px-2.5 py-2 w-32"
                        >
                          <p className="text-[9px] font-bold text-[#0F172A] leading-tight">
                            Morning Routine Tips
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                            <span className="text-[8px] text-[#64748B]">Lifestyle</span>
                          </div>
                          <p className="text-[8px] text-[#94A3B8] mt-0.5">Apr 21, 2026</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Frame>
  )
}

// ─── Step 4 – Shot List illustration ──────────────────────────────────────────

function ShotListIllustration() {
  const shots = [
    'Wide establishing shot — desk setup',
    'Close-up: morning journal routine',
    'Face-to-camera: main talking points',
  ]

  const [visibleShots, setVisibleShots] = useState<number[]>([])
  const [checked, setChecked] = useState<number[]>([])

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []

    shots.forEach((_, i) => {
      timeouts.push(setTimeout(() => setVisibleShots(prev => [...prev, i]), 600 + i * 700))
    })

    // Check third shot
    timeouts.push(setTimeout(() => setChecked([2]), 600 + 3 * 700 + 400))

    // Reset loop
    timeouts.push(
      setTimeout(() => {
        setVisibleShots([])
        setChecked([])
      }, 600 + 3 * 700 + 400 + 2200)
    )

    return () => timeouts.forEach(clearTimeout)
  }, [])

  return (
    <Frame>
      <div className="flex" style={{ height: 320 }}>
        <MiniSidebar />
        <div className="flex-1 p-4 overflow-hidden">
          <div className="mb-3">
            <h2 className="text-[13px] font-bold text-[#0F172A] tracking-tight">Shot List</h2>
            <p className="text-[10px] text-[#64748B] mt-0.5">Morning Routine Tips · Lifestyle</p>
          </div>

          {/* Idea card */}
          <div
            className="rounded-xl p-3 mb-3 border-l-[3px]"
            style={{
              backgroundColor: '#F8F9FA',
              border: '1px solid #E2E8F0',
              borderLeft: `3px solid ${PILLARS[0].color}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-[#0F172A]">Morning Routine Tips</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  <span className="text-[9px] text-[#94A3B8]">Lifestyle · Idea stage</span>
                </div>
              </div>
              <span className="text-[9px] font-medium px-2 py-0.5 bg-[#EFF6FF] text-[#2563EB] rounded-full border border-[#BFDBFE]">
                {visibleShots.length}/{shots.length} shots
              </span>
            </div>
          </div>

          {/* Shot items */}
          <div className="space-y-2">
            <AnimatePresence>
              {shots.map((shot, i) =>
                visibleShots.includes(i) ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl border"
                    style={{
                      backgroundColor: checked.includes(i) ? '#F0FDF4' : '#FFFFFF',
                      borderColor: checked.includes(i) ? '#BBF7D0' : '#E2E8F0',
                    }}
                  >
                    <motion.div
                      animate={
                        checked.includes(i)
                          ? { backgroundColor: '#10B981', borderColor: '#10B981' }
                          : { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1' }
                      }
                      transition={{ duration: 0.3 }}
                      className="w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                    >
                      {checked.includes(i) && (
                        <motion.svg
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-2.5 h-2.5"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <path
                            d="M2 5l2.5 2.5L8 3"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      )}
                    </motion.div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-[#CBD5E1]">{String(i + 1).padStart(2, '0')}</span>
                      <p
                        className="text-[10px] font-medium leading-tight"
                        style={{ color: checked.includes(i) ? '#64748B' : '#0F172A' }}
                      >
                        {shot}
                      </p>
                    </div>
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Frame>
  )
}

// ─── Step 5 – Settings illustration ───────────────────────────────────────────

function SettingsIllustration() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setDark(true), 1500)
    const t2 = setTimeout(() => setDark(false), 4500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <Frame dark={dark}>
      <motion.div
        animate={{ backgroundColor: dark ? '#0F172A' : '#F8F9FA' }}
        transition={{ duration: 0.6 }}
        style={{ height: 320 }}
        className="flex"
      >
        <MiniSidebar dark={dark} />
        <div className="flex-1 p-4 overflow-hidden">
          {/* Header */}
          <motion.div animate={{ opacity: 1 }} className="mb-3">
            <motion.h2
              animate={{ color: dark ? '#F8FAFC' : '#0F172A' }}
              transition={{ duration: 0.6 }}
              className="text-[13px] font-bold tracking-tight"
            >
              Settings
            </motion.h2>
            <motion.p
              animate={{ color: dark ? '#64748B' : '#94A3B8' }}
              transition={{ duration: 0.6 }}
              className="text-[10px] mt-0.5"
            >
              Manage your account and preferences.
            </motion.p>
          </motion.div>

          {/* Profile card */}
          <motion.div
            animate={{
              backgroundColor: dark ? '#1E293B' : '#FFFFFF',
              borderColor: dark ? '#334155' : '#E2E8F0',
            }}
            transition={{ duration: 0.6 }}
            className="rounded-xl border p-3 mb-2"
          >
            <motion.p
              animate={{ color: dark ? '#64748B' : '#94A3B8' }}
              transition={{ duration: 0.6 }}
              className="text-[8px] font-semibold uppercase tracking-widest mb-2"
            >
              Profile
            </motion.p>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[12px] font-bold">E</span>
              </div>
              <div>
                <motion.p
                  animate={{ color: dark ? '#F8FAFC' : '#0F172A' }}
                  transition={{ duration: 0.6 }}
                  className="text-[10px] font-semibold"
                >
                  Eyoel
                </motion.p>
                <motion.p
                  animate={{ color: dark ? '#475569' : '#94A3B8' }}
                  transition={{ duration: 0.6 }}
                  className="text-[9px]"
                >
                  eyum2024@gmail.com
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Appearance card */}
          <motion.div
            animate={{
              backgroundColor: dark ? '#1E293B' : '#FFFFFF',
              borderColor: dark ? '#334155' : '#E2E8F0',
            }}
            transition={{ duration: 0.6 }}
            className="rounded-xl border p-3"
          >
            <motion.p
              animate={{ color: dark ? '#64748B' : '#94A3B8' }}
              transition={{ duration: 0.6 }}
              className="text-[8px] font-semibold uppercase tracking-widest mb-2"
            >
              Appearance
            </motion.p>
            <div className="flex gap-2">
              {/* Light button */}
              <motion.div
                animate={
                  !dark
                    ? { backgroundColor: '#2563EB', borderColor: '#2563EB', color: '#FFFFFF' }
                    : { backgroundColor: dark ? '#334155' : '#F8F9FA', borderColor: dark ? '#475569' : '#E2E8F0', color: dark ? '#94A3B8' : '#64748B' }
                }
                transition={{ duration: 0.4 }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium cursor-pointer"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                Light
              </motion.div>
              {/* Dark button */}
              <motion.div
                animate={
                  dark
                    ? { backgroundColor: '#2563EB', borderColor: '#2563EB', color: '#FFFFFF' }
                    : { backgroundColor: '#F8F9FA', borderColor: '#E2E8F0', color: '#64748B' }
                }
                transition={{ duration: 0.4 }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium cursor-pointer"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                Dark
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Frame>
  )
}

// ─── Step 6 – Ready illustration ──────────────────────────────────────────────

function ReadyIllustration() {
  const features = [
    { label: 'Pipeline', color: '#2563EB', icon: '▤' },
    { label: 'Calendar', color: '#10B981', icon: '▦' },
    { label: 'Shot Lists', color: '#F59E0B', icon: '☰' },
    { label: 'Settings', color: '#8B5CF6', icon: '⚙' },
  ]

  return (
    <Frame>
      <div className="flex" style={{ height: 320 }}>
        <MiniSidebar />
        <div className="flex-1 p-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-3"
          >
            <h2 className="text-[13px] font-bold text-[#0F172A] tracking-tight">Your workspace</h2>
            <p className="text-[10px] text-[#64748B] mt-0.5">Everything in one place.</p>
          </motion.div>

          {/* Top row: pipeline + calendar */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Pipeline mini */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 22 }}
              className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl p-2.5"
            >
              <p className="text-[9px] font-bold text-[#2563EB] mb-1.5">Ideas Pipeline</p>
              <div className="grid grid-cols-4 gap-1">
                {STAGES.map((s, i) => (
                  <div
                    key={s}
                    className="rounded-md p-1 flex flex-col gap-0.5"
                    style={{ backgroundColor: i === 0 ? '#EFF6FF' : '#F1F5F9' }}
                  >
                    <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: i === 0 ? '#2563EB' : '#CBD5E1' }} />
                    <p className="text-[7px] text-center" style={{ color: i === 0 ? '#2563EB' : '#94A3B8' }}>{s}</p>
                  </div>
                ))}
              </div>
              <div className="mt-1.5 h-3 rounded border-l-2 border-l-[#2563EB] bg-white border border-[#E2E8F0] px-1 flex items-center">
                <p className="text-[7px] text-[#64748B] truncate">Morning Routine Tips</p>
              </div>
            </motion.div>

            {/* Calendar mini */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 22 }}
              className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl p-2.5"
            >
              <p className="text-[9px] font-bold text-[#10B981] mb-1.5">Calendar</p>
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: 28 }, (_, i) => {
                  const day = i + 1
                  const hasEvent = [7, 14, 21, 28].includes(day)
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded flex items-center justify-center text-[6px]"
                      style={{
                        backgroundColor: hasEvent ? '#EFF6FF' : 'transparent',
                        color: hasEvent ? '#2563EB' : '#94A3B8',
                        fontWeight: hasEvent ? 700 : 400,
                      }}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Bottom row: shot list + settings */}
          <div className="grid grid-cols-2 gap-2">
            {/* Shot list mini */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65, type: 'spring', stiffness: 200, damping: 22 }}
              className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl p-2.5"
            >
              <p className="text-[9px] font-bold text-[#F59E0B] mb-1.5">Shot List</p>
              {[
                { text: 'Wide establishing shot', done: true },
                { text: 'Close-up journal routine', done: true },
                { text: 'Face-to-camera talking', done: false },
              ].map((shot, i) => (
                <div key={i} className="flex items-center gap-1.5 mb-1">
                  <div
                    className="w-2.5 h-2.5 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: shot.done ? '#10B981' : 'transparent', border: `1.5px solid ${shot.done ? '#10B981' : '#CBD5E1'}` }}
                  >
                    {shot.done && (
                      <svg viewBox="0 0 8 8" fill="none" className="w-1.5 h-1.5">
                        <path d="M1.5 4l1.5 1.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-[8px] leading-tight ${shot.done ? 'text-[#94A3B8] line-through' : 'text-[#64748B]'}`}>
                    {shot.text}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Settings mini */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 22 }}
              className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl p-2.5"
            >
              <p className="text-[9px] font-bold text-[#8B5CF6] mb-1.5">Settings</p>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-5 h-5 rounded-full bg-[#2563EB] flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">E</span>
                </div>
                <div>
                  <p className="text-[8px] font-semibold text-[#0F172A]">Eyoel</p>
                  <p className="text-[7px] text-[#94A3B8]">eyum2024@gmail.com</p>
                </div>
              </div>
              <div className="flex gap-1">
                <div className="flex items-center gap-0.5 px-1.5 py-1 rounded bg-[#2563EB] text-white text-[8px] font-medium">
                  ☀ Light
                </div>
                <div className="flex items-center gap-0.5 px-1.5 py-1 rounded border border-[#E2E8F0] text-[#64748B] text-[8px] font-medium">
                  ☽ Dark
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Frame>
  )
}

// ─── Step config ──────────────────────────────────────────────────────────────

type StepConfig = {
  label: string
  headline: string[]
  sub: string
  bullets?: string[]
  illustration: React.ComponentType
}

const STEPS: StepConfig[] = [
  {
    label: '00 / 07 — Welcome',
    headline: ['See CreatorOS', 'in action'],
    sub: 'A quick tour of the features that\'ll transform your content workflow.',
    illustration: WelcomeIllustration,
  },
  {
    label: '01 / 07 — Pipeline',
    headline: ['Capture every', 'content idea'],
    sub: 'Got an idea? Add it in seconds. Every video starts in your pipeline at the Idea stage.',
    bullets: ['Add ideas instantly', 'Assign to a content pillar', 'See your whole pipeline'],
    illustration: PipelineIllustration,
  },
  {
    label: '02 / 07 — Stages',
    headline: ['Track your', 'content journey'],
    sub: 'Move cards through 4 stages as you work. From concept to fully posted.',
    bullets: [
      'Idea → Scripted → Filmed → Posted',
      'Visual progress tracker',
      'Never lose track of a video',
    ],
    illustration: StagesIllustration,
  },
  {
    label: '03 / 07 — Calendar',
    headline: ['Schedule', 'your posts'],
    sub: 'Set a posting date on any idea — it shows up on your content calendar, color-coded by pillar.',
    bullets: [
      'Monthly calendar view',
      'Color-coded by pillar',
      'Spot gaps in your schedule',
    ],
    illustration: CalendarIllustration,
  },
  {
    label: '04 / 07 — Shot Lists',
    headline: ['Plan every', 'frame'],
    sub: 'Break down your video into individual shots. Add them, check them off as you film.',
    bullets: [
      'Shot-by-shot planning',
      'Check off on location',
      'Never miss a key shot',
    ],
    illustration: ShotListIllustration,
  },
  {
    label: '05 / 07 — Settings',
    headline: ['Make it', 'yours'],
    sub: 'Switch between light and dark mode. Update your creator name and manage your account.',
    bullets: [
      'Light & dark mode',
      'Custom creator name',
      'Full account control',
    ],
    illustration: SettingsIllustration,
  },
  {
    label: '06 / 07 — Ready',
    headline: ['You\'re ready', 'to create!'],
    sub: 'Everything you need to go from idea to posted video, organized in one place.',
    illustration: ReadyIllustration,
  },
]

const FEATURE_ICONS = [
  { label: 'Pipeline', color: '#2563EB' },
  { label: 'Calendar', color: '#10B981' },
  { label: 'Shot Lists', color: '#F59E0B' },
  { label: 'Settings', color: '#8B5CF6' },
]

// ─── Slide transition variants ─────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 48 : -48,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -48 : 48,
  }),
}

const slideTransition = {
  duration: 0.32,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [step, setStep] = useState(0)
  const prevStepRef = useRef(0)
  const directionRef = useRef(1)

  const goTo = (next: number) => {
    if (next < 0 || next >= STEPS.length) return
    directionRef.current = next > step ? 1 : -1
    prevStepRef.current = step
    setStep(next)
  }

  const current = STEPS[step]
  const Illustration = current.illustration
  const isFirst = step === 0
  const isLast = step === STEPS.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] to-white flex flex-col">

      {/* ─── Fixed header ─────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo + name */}
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="font-bold text-[#0F172A] text-[16px] tracking-tight">CreatorOS</span>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] ml-1">
              Interactive Demo
            </span>
          </div>
          {/* Exit */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors duration-150"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Exit Tour
          </Link>
        </div>
      </header>

      {/* ─── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col pt-14">
        <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 lg:py-16 flex items-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-[40%_60%] gap-12 lg:gap-16 items-center">

            {/* ── Left column ──────────────────────────────────────────────── */}
            <AnimatePresence mode="wait" custom={directionRef.current}>
              <motion.div
                key={`left-${step}`}
                custom={directionRef.current}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="flex flex-col justify-center"
              >
                {/* Step label */}
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.3 }}
                  className="text-[12px] font-bold tracking-widest uppercase text-[#2563EB] mb-4"
                >
                  {current.label}
                </motion.p>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14, duration: 0.35 }}
                  className="font-bold text-[#0F172A] tracking-tight leading-[1.1] mb-4"
                  style={{ fontSize: 'clamp(36px, 4vw, 52px)' }}
                >
                  {current.headline[0]}
                  <br />
                  {current.headline[1]}
                </motion.h1>

                {/* Sub */}
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.35 }}
                  className="text-[16px] leading-relaxed text-[#64748B] mb-6"
                >
                  {current.sub}
                </motion.p>

                {/* Bullets or feature icons (last step) */}
                {isLast ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26, duration: 0.35 }}
                    className="flex gap-3 mb-8 flex-wrap"
                  >
                    {FEATURE_ICONS.map(({ label, color }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.3 + i * 0.08,
                          type: 'spring',
                          stiffness: 260,
                          damping: 22,
                        }}
                        className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border border-[#E2E8F0] bg-white"
                        style={{ minWidth: 72 }}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${color}18` }}
                        >
                          <div className="w-4 h-4 rounded-md" style={{ backgroundColor: color }} />
                        </div>
                        <span className="text-[11px] font-semibold text-[#64748B]">{label}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : current.bullets ? (
                  <motion.ul
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26, duration: 0.35 }}
                    className="space-y-2.5 mb-8"
                  >
                    {current.bullets.map((b, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.07, duration: 0.3 }}
                        className="flex items-center gap-3 text-[15px] text-[#0F172A]"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center flex-shrink-0">
                          <svg className="w-2.5 h-2.5 text-[#2563EB]" viewBox="0 0 10 10" fill="none">
                            <path
                              d="M2 5l2 2 4-4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        {b}
                      </motion.li>
                    ))}
                  </motion.ul>
                ) : (
                  <div className="mb-8" />
                )}

                {/* Navigation */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.34, duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  {/* Back */}
                  {!isFirst && (
                    <button
                      onClick={() => goTo(step - 1)}
                      className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all duration-150 border border-[#E2E8F0]"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Back
                    </button>
                  )}

                  {/* Next / Start / CTA */}
                  {isLast ? (
                    <Link
                      href="/sign-in"
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_4px_14px_rgba(37,99,235,0.4)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.55)] transition-all duration-200"
                    >
                      Start Creating
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  ) : (
                    <button
                      onClick={() => goTo(step + 1)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_4px_14px_rgba(37,99,235,0.4)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.55)] transition-all duration-200"
                    >
                      {isFirst ? 'Start Tour' : 'Continue'}
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* ── Right column (illustration) ──────────────────────────────── */}
            <AnimatePresence mode="wait" custom={directionRef.current}>
              <motion.div
                key={`right-${step}`}
                custom={directionRef.current}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ ...slideTransition, delay: 0.04 }}
                className="w-full"
              >
                <Illustration />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ─── Progress dots ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2.5 pb-10">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to step ${i + 1}`}
              className="transition-all duration-300"
            >
              <motion.div
                animate={{
                  width: i === step ? 24 : 8,
                  backgroundColor: i === step ? '#2563EB' : i < step ? '#BFDBFE' : '#E2E8F0',
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="h-2 rounded-full"
              />
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
