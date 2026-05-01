'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSupabaseClient } from '@/lib/supabase'
import { useAppContext } from './_context'
import { PillarBadge } from '@/components/ui/PillarBadge'
import { StageBadge } from '@/components/ui/StageBadge'
import { STAGE_COLORS, TROPHY_CONFIG, type IdeaWithPillar, type TrophyLevel } from '@/lib/types'
import { computeTrophy, type TrophyResult } from '@/lib/trophy'
import { LevelUpModal } from '@/components/modals/LevelUpModal'

const NEXT_TIER: Record<TrophyLevel, TrophyLevel | null> = {
  Bronze: 'Silver', Silver: 'Gold', Gold: 'Legend', Legend: null,
}

// iOS-style expo-out — fast start, buttery deceleration, zero spring overhead
const ease = [0.16, 1, 0.3, 1] as const

// Above-fold: tight stagger on mount
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.055, delayChildren: 0.02 } } }
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } } }

// Below-fold: scroll-triggered reveal (spread onto motion.div)
const scrollReveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, ease },
} as const

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonBox({ className = '' }: { className?: string }) {
  return <div className={`bg-[#E2E8F0] dark:bg-[#334155] rounded-2xl animate-pulse ${className}`} />
}

function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
      <div className="space-y-2.5 mb-8">
        <SkeletonBox className="h-9 w-52 rounded-xl" />
        <SkeletonBox className="h-5 w-64 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => <SkeletonBox key={i} className="h-24" />)}
      </div>
      <SkeletonBox className="h-28" />
      <SkeletonBox className="h-72" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonBox className="h-20" />
        <SkeletonBox className="h-20" />
      </div>
      <SkeletonBox className="h-48" />
    </div>
  )
}

// ─── Trophy card ──────────────────────────────────────────────────────────────

