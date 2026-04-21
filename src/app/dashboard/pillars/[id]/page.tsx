'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabaseClient } from '@/lib/supabase'
import { useAppContext } from '../../_context'
import { StageBadge } from '@/components/ui/StageBadge'
import { type Idea } from '@/lib/types'

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 }
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: spring } }

function formatDate(str: string | null) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PillarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const { pillars } = useAppContext()

  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)

  const pillar = pillars.find(p => p.id === id)

  useEffect(() => {
    if (!user) return
    supabase
      .from('ideas')
      .select('*')
      .eq('user_id', user.id)
      .eq('pillar_id', id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setIdeas(data as Idea[])
        setLoading(false)
      })
  }, [user, id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      {/* Back */}
      <button
        onClick={() => router.push('/dashboard/pillars')}
        className="flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors duration-150 mb-8"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Pillars
      </button>

      <motion.div initial="hidden" animate="visible" variants={container}>
        {/* Header */}
        <motion.div variants={item} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: pillar?.color ?? '#2563EB' }} />
            <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">
              {pillar?.name ?? 'Pillar'}
            </h1>
          </div>
          <p className="text-[#64748B] text-[15px] ml-8">
            {loading ? '…' : `${ideas.length} idea${ideas.length !== 1 ? 's' : ''}`}
          </p>
        </motion.div>

        {/* Ideas list */}
        {loading ? (
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="text-[#64748B] text-[14px] text-center py-12"
          >
            Loading…
          </motion.div>
        ) : ideas.length === 0 ? (
          <motion.div variants={item} className="text-center py-16">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${pillar?.color ?? '#2563EB'}18` }}
            >
              <div className="w-5 h-5 rounded-full" style={{ backgroundColor: pillar?.color ?? '#2563EB' }} />
            </div>
            <p className="text-[#64748B] text-[14px] mb-2">No ideas in this pillar yet.</p>
            <Link href="/dashboard/pipeline" className="text-[13px] font-medium text-[#2563EB] hover:text-[#1D4ED8]">
              Add an idea in the Pipeline →
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence>
            {ideas.map(idea => (
              <motion.div key={idea.id} variants={item} layout>
                <Link
                  href={`/dashboard/ideas/${idea.id}`}
                  className="flex items-center justify-between bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 mb-3 hover:border-[#2563EB] hover:shadow-sm transition-all duration-150 group"
                  style={{ borderLeftWidth: 3, borderLeftColor: pillar?.color ?? '#E2E8F0' }}
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-semibold text-[15px] text-[#0F172A] group-hover:text-[#2563EB] transition-colors duration-150 truncate">
                      {idea.title}
                    </p>
                    {idea.scheduled_date && (
                      <p className="text-[12px] text-[#94A3B8] mt-0.5">
                        📅 {formatDate(idea.scheduled_date)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StageBadge stage={idea.stage} />
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors duration-150">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  )
}
