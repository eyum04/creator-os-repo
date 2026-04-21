'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase'
import { ShimmerButton, spring, bouncySpring } from '../_components'

interface Pillar { id: string; name: string; color: string }
interface Idea { title: string; pillarId: string }

const COLUMNS = ['Idea', 'Scripted', 'Filmed', 'Posted']

export default function PreviewPage() {
  const [pillars, setPillars] = useState<Pillar[]>([])
  const [idea, setIdea] = useState<Idea | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useUser()
  const supabase = useSupabaseClient()

  useEffect(() => {
    const savedPillars = localStorage.getItem('onboarding_pillars')
    const savedIdea = localStorage.getItem('onboarding_idea')
    const savedName = localStorage.getItem('onboarding_name')
    if (savedPillars) setPillars(JSON.parse(savedPillars))
    if (savedIdea) setIdea(JSON.parse(savedIdea))
    if (savedName) setName(savedName)
  }, [])

  const getPillarName = (id: string) => pillars.find(p => p.id === id)?.name ?? 'Unknown'
  const getPillarColor = (id: string) => pillars.find(p => p.id === id)?.color ?? '#2563EB'

  const saveOnboardingData = async () => {
    if (!user) return
    setLoading(true)
    try {
      await supabase.from('users').upsert({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name,
      })

      // Check if pillars already saved (handles re-entry into onboarding)
      const { data: existingPillars } = await supabase
        .from('pillars')
        .select('id, name')
        .eq('user_id', user.id)

      let savedPillars = existingPillars ?? []

      if (savedPillars.length === 0) {
        // Don't pass local IDs — let Supabase generate real UUIDs
        const { data: inserted, error: pillarsError } = await supabase
          .from('pillars')
          .insert(pillars.map(p => ({ user_id: user.id, name: p.name, color: p.color })))
          .select('id, name')

        if (pillarsError) {
          console.error('Failed to save pillars:', pillarsError.message)
          setLoading(false)
          return
        }
        savedPillars = inserted ?? []
      }

      // Save idea if provided — match pillar by name to get real DB id
      if (idea) {
        const { data: existingIdeas } = await supabase
          .from('ideas')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        if (!existingIdeas || existingIdeas.length === 0) {
          const localPillar = pillars.find(p => p.id === idea.pillarId)
          const dbPillar = savedPillars.find(
            (p: { id: string; name: string }) => p.name === localPillar?.name
          )
          await supabase.from('ideas').insert({
            user_id: user.id,
            pillar_id: dbPillar?.id ?? null,
            title: idea.title,
            stage: 'Idea',
          })
        }
      }

      localStorage.removeItem('onboarding_name')
      localStorage.removeItem('onboarding_pillars')
      localStorage.removeItem('onboarding_idea')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving onboarding data:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
      <div className="max-w-4xl w-full">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          className="text-[38px] font-bold text-[#0F172A] mb-3 text-center tracking-[-0.02em]"
        >
          Welcome to CreatorOS{name ? `, ${name}` : ''}!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.12 }}
          className="text-[18px] text-[#64748B] mb-12 text-center"
        >
          Here's a preview of your content pipeline.
        </motion.p>

        {/* Pipeline columns — each bounces in one by one */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {COLUMNS.map((col, i) => (
            <motion.div
              key={col}
              initial={{ opacity: 0, y: 36, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...bouncySpring, delay: 0.2 + i * 0.12 }}
              className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl p-4 min-h-[140px]"
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: i === 0 ? '#2563EB' : '#CBD5E1' }}
                />
                <h3 className="font-semibold text-[#0F172A] text-sm tracking-[-0.01em]">{col}</h3>
              </div>

              {col === 'Idea' && idea ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...bouncySpring, delay: 0.2 + 0.12 + 0.1 }}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-3"
                  style={{ borderLeftWidth: 3, borderLeftColor: getPillarColor(idea.pillarId) }}
                >
                  <p className="text-sm font-medium text-[#0F172A] leading-snug mb-1">
                    {idea.title}
                  </p>
                  <p className="text-xs text-[#64748B]">{getPillarName(idea.pillarId)}</p>
                </motion.div>
              ) : col === 'Idea' ? (
                <p className="text-xs text-[#CBD5E1]">No ideas yet</p>
              ) : (
                <p className="text-xs text-[#CBD5E1]">Empty</p>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.75 }}
          className="flex justify-center"
        >
          <ShimmerButton
            onClick={saveOnboardingData}
            disabled={loading}
            className="px-10 py-4 text-[16px]"
          >
            {loading ? 'Setting up your workspace...' : 'Enter Dashboard →'}
          </ShimmerButton>
        </motion.div>
      </div>
    </div>
  )
}
