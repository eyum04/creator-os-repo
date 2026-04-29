'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabaseClient } from '@/lib/supabase'
import { useAppContext } from '../../_context'
import { PillarBadge } from '@/components/ui/PillarBadge'
import { FocusInput } from '@/components/ui/FocusInput'
import { ShimmerButton } from '@/components/ui/ShimmerButton'
import { STAGES, STAGE_COLORS, type IdeaWithPillar, type Shot } from '@/lib/types'
import { CelebrationModal } from '@/components/modals/CelebrationModal'
import { ShootingStars } from '@/components/ui/ShootingStars'

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 }

export default function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const { pillars } = useAppContext()

  const [idea, setIdea] = useState<IdeaWithPillar | null>(null)
  const [shots, setShots] = useState<Shot[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Editable fields
  const [title, setTitle] = useState('')
  const [stage, setStage] = useState<typeof STAGES[number]>('Idea')
  const [script, setScript] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showStars, setShowStars] = useState(false)
  // Shot list
  const [newShot, setNewShot] = useState('')
  const [addingShot, setAddingShot] = useState(false)
  const [editingShotId, setEditingShotId] = useState<string | null>(null)
  const [editShotContent, setEditShotContent] = useState('')


  useEffect(() => {
    if (!user || !id) return
    Promise.all([
      supabase.from('ideas').select('*').eq('id', id).eq('user_id', user.id).single(),
      supabase.from('shots').select('*').eq('idea_id', id).order('order', { ascending: true }),
    ]).then(([ideaRes, shotsRes]) => {
      if (!ideaRes.data) { setNotFound(true); setLoading(false); return }
      const raw = ideaRes.data
      const pillar = pillars.find(p => p.id === raw.pillar_id) ?? null
      const ideaWithPillar: IdeaWithPillar = { ...raw, pillar }
      setIdea(ideaWithPillar)
      setTitle(raw.title)
      setStage(raw.stage)
      setScript(raw.script ?? '')
      setScheduledDate((raw.scheduled_date ?? '').substring(0, 10))
      if (shotsRes.data) setShots(shotsRes.data)
      setLoading(false)
    })
  }, [user, id, pillars]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!user || !idea) return
    setSaving(true)
    setSaveError(null)

    const isNewPost = stage === 'Posted' && idea.stage !== 'Posted'
    const now = new Date().toISOString()

    const { data: saved, error } = await supabase
      .from('ideas')
      .update({
        title: title.trim() || idea.title,
        stage,
        script: script || null,
        scheduled_date: scheduledDate || null,
        ...(isNewPost ? { posted_at: now } : {}),
      })
      .eq('id', id)
      .select('id, title, stage, script, scheduled_date, posted_at')
      .single()

    if (error) {
      setSaveError(error.message)
      setSaving(false)
      return
    }
    if (!saved) {
      setSaveError('Update matched no rows — idea ID mismatch.')
      setSaving(false)
      return
    }

    // Update state from what DB actually stored
    setTitle(saved.title)
    setStage(saved.stage)
    setScript(saved.script ?? '')
    setScheduledDate(saved.scheduled_date ?? '')

    const pillar = pillars.find(p => p.id === idea.pillar_id) ?? null
    setIdea(prev => prev ? { ...prev, ...saved, pillar } : prev)
    const isForward = STAGES.indexOf(saved.stage) > STAGES.indexOf(idea.stage)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)

    if (isForward) setShowStars(true)
    if (saved.stage === 'Posted') setShowCelebration(true)
  }

  const handleToggleShot = async (shotId: string, completed: boolean) => {
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, completed } : s))
    await supabase.from('shots').update({ completed }).eq('id', shotId)
  }

  // ── Shot list CRUD ──────────────────────────────────────────────────────────

  const handleAddShot = async () => {
    if (!newShot.trim()) return
    setAddingShot(true)
    const { data } = await supabase
      .from('shots')
      .insert({ idea_id: id, content: newShot.trim(), order: shots.length })
      .select()
      .single()
    if (data) setShots(prev => [...prev, data])
    setNewShot('')
    setAddingShot(false)
  }

  const handleDeleteShot = async (shotId: string) => {
    await supabase.from('shots').delete().eq('id', shotId)
    setShots(prev => prev.filter(s => s.id !== shotId))
  }

  const handleSaveEditShot = async (shotId: string) => {
    if (!editShotContent.trim()) return
    await supabase.from('shots').update({ content: editShotContent.trim() }).eq('id', shotId)
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, content: editShotContent.trim() } : s))
    setEditingShotId(null)
  }

  const handleMoveShot = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= shots.length) return
    const updated = [...shots]
    const a = updated[index], b = updated[swapIndex]
    updated[index] = { ...b, order: a.order }
    updated[swapIndex] = { ...a, order: b.order }
    setShots(updated)
    await Promise.all([
      supabase.from('shots').update({ order: a.order }).eq('id', b.id),
      supabase.from('shots').update({ order: b.order }).eq('id', a.id),
    ])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }} className="text-[#64748B] font-medium text-[15px]">Loading…</motion.div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
        <p className="text-[#64748B] text-[15px]">Idea not found.</p>
        <button onClick={() => router.push('/dashboard/pipeline')} className="text-[#2563EB] text-[14px] font-medium hover:text-[#1D4ED8]">← Back to Pipeline</button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Back */}
      <button
        onClick={() => router.push('/dashboard/pipeline')}
        className="flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors duration-150 mb-6"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
        Back to Pipeline
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.1fr] gap-8">

        {/* ── Left: idea metadata ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
          <div className="mb-2">
            <PillarBadge pillar={idea!.pillar} size="md" />
          </div>

          {/* Title */}
          {editingTitle ? (
            <div className="flex gap-2 mb-6">
              <FocusInput value={title} onChange={e => setTitle(e.target.value)} autoFocus className="flex-1" />
              <button
                onClick={() => setEditingTitle(false)}
                className="px-3 py-2 text-[13px] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] rounded-xl hover:bg-[#F1F5F9] transition-colors duration-150"
              >
                Done
              </button>
            </div>
          ) : (
            <h1
              onClick={() => setEditingTitle(true)}
              className="text-[24px] font-bold text-[#0F172A] dark:text-white tracking-tight mb-6 cursor-text hover:bg-[#F8F9FA] dark:hover:bg-[#1E293B] rounded-xl px-2 py-1 -mx-2 transition-colors duration-150 group"
            >
              {title}
              <span className="ml-2 text-[14px] text-[#CBD5E1] font-normal opacity-0 group-hover:opacity-100 transition-opacity duration-150">edit</span>
            </h1>
          )}

          {/* Stage */}
          <div className="mb-5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#64748B] block mb-2">Stage</label>
            <div className="flex flex-wrap gap-2">
              {STAGES.map(s => (
                <button
                  key={s}
                  onClick={() => setStage(s)}
                  className="px-3 py-1.5 rounded-full border text-[13px] font-medium transition-all duration-150"
                  style={{
                    backgroundColor: stage === s ? STAGE_COLORS[s] : '#F8F9FA',
                    borderColor: stage === s ? STAGE_COLORS[s] : '#E2E8F0',
                    color: stage === s ? '#fff' : '#64748B',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Post date */}
          <div className="mb-5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#64748B] block mb-2">Post date</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#E2E8F0] dark:border-[#475569] rounded-xl text-[#0F172A] text-[14px] focus:outline-none focus:border-[#2563EB] transition-colors duration-150"
            />
          </div>

          {/* Script */}
          <div className="mb-4">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#64748B] block mb-2">Script / Notes</label>
            <textarea
              value={script}
              onChange={e => setScript(e.target.value)}
              rows={8}
              placeholder="Write your script, hook ideas, or notes here…"
              className="w-full px-4 py-3.5 bg-white border border-[#E2E8F0] dark:border-[#475569] rounded-xl text-[#0F172A] text-[14px] placeholder-[#CBD5E1] focus:outline-none focus:border-[#2563EB] resize-none transition-colors duration-150 leading-relaxed"
            />
          </div>


          {/* Save */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <ShimmerButton onClick={handleSave} disabled={saving} className="py-3 px-6 text-[14px]">
                {saving ? 'Saving…' : 'Save changes'}
              </ShimmerButton>
              <AnimatePresence>
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[13px] text-[#10B981] font-medium"
                  >
                    Saved ✓
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {saveError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[12px] text-[#EF4444]"
                >
                  Save failed: {saveError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Right: shot list ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">Shot List</p>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">Plan every shot before you film</p>
            </div>
            <span className="text-[12px] bg-white border border-[#E2E8F0] px-2 py-0.5 rounded-full font-medium"
              style={{ color: shots.length > 0 && shots.filter(s => s.completed).length === shots.length ? '#10B981' : '#94A3B8' }}>
              {shots.filter(s => s.completed).length}/{shots.length} done
            </span>
          </div>

          {/* Add shot manually */}
          <div className="flex gap-2 mb-3">
            <FocusInput
              value={newShot}
              onChange={e => setNewShot(e.target.value)}
              placeholder="e.g. Wide establishing shot of desk…"
              className="flex-1"
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); handleAddShot() } }}
            />
            <button
              onClick={handleAddShot}
              disabled={!newShot.trim() || addingShot}
              className="p-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white rounded-xl transition-colors duration-150 flex-shrink-0"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Shot items */}
          <div className="space-y-2">
            <AnimatePresence>
              {shots.map((shot, index) => (
                <motion.div
                  key={shot.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12, scale: 0.96 }}
                  transition={spring}
                  className={`flex items-start gap-2 bg-white border rounded-xl p-3 group transition-colors duration-150 ${shot.completed ? 'border-[#D1FAE5] bg-[#F0FDF4]' : 'border-[#E2E8F0]'}`}
                >
                  <button
                    onClick={() => handleToggleShot(shot.id, !shot.completed)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-150 ${
                      shot.completed ? 'bg-[#10B981] border-[#10B981]' : 'border-[#CBD5E1] hover:border-[#2563EB]'
                    }`}
                  >
                    {shot.completed && (
                      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    {editingShotId === shot.id ? (
                      <div className="flex gap-2">
                        <input
                          value={editShotContent}
                          onChange={e => setEditShotContent(e.target.value)}
                          autoFocus
                          className="flex-1 text-[13px] text-[#0F172A] bg-transparent border-b border-[#2563EB] focus:outline-none pb-0.5"
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveEditShot(shot.id); if (e.key === 'Escape') setEditingShotId(null) }}
                        />
                        <button onClick={() => handleSaveEditShot(shot.id)} className="text-[11px] text-[#2563EB] font-semibold">Save</button>
                        <button onClick={() => setEditingShotId(null)} className="text-[11px] text-[#94A3B8]">✕</button>
                      </div>
                    ) : (
                      <p
                        className={`text-[13px] leading-snug cursor-text transition-colors duration-150 ${shot.completed ? 'line-through text-[#94A3B8]' : 'text-[#0F172A]'}`}
                        onClick={() => { setEditingShotId(shot.id); setEditShotContent(shot.content) }}
                      >
                        {shot.content}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
                    <button onClick={() => handleMoveShot(index, 'up')} disabled={index === 0} className="p-1 rounded hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#64748B] disabled:opacity-20 transition-colors duration-100">
                      <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3"><path d="M6 2l4 5H2l4-5z" /></svg>
                    </button>
                    <button onClick={() => handleMoveShot(index, 'down')} disabled={index === shots.length - 1} className="p-1 rounded hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#64748B] disabled:opacity-20 transition-colors duration-100">
                      <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3"><path d="M6 10L2 5h8l-4 5z" /></svg>
                    </button>
                    <button onClick={() => handleDeleteShot(shot.id)} className="p-1 rounded hover:bg-[#FEE2E2] text-[#94A3B8] hover:text-[#EF4444] transition-colors duration-100">
                      <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3"><path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" /></svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {shots.length === 0 && (
              <div className="text-center py-8 text-[#CBD5E1] text-[13px]">
                No shots yet. Add one above or generate with AI.
              </div>
            )}
          </div>
        </motion.div>
      </div>
      {showCelebration && <CelebrationModal onClose={() => setShowCelebration(false)} />}
      {showStars && <ShootingStars onComplete={() => setShowStars(false)} />}
    </div>
  )
}
