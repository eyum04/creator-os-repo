'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabaseClient } from '@/lib/supabase'
import { useAppContext } from '../_context'
import { FocusInput } from '@/components/ui/FocusInput'
import { ShimmerButton } from '@/components/ui/ShimmerButton'
import { FreeTierBanner } from '@/components/ui/FreeTierBanner'
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal'
import { FREE_TIER_LIMITS, PILLAR_COLORS, type Pillar } from '@/lib/types'

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 }
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: spring } }

export default function PillarsPage() {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const { pillars, refreshPillars } = useAppContext()
  const router = useRouter()

  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState<string>(PILLAR_COLORS[0])
  const [saving, setSaving] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState<string>('')
  const [editSaving, setEditSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Pillar | null>(null)

  const atLimit = pillars.length >= FREE_TIER_LIMITS.MAX_PILLARS

  const handleAdd = async () => {
    if (!user || !newName.trim() || atLimit) return
    setSaving(true)
    await supabase.from('pillars').insert({ user_id: user.id, name: newName.trim(), color: newColor })
    await refreshPillars()
    setNewName('')
    setNewColor(PILLAR_COLORS[0])
    setSaving(false)
  }

  const startEdit = (pillar: Pillar) => {
    setEditingId(pillar.id)
    setEditName(pillar.name)
    setEditColor(pillar.color)
  }

  const handleSaveEdit = async () => {
    if (!user || !editName.trim() || !editingId) return
    setEditSaving(true)
    await supabase
      .from('pillars')
      .update({ name: editName.trim(), color: editColor })
      .eq('id', editingId)
      .eq('user_id', user.id)
    await refreshPillars()
    setEditingId(null)
    setEditSaving(false)
  }

  const handleDelete = async () => {
    if (!user || !deleteTarget) return
    await supabase.from('pillars').delete().eq('id', deleteTarget.id).eq('user_id', user.id)
    await refreshPillars()
    setDeleteTarget(null)
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <motion.div initial="hidden" animate="visible" variants={container}>
        {/* Header */}
        <motion.div variants={item} className="mb-8">
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">Your Pillars</h1>
          <p className="text-[#64748B] text-[15px] mt-1">Organize your content into focused themes.</p>
        </motion.div>

        {/* Free tier banner */}
        <motion.div variants={item}>
          <FreeTierBanner type="pillars" current={pillars.length} max={FREE_TIER_LIMITS.MAX_PILLARS} />
        </motion.div>

        {/* Add form */}
        {!atLimit && (
          <motion.div
            variants={item}
            className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl p-6 mb-6"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B] mb-4">Add a pillar</p>
            <div className="flex gap-2 mb-4 flex-wrap">
              {PILLAR_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className="w-7 h-7 rounded-full transition-transform duration-150 hover:scale-110 relative"
                  style={{ backgroundColor: c }}
                >
                  <AnimatePresence>
                    {newColor === c && (
                      <motion.div
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={spring}
                        className="absolute inset-0 rounded-full border-[2.5px] border-white"
                        style={{ boxShadow: `0 0 0 2px ${c}` }}
                      />
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <FocusInput
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Lifestyle, Comedy, Tutorials…"
                className="flex-1"
              />
              <ShimmerButton
                onClick={handleAdd}
                disabled={!newName.trim() || saving}
                className="py-3 px-5 text-[14px] whitespace-nowrap"
              >
                {saving ? 'Adding…' : 'Add pillar'}
              </ShimmerButton>
            </div>
          </motion.div>
        )}

        {/* Pillar list */}
        <AnimatePresence>
          {pillars.map(pillar => (
            <motion.div
              key={pillar.id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={spring}
              className="bg-white border border-[#E2E8F0] rounded-2xl p-5 mb-3"
            >
              {editingId === pillar.id ? (
                /* Edit mode */
                <div>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {PILLAR_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditColor(c)}
                        className="w-6 h-6 rounded-full transition-transform duration-150 hover:scale-110 relative"
                        style={{ backgroundColor: c }}
                      >
                        <AnimatePresence>
                          {editColor === c && (
                            <motion.div
                              initial={{ scale: 0.4, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.4, opacity: 0 }}
                              transition={spring}
                              className="absolute inset-0 rounded-full border-2 border-white"
                        style={{ boxShadow: `0 0 0 2px ${c}` }}
                            />
                          )}
                        </AnimatePresence>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <FocusInput
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      autoFocus
                      className="flex-1"
                    />
                    <ShimmerButton
                      onClick={handleSaveEdit}
                      disabled={!editName.trim() || editSaving}
                      className="py-3 px-4 text-[13px]"
                    >
                      {editSaving ? 'Saving…' : 'Save'}
                    </ShimmerButton>
                    <ShimmerButton
                      variant="secondary"
                      onClick={() => setEditingId(null)}
                      className="py-3 px-4 text-[13px]"
                    >
                      Cancel
                    </ShimmerButton>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => router.push(`/dashboard/pillars/${pillar.id}`)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left group/link"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: pillar.color }}
                    />
                    <span className="font-semibold text-[15px] text-[#0F172A] group-hover/link:text-[#2563EB] transition-colors duration-150">{pillar.name}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-[#CBD5E1] group-hover/link:text-[#2563EB] transition-colors duration-150 flex-shrink-0">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(pillar)}
                      className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors duration-150"
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 015 12.5V12h-.5a.5.5 0 01-.5-.5V11h-.5a.5.5 0 01-.468-.325z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(pillar)}
                      className="p-2 rounded-lg hover:bg-[#FEE2E2] text-[#64748B] hover:text-[#EF4444] transition-colors duration-150"
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {pillars.length === 0 && (
          <motion.div variants={item} className="text-center py-12 text-[#64748B] text-[14px]">
            No pillars yet. Add your first one above.
          </motion.div>
        )}
      </motion.div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDeleteModal
          itemName={deleteTarget.name}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
