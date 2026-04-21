'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabaseClient } from '@/lib/supabase'
import { useAppContext } from '../_context'
import { AddIdeaModal } from '@/components/modals/AddIdeaModal'
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal'
import { PillarBadge } from '@/components/ui/PillarBadge'
import { StageBadge } from '@/components/ui/StageBadge'
import { FreeTierBanner } from '@/components/ui/FreeTierBanner'
import { STAGES, STAGE_COLORS, FREE_TIER_LIMITS, type IdeaStage, type IdeaWithPillar } from '@/lib/types'

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 }

// ─── Idea card ────────────────────────────────────────────────────────────────

function IdeaCard({
  idea,
  onStageChange,
  onDelete,
  shotStat,
}: {
  idea: IdeaWithPillar
  onStageChange: (id: string, stage: IdeaStage) => Promise<void>
  onDelete: (idea: IdeaWithPillar) => void
  shotStat?: { total: number; completed: number }
}) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const otherStages = STAGES.filter(s => s !== idea.stage)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={spring}
      className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 cursor-pointer hover:shadow-sm transition-shadow duration-150 group relative"
      style={{ borderLeftWidth: 3, borderLeftColor: idea.pillar?.color ?? '#E2E8F0' }}
      onClick={() => router.push(`/dashboard/ideas/${idea.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-[#0F172A] text-[13.5px] leading-snug flex-1">{idea.title}</p>
        {/* Menu button */}
        <div ref={menuRef} className="relative flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#F1F5F9] text-[#64748B] transition-all duration-150"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M8 2a1 1 0 110 2 1 1 0 010-2zm0 5a1 1 0 110 2 1 1 0 010-2zm0 5a1 1 0 110 2 1 1 0 010-2z" />
            </svg>
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-7 z-20 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1.5 min-w-[150px]"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8] px-3 py-1">Move to</p>
                {otherStages.map(s => (
                  <button
                    key={s}
                    onClick={async e => {
                      e.stopPropagation()
                      setMenuOpen(false)
                      await onStageChange(idea.id, s)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#0F172A] hover:bg-[#F8F9FA] transition-colors duration-100"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STAGE_COLORS[s] }} />
                    {s}
                  </button>
                ))}
                <div className="border-t border-[#F1F5F9] mt-1 pt-1">
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete(idea) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#EF4444] hover:bg-[#FEE2E2] transition-colors duration-100"
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 000 1.5h.3l.815 8.15A1.5 1.5 0 005.357 15h5.285a1.5 1.5 0 001.493-1.35l.815-8.15h.3a.75.75 0 000-1.5H11v-.75A2.25 2.25 0 008.75 1h-1.5A2.25 2.25 0 005 3.25zm2.25-.75a.75.75 0 00-.75.75V4h3v-.75a.75.75 0 00-.75-.75h-1.5zM6.05 6a.75.75 0 01.787.713l.275 5.5a.75.75 0 01-1.498.075l-.275-5.5A.75.75 0 016.05 6zm3.9 0a.75.75 0 01.712.787l-.275 5.5a.75.75 0 01-1.498-.075l.275-5.5a.75.75 0 01.786-.711z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Hook preview for Scripted stage */}
      {idea.stage === 'Scripted' && idea.script && (
        <div className="bg-[#F8F9FA] rounded-lg px-2.5 py-1.5 mt-2">
          <p className="text-[11px] text-[#64748B] leading-snug">
            <span className="mr-0.5">🎬</span>
            <span className="font-semibold text-[#475569]">Hook: </span>
            {idea.script.substring(0, 70)}{idea.script.length > 70 ? '…' : ''}
          </p>
        </div>
      )}

      {/* Bottom row: pillar badge + shot progress for Filmed */}
      <div className="flex items-center justify-between mt-2">
        <PillarBadge pillar={idea.pillar} />
        {idea.stage === 'Filmed' && shotStat && shotStat.total > 0 && (
          <span className="text-[11px] font-semibold text-[#10B981]">
            {shotStat.completed}/{shotStat.total} shots ✓
          </span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Pipeline page ────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const { pillars, ideaCount, refreshIdeaCount } = useAppContext()
  const [ideas, setIdeas] = useState<IdeaWithPillar[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<IdeaWithPillar | null>(null)
  const [activeTab, setActiveTab] = useState<IdeaStage>('Idea')
  const [shotStats, setShotStats] = useState<Record<string, { total: number; completed: number }>>({})

  const fetchIdeas = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) { console.error('fetchIdeas error:', error); return }
    if (data) {
      setIdeas(data.map(idea => ({
        ...idea,
        pillar: pillars.find(p => p.id === idea.pillar_id) ?? null,
      })) as IdeaWithPillar[])

      const ideaIds = data.map(i => i.id)
      if (ideaIds.length) {
        const { data: shotsData } = await supabase
          .from('shots')
          .select('*')
          .in('idea_id', ideaIds)
        const stats: Record<string, { total: number; completed: number }> = {}
        for (const shot of shotsData ?? []) {
          if (!stats[shot.idea_id]) stats[shot.idea_id] = { total: 0, completed: 0 }
          stats[shot.idea_id].total++
          if (shot.completed ?? false) stats[shot.idea_id].completed++
        }
        setShotStats(stats)
      }
    }
  }

  useEffect(() => {
    if (!user) return
    fetchIdeas().finally(() => setLoading(false))
  }, [user, pillars]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = async (title: string, pillarId: string, stage: IdeaStage, scheduledDate: string) => {
    if (!user || ideas.length >= FREE_TIER_LIMITS.MAX_IDEAS) return
    const { data: newIdea, error } = await supabase
      .from('ideas')
      .insert({ user_id: user.id, pillar_id: pillarId || null, title, stage, scheduled_date: scheduledDate || null })
      .select()
      .single()
    if (error || !newIdea) { console.error('handleAdd error:', error); return }
    const pillar = pillars.find(p => p.id === pillarId) ?? null
    setIdeas(prev => [{ ...newIdea, pillar } as IdeaWithPillar, ...prev])
    refreshIdeaCount()
  }

  const handleStageChange = async (id: string, stage: IdeaStage) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, stage } : i))
    await supabase.from('ideas').update({ stage }).eq('id', id).eq('user_id', user!.id)
  }

  const handleDelete = async () => {
    if (!user || !deleteTarget) return
    await supabase.from('ideas').delete().eq('id', deleteTarget.id).eq('user_id', user.id)
    setIdeas(prev => prev.filter(i => i.id !== deleteTarget.id))
    refreshIdeaCount()
    setDeleteTarget(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-[#64748B] font-medium text-[15px]"
        >
          Loading…
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div>
          <h1 className="text-[26px] font-bold text-[#0F172A] tracking-tight">Ideas Pipeline</h1>
          <p className="text-[#64748B] text-[13px] mt-0.5">{ideas.length}/50 ideas used</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          disabled={ideas.length >= FREE_TIER_LIMITS.MAX_IDEAS}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-[14px] font-medium px-4 py-2.5 rounded-xl transition-colors duration-150"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New idea
        </button>
      </div>

      <FreeTierBanner type="ideas" current={ideas.length} max={FREE_TIER_LIMITS.MAX_IDEAS} />

      {/* ── Desktop: 4-column kanban ── */}
      <div className="hidden md:grid md:grid-cols-4 gap-4 flex-1 overflow-hidden mt-4">
        {STAGES.map(stage => {
          const stageIdeas = ideas.filter(i => i.stage === stage)
          return (
            <div key={stage} className="flex flex-col bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl overflow-hidden">
              {/* Column header */}
              <div className="px-4 pt-4 pb-3 border-b border-[#E2E8F0] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STAGE_COLORS[stage] }} />
                  <span className="font-semibold text-[13px] text-[#0F172A]">{stage}</span>
                  <span className="text-[11px] text-[#94A3B8] ml-auto font-medium bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded-full">
                    {stageIdeas.length}
                  </span>
                </div>
              </div>
              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                <AnimatePresence>
                  {stageIdeas.map(idea => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onStageChange={handleStageChange}
                      onDelete={setDeleteTarget}
                      shotStat={shotStats[idea.id]}
                    />
                  ))}
                </AnimatePresence>
                {stageIdeas.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-[12px] text-[#CBD5E1]">
                    No ideas here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Mobile: tab bar + single column ── */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden mt-4">
        {/* Tab bar */}
        <div className="flex gap-1 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl p-1 mb-4 flex-shrink-0">
          {STAGES.map(stage => (
            <button
              key={stage}
              onClick={() => setActiveTab(stage)}
              className="flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all duration-150"
              style={{
                backgroundColor: activeTab === stage ? STAGE_COLORS[stage] : 'transparent',
                color: activeTab === stage ? '#fff' : '#64748B',
              }}
            >
              {stage}
              <span className="ml-1 opacity-70">({ideas.filter(i => i.stage === stage).length})</span>
            </button>
          ))}
        </div>
        {/* Cards for active tab */}
        <div className="flex-1 overflow-y-auto space-y-2.5">
          <AnimatePresence>
            {ideas.filter(i => i.stage === activeTab).map(idea => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onStageChange={handleStageChange}
                onDelete={setDeleteTarget}
                shotStat={shotStats[idea.id]}
              />
            ))}
          </AnimatePresence>
          {ideas.filter(i => i.stage === activeTab).length === 0 && (
            <div className="text-center py-12 text-[#CBD5E1] text-[14px]">No ideas in {activeTab}</div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddIdeaModal
          pillars={pillars}
          ideaCount={ideas.length}
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          itemName={deleteTarget.title}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
