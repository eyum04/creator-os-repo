'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSupabaseClient } from '@/lib/supabase'
import { ShimmerButton } from '@/components/ui/ShimmerButton'
import { FocusInput } from '@/components/ui/FocusInput'

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 }
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: spring } }

export default function SettingsPage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const supabase = useSupabaseClient()
  const router = useRouter()

  const [creatorName, setCreatorName] = useState('')
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('users').select('name').eq('id', user.id).single()
      .then(({ data }) => {
        if (data?.name) {
          setCreatorName(data.name)
          setEditName(data.name)
        }
      })
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveName = async () => {
    if (!user || !editName.trim()) return
    setSaving(true)
    await supabase.from('users').update({ name: editName.trim() }).eq('id', user.id)
    setCreatorName(editName.trim())
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => signOut({ redirectUrl: '/' })

  const initials = (user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? '?').toUpperCase()

  return (
    <div className="max-w-xl mx-auto px-8 py-10">
      <motion.div initial="hidden" animate="visible" variants={container}>

        {/* Header */}
        <motion.div variants={item} className="mb-8">
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">Settings</h1>
          <p className="text-[#64748B] text-[15px] mt-1">Manage your account and preferences.</p>
        </motion.div>

        {/* Profile card */}
        <motion.div variants={item} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B] mb-5">Profile</p>

          {/* Avatar + basic info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-[#2563EB] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[20px] font-bold">{initials}</span>
            </div>
            <div>
              <p className="font-semibold text-[16px] text-[#0F172A]">
                {user?.firstName ?? ''} {user?.lastName ?? ''}
              </p>
              <p className="text-[13px] text-[#64748B]">{user?.emailAddresses?.[0]?.emailAddress}</p>
            </div>
          </div>

          {/* Creator name */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-[#64748B] block mb-2">
              Creator name
            </label>
            <p className="text-[12px] text-[#94A3B8] mb-3">This is the name shown on your dashboard greeting.</p>
            <div className="flex gap-3">
              <FocusInput
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Your creator name"
                className="flex-1"
              />
              <ShimmerButton
                onClick={handleSaveName}
                disabled={saving || editName.trim() === creatorName}
                className="py-3 px-5 text-[14px] whitespace-nowrap"
              >
                {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
              </ShimmerButton>
            </div>
          </div>
        </motion.div>

        {/* Plan card */}
        <motion.div variants={item} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B] mb-4">Plan</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[15px] text-[#0F172A]">Free Tier</p>
              <p className="text-[13px] text-[#64748B] mt-0.5">50 ideas · 5 pillars · Manual calendar</p>
            </div>
            <span className="px-3 py-1 bg-[#EFF6FF] text-[#2563EB] text-[12px] font-semibold rounded-full border border-[#BFDBFE]">
              Free
            </span>
          </div>
        </motion.div>

        {/* Account card */}
        <motion.div variants={item} className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B] mb-4">Account</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
              <span className="text-[14px] text-[#64748B]">Email</span>
              <span className="text-[14px] font-medium text-[#0F172A]">{user?.emailAddresses?.[0]?.emailAddress}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[14px] text-[#64748B]">Member since</span>
              <span className="text-[14px] font-medium text-[#0F172A]">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : '—'}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#F1F5F9]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium text-[#EF4444] hover:bg-[#FEF2F2] border border-[#FECACA] hover:border-[#EF4444] transition-all duration-150"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Log out
            </button>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