function TrophyCard({ result }: { result: TrophyResult }) {
  const cfg = result.level ? TROPHY_CONFIG[result.level] : null
  const nextTier = result.level ? NEXT_TIER[result.level] : 'Bronze'
  const targetPerWeek = nextTier ? TROPHY_CONFIG[nextTier].minPostsPerWeek : (cfg?.minPostsPerWeek ?? 1)
  const progress = Math.min(result.postsThisWeek / targetPerWeek, 1)

  return (
    <div className="flex items-center gap-5">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
        style={{ background: cfg ? cfg.glowColor : '#F1F5F9' }}
      >
        {cfg ? cfg.emoji : '🏅'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-bold text-[15px] text-[#0F172A]" style={cfg ? { color: cfg.color } : {}}>
            {cfg ? cfg.label : 'No trophy yet'}
          </p>
          {result.streakWeeks > 0 && (
            <span className="text-[12px] font-semibold text-[#64748B]">{result.streakWeeks} week streak 🔥</span>
          )}
        </div>
        <p className="text-[12px] text-[#94A3B8] mb-2">
          {result.postsThisWeek}/{targetPerWeek} posts this week
          {nextTier ? ` → toward ${nextTier}` : ' — maintain your streak'}
        </p>
        <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${progress * 100}%`, background: cfg ? cfg.color : '#2563EB' }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Mini calendar ────────────────────────────────────────────────────────────

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function parseLocalDate(str: string) {
  const [y, m, d] = str.substring(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

function MiniCalendar({ ideas }: { ideas: IdeaWithPillar[] }) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const ideasForDay = (day: number) =>
    ideas.filter(idea => {
      if (!idea.scheduled_date) return false
      const d = parseLocalDate(idea.scheduled_date)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">Content Calendar</p>
          <p className="text-[13px] font-semibold text-[#0F172A] mt-0.5">{MONTHS[month]} {year}</p>
        </div>
        <Link href="/dashboard/calendar" className="text-[12px] text-[#2563EB] font-medium hover:text-[#1D4ED8] transition-colors duration-150">
          Full calendar →
        </Link>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map((d, i) => (
          <div key={i} className="text-[10px] font-semibold text-[#94A3B8] text-center py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-[#E2E8F0] rounded-xl overflow-hidden border border-[#E2E8F0]">
        {cells.map((day, i) => {
          const isToday = day === today.getDate()
          const dayIdeas = day ? ideasForDay(day) : []
          return (
            <div key={i} className="bg-white p-1.5 min-h-[44px] flex flex-col">
              {day && (
                <>
                  <span className={[
                    'text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full mx-auto mb-0.5',
                    isToday ? 'bg-[#2563EB] text-white font-bold' : 'text-[#0F172A]',
                  ].join(' ')}>
                    {day}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {dayIdeas.slice(0, 2).map(idea => (
                      <Link
                        key={idea.id}
                        href={`/dashboard/ideas/${idea.id}`}
                        className="block truncate text-[8px] font-semibold px-1 rounded leading-tight py-0.5"
                        style={{
                          backgroundColor: idea.pillar ? `${idea.pillar.color}20` : '#F1F5F9',
                          color: idea.pillar?.color ?? STAGE_COLORS[idea.stage],
                        }}
                        title={idea.title}
                      >
                        {idea.title}
                      </Link>
                    ))}
                    {dayIdeas.length > 2 && (
                      <span className="text-[8px] text-[#94A3B8] pl-1">+{dayIdeas.length - 2}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useUser()
  const { pillars, ideaCount, loadingPillars } = useAppContext()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const pathname = usePathname()

  const [recentIdeas, setRecentIdeas] = useState<IdeaWithPillar[]>([])
  const [calendarIdeas, setCalendarIdeas] = useState<IdeaWithPillar[]>([])
  const [loading, setLoading] = useState(true)
  const [creatorName, setCreatorName] = useState('')
  const [trophyResult, setTrophyResult] = useState<TrophyResult | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpTier, setLevelUpTier] = useState<TrophyLevel | null>(null)

  useEffect(() => {
    if (!loadingPillars && pillars.length === 0 && user) {
      router.push('/onboarding/welcome')
    }
  }, [loadingPillars, pillars.length, user, router])

  // All primary data in one parallel batch — eliminates the 4-query waterfall
  const fetchAllData = useCallback(async () => {
    if (!user || loadingPillars) return

    const [nameRes, trophyRes, ideasRes] = await Promise.all([
      supabase.from('users').select('name').eq('id', user.id).single(),
      supabase.from('ideas').select('posted_at').eq('user_id', user.id).not('posted_at', 'is', null),
      supabase.from('ideas').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    ])

    if (nameRes.data?.name) setCreatorName(nameRes.data.name)

    if (trophyRes.data) {
      const result = computeTrophy(trophyRes.data as { posted_at: string | null }[])
      setTrophyResult(result)
      const lastLevel = localStorage.getItem('creatoros_trophy_level') ?? ''
      if (result.level && result.level !== lastLevel) {
        localStorage.setItem('creatoros_trophy_level', result.level)
        setLevelUpTier(result.level)
        setShowLevelUp(true)
      } else if (!result.level) {
        localStorage.removeItem('creatoros_trophy_level')
      }
    }

    if (ideasRes.data) {
      setRecentIdeas(ideasRes.data.map(idea => ({
        ...idea,
        pillar: pillars.find(p => p.id === idea.pillar_id) ?? null,
      })) as IdeaWithPillar[])
    }

    setLoading(false)
  }, [user, loadingPillars, pillars]) // eslint-disable-line react-hooks/exhaustive-deps

  // Calendar re-fetches on route changes to catch updates from other pages
  const fetchCalendarIdeas = useCallback(async () => {
    if (!user || loadingPillars) return
    const { data } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', user.id)
      .not('scheduled_date', 'is', null)
    if (data) {
      setCalendarIdeas(data.map(idea => ({
        ...idea,
        pillar: pillars.find(p => p.id === idea.pillar_id) ?? null,
      })) as IdeaWithPillar[])
    }
  }, [user, loadingPillars, pillars]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAllData() }, [fetchAllData])
  useEffect(() => { fetchCalendarIdeas() }, [fetchCalendarIdeas, pathname])

  const displayName = creatorName || user?.firstName || ''

  if (loading) return <DashboardSkeleton />

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="max-w-4xl mx-auto px-8 py-10"
      >
        {/* Greeting — above fold, stagger */}
        <motion.div variants={item} className="mb-8">
          <h1 className="text-[28px] font-bold text-[#0F172A] dark:text-white tracking-tight">
            Welcome{displayName ? `, ${displayName}` : ''}! 👋
          </h1>
          <p className="text-[#64748B] text-[15px] mt-1">Here&apos;s what&apos;s happening with your content.</p>
        </motion.div>

        {/* Stat cards — above fold, stagger */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total ideas', value: ideaCount },
            { label: 'Pillars', value: pillars.length },
            { label: 'Ideas this week', value: recentIdeas.length },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={item}
              custom={i}
              className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl p-5"
            >
              <div className="text-[32px] font-bold text-[#0F172A] leading-none mb-1">{stat.value}</div>
              <div className="text-[13px] text-[#64748B]">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Trophy card — scroll reveal */}
        {trophyResult && (
          <motion.div {...scrollReveal} className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl p-5 mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B] mb-4">Consistency Trophy</p>
            <TrophyCard result={trophyResult} />
            <Link href="/dashboard/settings" className="block mt-4 text-[12px] text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors duration-150">
              How trophies work →
            </Link>
          </motion.div>
        )}

        {/* Mini calendar — scroll reveal */}
        <motion.div {...scrollReveal} className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl p-5 mb-6">
          <MiniCalendar ideas={calendarIdeas} />
        </motion.div>

        {/* Quick links — scroll reveal, staggered pair */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { href: '/dashboard/pipeline', label: 'Go to Pipeline', sub: 'Manage your idea stages' },
            { href: '/dashboard/calendar', label: 'View Calendar', sub: 'See your posting schedule' },
          ].map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, ease, delay: i * 0.06 }}
            >
              <Link
                href={link.href}
                className="flex items-center justify-between bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:border-[#2563EB] hover:shadow-sm transition-[border-color,box-shadow] duration-150 group"
              >
                <div>
                  <p className="font-semibold text-[#0F172A] text-[15px]">{link.label}</p>
                  <p className="text-[13px] text-[#64748B] mt-0.5">{link.sub}</p>
                </div>
                <span className="text-[#2563EB] text-lg group-hover:translate-x-0.5 transition-transform duration-150">→</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent ideas — scroll reveal */}
        <motion.div {...scrollReveal} className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">Recent Ideas</p>
            <Link href="/dashboard/pipeline" className="text-[13px] text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors duration-150">
              View all →
            </Link>
          </div>
          {recentIdeas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#64748B] text-[14px] mb-3">No ideas yet.</p>
              <Link href="/dashboard/pipeline" className="text-[13px] font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors duration-150">
                Add your first idea in the Pipeline →
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentIdeas.map(idea => (
                <Link
                  key={idea.id}
                  href={`/dashboard/ideas/${idea.id}`}
                  className="flex items-center justify-between bg-white border border-[#E2E8F0] px-4 py-3.5 rounded-xl hover:border-[#2563EB] hover:shadow-sm transition-[border-color,box-shadow] duration-150"
                >
                  <div>
                    <p className="font-medium text-[#0F172A] text-[15px]">{idea.title}</p>
                    <div className="mt-0.5">
                      <PillarBadge pillar={idea.pillar} />
                    </div>
                  </div>
                  <StageBadge stage={idea.stage} />
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {showLevelUp && levelUpTier && (
        <LevelUpModal level={levelUpTier} onClose={() => setShowLevelUp(false)} />
      )}
    </>
  )
}
