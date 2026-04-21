'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSupabaseClient } from '@/lib/supabase'
import { useAppContext } from '../_context'
import { StageBadge } from '@/components/ui/StageBadge'
import { type Pillar, type IdeaWithPillar, type Shot } from '@/lib/types'

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 }

type IdeaWithShots = IdeaWithPillar & { shots: Shot[] }

export default function ShotListsPage() {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const { pillars } = useAppContext()
  const [ideas, setIdeas] = useState<IdeaWithShots[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    setLoading(true)
    setError(null)

    const load = async () => {
      const { data: ideasData, error: ideasErr } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ideasErr) { setError(ideasErr.message); setLoading(false); return }
      if (!ideasData?.length) { setIdeas([]); setLoading(false); return }

      const ideaIds = ideasData.map(i => i.id)

      const { data: shotsData, error: shotsErr } = await supabase
        .from('shots')
        .select('*')
        .in('idea_id', ideaIds)
        .order('order', { ascending: true })

      if (shotsErr) { setError(shotsErr.message); setLoading(false); return }

      const shotsByIdea: Record<string, Shot[]> = {}
      for (const shot of shotsData ?? []) {
        if (!shotsByIdea[shot.idea_id]) shotsByIdea[shot.idea_id] = []
        shotsByIdea[shot.idea_id].push({ ...shot, completed: shot.completed ?? false })
      }

      const mapped = ideasData
        .map(idea => ({
          ...idea,
          pillar: pillars.find(p => p.id === idea.pillar_id) ?? null,
          shots: shotsByIdea[idea.id] ?? [],
        }))
        .filter(idea => idea.shots.length > 0)

      setIdeas(mapped as IdeaWithShots[])
      setLoading(false)
    }

    load().catch(err => { setError(String(err)); setLoading(false) })
  }, [user, pillars]) // eslint-disable-line react-hooks/exhaustive-deps

  // Group ideas by pillar
  const ideasForPillar = (pillarId: string | null) =>
    ideas.filter(idea => (idea.pillar_id ?? null) === pillarId)

  const unassigned = ideas.filter(idea => !idea.pillar_id)

  const columns: Array<{ pillar: Pillar | null; label: string; color: string }> = [
    ...pillars.map(p => ({ pillar: p, label: p.name, color: p.color })),
    ...(unassigned.length > 0 ? [{ pillar: null, label: 'Other', color: '#94A3B8' }] : []),
  ]

  const colCount = columns.length || pillars.length || 3

  return (
    <div className="px-6 py-8 h-full flex flex-col">

      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-[26px] font-bold text-[#0F172A] dark:text-white tracking-tight">Shot Lists</h1>
        <p className="text-[#64748B] text-[13px] mt-0.5">
          {ideas.length > 0 ? `${ideas.length} idea${ideas.length !== 1 ? 's' : ''} with shot lists` : 'Track your filming progress by pillar.'}
        </p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div
          className="grid gap-4 flex-1"
          style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: colCount }).map((_, i) => (
            <div key={i} className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#E2E8F0] animate-pulse" />
                  <div className="h-3 w-20 bg-[#E2E8F0] rounded animate-pulse" />
                </div>
              </div>
              <div className="p-3 space-y-2.5">
                {[1, 2].map(j => (
                  <div key={j} className="h-[88px] bg-[#E2E8F0] rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-5">
          <p className="text-[#EF4444] font-semibold text-[14px]">Failed to load shot lists</p>
          <p className="text-[#F87171] text-[12px] mt-1">{error}</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* ── Desktop: pillar columns ── */}
          <div
            className="hidden md:grid gap-4 flex-1 overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${columns.length || 1}, minmax(0, 1fr))` }}
          >
            {columns.map(({ pillar, label, color }) => {
              const colIdeas = ideasForPillar(pillar?.id ?? null)
              return (
                <div
                  key={pillar?.id ?? 'other'}
                  className="flex flex-col bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl overflow-hidden"
                >
                  {/* Column header */}
                  <div className="px-4 pt-4 pb-3 border-b border-[#E2E8F0] flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="font-semibold text-[13px] text-[#0F172A] truncate">{label}</span>
                      <span className="ml-auto text-[11px] font-medium text-[#94A3B8] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded-full flex-shrink-0">
                        {colIdeas.length}
                      </span>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                    {colIdeas.length === 0 ? (
                      <div className="flex items-center justify-center h-20 text-[12px] text-[#CBD5E1]">
                        No shot lists yet
                      </div>
                    ) : (
                      colIdeas.map((idea, index) => (
                        <IdeaShotCard key={idea.id} idea={idea} color={color} index={index} />
                      ))
                    )}
                  </div>
                </div>
              )
            })}

            {columns.length === 0 && (
              <EmptyState />
            )}
          </div>

          {/* ── Mobile: stacked by pillar ── */}
          <div className="md:hidden space-y-6 overflow-y-auto">
            {columns.length === 0 ? (
              <EmptyState />
            ) : columns.map(({ pillar, label, color }) => {
              const colIdeas = ideasForPillar(pillar?.id ?? null)
              if (colIdeas.length === 0) return null
              return (
                <div key={pillar?.id ?? 'other'}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <p className="font-semibold text-[13px] text-[#0F172A]">{label}</p>
                    <span className="text-[11px] text-[#94A3B8]">({colIdeas.length})</span>
                  </div>
                  <div className="space-y-2.5">
                    {colIdeas.map((idea, index) => (
                      <IdeaShotCard key={idea.id} idea={idea} color={color} index={index} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Idea card ─────────────────────────────────────────────────────────────────

function IdeaShotCard({ idea, color, index }: { idea: IdeaWithShots; color: string; index: number }) {
  const done = idea.shots.filter(s => s.completed).length
  const total = idea.shots.length
  const pct = total > 0 ? (done / total) * 100 : 0
  const allDone = done === total && total > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: index * 0.04 }}
    >
      <Link
        href={`/dashboard/ideas/${idea.id}`}
        className="block bg-white border border-[#E2E8F0] rounded-xl p-3.5 hover:shadow-sm transition-all duration-150 group"
        style={{ borderLeftWidth: 3, borderLeftColor: color }}
      >
        <p className="font-medium text-[#0F172A] text-[13px] leading-snug group-hover:text-[#2563EB] transition-colors duration-150 mb-2">
          {idea.title}
        </p>

        <StageBadge stage={idea.stage} />

        <div className="mt-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-[#94A3B8]">Shots</span>
            <span className={`text-[11px] font-semibold ${allDone ? 'text-[#10B981]' : 'text-[#64748B]'}`}>
              {done}/{total}{allDone ? ' ✓' : ''}
            </span>
          </div>
          <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: allDone ? '#10B981' : color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={spring}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-[#CBD5E1] mb-3">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 010 2H4a1 1 0 01-1-1zm6 0a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1zM3 8a1 1 0 011-1h3a1 1 0 010 2H4a1 1 0 01-1-1zm6 0a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1zM3 12a1 1 0 011-1h3a1 1 0 110 2H4a1 1 0 01-1-1zm6 0a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
      <p className="text-[#64748B] font-semibold text-[15px]">No shot lists yet</p>
      <p className="text-[#94A3B8] text-[13px] mt-1">Open an idea and add shots to track them here.</p>
    </div>
  )
}
