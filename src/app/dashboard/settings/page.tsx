'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabaseClient } from '@/lib/supabase'
import { useTheme } from '@/lib/theme'
import { ShimmerButton } from '@/components/ui/ShimmerButton'
import { FocusInput } from '@/components/ui/FocusInput'

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 }
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: spring } }

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  )
}

export default function SettingsPage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const [creatorName, setCreatorName] = useState('')
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const handleDeleteAccount = async () => {
    if (!user) return
    setDeleting(true)
    try {
      const { data: ideas } = await supabase.from('ideas').select('id').eq('user_id', user.id)
      const ideaIds = ideas?.map(i => i.id) ?? []
      if (ideaIds.length) {
        await supabase.from('shots').delete().in('idea_id', ideaIds)
      }
      await supabase.from('ideas').delete().eq('user_id', user.id)
      await supabase.from('pillars').delete().eq('user_id', user.id)
      await supabase.from('users').delete().eq('id', user.id)
      await user.delete()
      router.push('/')
    } catch (err) {
      console.error('Delete account failed:', err)
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const initials = (user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? '?').toUpperCase()

  return (
    <div className="max-w-xl mx-auto px-8 py-10">
      <motion.div initial="hidden" animate="visible" variants={container}>

        {/* Header */}
        <motion.div variants={item} className="mb-8">
          <h1 className="text-[28px] font-bold text-[#0F172A] dark:text-white tracking-tight">Settings</h1>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-[15px] mt-1">Manage your account and preferences.</p>
        </motion.div>

        {/* Profile card */}
        <motion.div variants={item} className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-6 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B] dark:text-[#94A3B8] mb-5">Profile</p>

          {/* Avatar + basic info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-[#2563EB] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[20px] font-bold">{initials}</span>
            </div>
            <div>
              <p className="font-semibold text-[16px] text-[#0F172A] dark:text-white">
                {user?.firstName ?? ''} {user?.lastName ?? ''}
              </p>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">{user?.emailAddresses?.[0]?.emailAddress}</p>
            </div>
          </div>

          {/* Creator name */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-[#64748B] dark:text-[#94A3B8] block mb-2">
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

        {/* Appearance card */}
        <motion.div variants={item} className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-6 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B] dark:text-[#94A3B8] mb-4">Appearance</p>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mb-4">Choose how CreatorOS looks for you.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={[
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium border transition-all duration-150',
                theme === 'light'
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-[#F8F9FA] dark:bg-[#334155] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#475569] hover:border-[#2563EB]',
              ].join(' ')}
            >
              <SunIcon />
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={[
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium border transition-all duration-150',
                theme === 'dark'
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-[#F8F9FA] dark:bg-[#334155] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#475569] hover:border-[#2563EB]',
              ].join(' ')}
            >
              <MoonIcon />
              Dark
            </button>
          </div>
        </motion.div>

        {/* Plan card */}
        <motion.div variants={item} className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-6 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B] dark:text-[#94A3B8] mb-4">Plan</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[15px] text-[#0F172A] dark:text-white">Free Tier</p>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">50 ideas · 5 pillars · Manual calendar</p>
            </div>
            <span className="px-3 py-1 bg-[#EFF6FF] dark:bg-[#1e3a5f] text-[#2563EB] text-[12px] font-semibold rounded-full border border-[#BFDBFE] dark:border-[#1d4ed8]">
              Free
            </span>
          </div>
        </motion.div>

        {/* Account card */}
        <motion.div variants={item} className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-6 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B] dark:text-[#94A3B8] mb-4">Account</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9] dark:border-[#334155]">
              <span className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">Email</span>
              <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">{user?.emailAddresses?.[0]?.emailAddress}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">Member since</span>
              <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : '—'}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#F1F5F9] dark:border-[#334155]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[#450a0a] border border-[#FECACA] dark:border-[#7f1d1d] hover:border-[#EF4444] transition-all duration-150"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Log out
            </button>
          </div>
        </motion.div>

        {/* Delete account card */}
        <motion.div variants={item} className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-6">

          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[14px] text-[#0F172A] dark:text-white">Delete account</p>
                <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">Permanently delete your account and all data.</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2.5 text-[14px] font-medium text-[#EF4444] border border-[#FECACA] dark:border-[#7f1d1d] rounded-xl hover:bg-[#FEF2F2] dark:hover:bg-[#450a0a] hover:border-[#EF4444] transition-all duration-150 flex-shrink-0 ml-4"
              >
                Delete account
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={spring}
              >
                <p className="text-[14px] font-semibold text-[#0F172A] dark:text-white mb-1">Are you absolutely sure?</p>
                <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mb-5">
                  This will permanently delete your account, all ideas, pillars, and shot lists. This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 py-2.5 px-4 rounded-xl text-[14px] font-medium border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8F9FA] dark:hover:bg-[#334155] transition-colors duration-150 disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 py-2.5 px-4 rounded-xl text-[14px] font-medium bg-[#EF4444] hover:bg-[#DC2626] text-white transition-colors duration-150 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete my account'}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>

      </motion.div>
    </div>
  )
}
