'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ShimmerButton } from '@/components/ui/ShimmerButton'
import { FocusInput } from '@/components/ui/FocusInput'
import { FREE_TIER_LIMITS, STAGES, type IdeaStage, type Pillar } from '@/lib/types'

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 }

interface Props {
  pillars: Pillar[]
  ideaCount: number
  onAdd: (title: string, pillarId: string, stage: IdeaStage, scheduledDate: string) => Promise<void>
  onClose: () => void
}

export function AddIdeaModal({ pillars, ideaCount, onAdd, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [pillarId, setPillarId] = useState(pillars[0]?.id ?? '')
  const [stage, setStage] = useState<IdeaStage>('Idea')
  const [scheduledDate, setScheduledDate] = useState('')
  const [loading, setLoading] = useState(false)
  const atLimit = ideaCount >= FREE_TIER_LIMITS.MAX_IDEAS

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || atLimit) return
    setLoading(true)
    await onAdd(title.trim(), pillarId, stage, scheduledDate)
    setLoading(false)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={spring}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 w-full max-w-md shadow-xl border border-[#E2E8F0] dark:border-[#334155]"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-[17px] font-bold text-[#0F172A] dark:text-white mb-5">New idea</h2>

          {atLimit && (
            <div className="bg-[#FEF3C7] dark:bg-[#451a03] border border-[#FDE68A] dark:border-[#78350f] rounded-xl px-4 py-3 mb-4 text-[13px] text-[#92400E] dark:text-[#fcd34d]">
              You&apos;ve reached the 50-idea limit on the free tier.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-[#64748B] dark:text-[#94A3B8] block mb-2">Title</label>
              <FocusInput
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What's the video about?"
                autoFocus
              />
            </div>

            {pillars.length > 0 && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-[#64748B] dark:text-[#94A3B8] block mb-2">Pillar</label>
                <div className="flex flex-wrap gap-2">
                  {pillars.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPillarId(p.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-medium transition-all duration-150"
                      style={{
                        backgroundColor: pillarId === p.id ? `${p.color}18` : undefined,
                        borderColor: pillarId === p.id ? p.color : '#E2E8F0',
                        color: pillarId === p.id ? p.color : '#64748B',
                      }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-[#64748B] dark:text-[#94A3B8] block mb-2">Stage</label>
              <div className="flex gap-2 flex-wrap">
                {STAGES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStage(s)}
                    className="px-3 py-1.5 rounded-full border text-[13px] font-medium transition-all duration-150"
                    style={{
                      backgroundColor: stage === s ? '#2563EB' : undefined,
                      borderColor: stage === s ? '#2563EB' : '#E2E8F0',
                      color: stage === s ? '#fff' : '#64748B',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-[#64748B] dark:text-[#94A3B8] block mb-2">
                Post date <span className="text-[#CBD5E1] normal-case font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#E2E8F0] dark:border-[#475569] rounded-xl text-[#0F172A] text-[14px] focus:outline-none focus:border-[#2563EB] transition-colors duration-150"
              />
              {scheduledDate && (
                <p className="text-[12px] text-[#94A3B8] mt-1.5">
                  🔔 Reminders configured in{' '}
                  <a href="/dashboard/settings" className="text-[#2563EB] hover:text-[#1D4ED8] font-medium">Settings →</a>
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <ShimmerButton variant="secondary" onClick={onClose} className="flex-1 py-3 px-4 text-[14px]">
                Cancel
              </ShimmerButton>
              <ShimmerButton
                type="submit"
                disabled={!title.trim() || atLimit || loading}
                className="flex-1 py-3 px-4 text-[14px]"
              >
                {loading ? 'Adding…' : 'Add idea'}
              </ShimmerButton>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
