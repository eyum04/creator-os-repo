'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabaseClient } from '@/lib/supabase'
import { useAppContext } from '../_context'
import { STAGE_COLORS, type IdeaWithPillar } from '@/lib/types'

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 }

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function buildGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function parseLocalDate(str: string): Date {
  // Take only the YYYY-MM-DD part — handles both 'date' and 'timestamptz' column types
  const [y, m, d] = str.substring(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function CalendarPage() {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const { pillars } = useAppContext()
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [ideas, setIdeas] = useState<IdeaWithPillar[]>([])
  const [loading, setLoading] = useState(true)
  const [dir, setDir] = useState<1 | -1>(1)
  const [shotStats, setShotStats] = useState<Record<string, { total: number; completed: number }>>({})

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from('ideas')
      .select('*')
      .eq('user_id', user.id)
      .not('scheduled_date', 'is', null)
      .then(async ({ data }) => {
        if (data) {
          setIdeas(data.map(idea => ({
            ...idea,
            pillar: pillars.find(p => p.id === idea.pillar_id) ?? null,
          })) as IdeaWithPillar[])

          const filmedIds = data.filter(i => i.stage === 'Filmed').map(i => i.id)
          if (filmedIds.length) {
            const { data: shotsData } = await supabase
              .from('shots')
              .select('*')
              .in('idea_id', filmedIds)
            const stats: Record<string, { total: number; completed: number }> = {}
            for (const shot of shotsData ?? []) {
              if (!stats[shot.idea_id]) stats[shot.idea_id] = { total: 0, completed: 0 }
              stats[shot.idea_id].total++
              if (shot.completed ?? false) stats[shot.idea_id].completed++
            }
            setShotStats(stats)
          }
        }
        setLoading(false)
      })
  }, [user, pillars]) // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = (direction: 1 | -1) => {
    setDir(direction)
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1))
  }

  const grid = buildGrid(year, month)
  const today = new Date()

  const ideasForDate = (date: Date) =>
    ideas.filter(idea => idea.scheduled_date && isSameDay(parseLocalDate(idea.scheduled_date), date))

  return (
    <div className="px-6 py-8 h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="flex items-center justify-between mb-6 flex-shrink-0"
      >
        <div>
          <h1 className="text-[26px] font-bold text-[#0F172A] tracking-tight">
            {MONTHS[month]} {year}
          </h1>
          <p className="text-[#64748B] text-[13px] mt-0.5">Your content posting schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8F9FA] text-[#64748B] hover:text-[#0F172A] transition-colors duration-150"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => {
              setDir(1)
              setCurrentMonth(new Date())
            }}
            className="px-3 py-1.5 text-[12px] font-semibold border border-[#E2E8F0] rounded-xl hover:bg-[#F8F9FA] text-[#64748B] transition-colors duration-150"
          >
            Today
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8F9FA] text-[#64748B] hover:text-[#0F172A] transition-colors duration-150"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1 flex-shrink-0">
        {DAYS.map(d => (
          <div key={d} className="text-[11px] font-semibold text-[#94A3B8] text-center py-2 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, x: dir * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -24 }}
          transition={spring}
          className="grid grid-cols-7 border-l border-t border-[#E2E8F0] flex-1"
        >
          {grid.map((date, i) => {
            const isToday = date ? isSameDay(date, today) : false
            const dayIdeas = date ? ideasForDate(date) : []
            return (
              <div
                key={i}
                className="border-r border-b border-[#E2E8F0] p-2 min-h-[90px] bg-white"
              >
                {date && (
                  <>
                    <div className="flex items-center justify-center w-7 h-7 mb-1.5">
                      <span
                        className={[
                          'text-[13px] font-medium w-7 h-7 flex items-center justify-center rounded-full',
                          isToday
                            ? 'bg-[#2563EB] text-white font-bold'
                            : 'text-[#0F172A]',
                        ].join(' ')}
                      >
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {loading ? null : dayIdeas.map(idea => (
                        <Link
                          key={idea.id}
                          href={`/dashboard/ideas/${idea.id}`}
                          className="block px-1.5 py-0.5 rounded transition-opacity duration-150 hover:opacity-80"
                          style={{
                            backgroundColor: idea.pillar ? `${idea.pillar.color}18` : '#F1F5F9',
                          }}
                          title={idea.title}
                        >
                          <p className="text-[10px] font-semibold truncate" style={{ color: idea.pillar?.color ?? '#64748B' }}>
                            {idea.title}
                          </p>
                          {idea.stage === 'Filmed' && shotStats[idea.id] && shotStats[idea.id].total > 0 ? (
                            <p className="text-[9px] font-semibold mt-0.5" style={{ color: '#10B981' }}>
                              {shotStats[idea.id].completed}/{shotStats[idea.id].total} shots ✓
                            </p>
                          ) : (
                            <p className="text-[9px] font-medium mt-0.5" style={{ color: STAGE_COLORS[idea.stage] }}>
                              {idea.stage}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {!loading && ideas.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <p className="text-[#CBD5E1] text-[14px]">No ideas scheduled this month.</p>
          <p className="text-[#CBD5E1] text-[12px] mt-1">
            Set a post date on an idea to see it here.
          </p>
        </motion.div>
      )}
    </div>
  )
}
