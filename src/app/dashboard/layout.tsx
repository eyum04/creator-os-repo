'use client'

import { useAuth, useUser, useClerk } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LogoMark } from '@/components/ui/LogoMark'
import { AppProvider, useAppContext } from './_context'

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 }

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h4a1 1 0 001-1v-3h2v3a1 1 0 001 1h4a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  )
}

function PipelineIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function PillarsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  )
}

function ShotListIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 010 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h3a1 1 0 010 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h3a1 1 0 010 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h3a1 1 0 110 2H4a1 1 0 01-1-1zm6-12a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[16px] h-[16px]">
      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
    </svg>
  )
}

const NAV = [
  { href: '/dashboard',          label: 'Home',           Icon: HomeIcon,      exact: true },
  { href: '/dashboard/pipeline', label: 'Ideas Pipeline', Icon: PipelineIcon,  exact: false },
  { href: '/dashboard/pillars',  label: 'Pillars',        Icon: PillarsIcon,   exact: false },
  { href: '/dashboard/calendar', label: 'Calendar',       Icon: CalendarIcon,  exact: false },
  { href: '/dashboard/shots',    label: 'Shot Lists',     Icon: ShotListIcon,  exact: false },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const { pillars, ideaCount } = useAppContext()
  const { signOut } = useClerk()
  const { user } = useUser()
  const usagePct = Math.min((ideaCount / 50) * 100, 100)

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const handleLogout = () => signOut({ redirectUrl: '/' })

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 pt-5 pb-6 hover:opacity-80 transition-opacity duration-150">
        <LogoMark size={26} />
        <span className="font-bold text-[#0F172A] dark:text-white text-[16px] tracking-tight">CreatorOS</span>
      </Link>

      {/* Nav */}
      <nav className="px-3 space-y-0.5 flex-shrink-0">
        {NAV.map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={[
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150',
                active
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] hover:text-[#0F172A] dark:hover:text-white',
              ].join(' ')}
            >
              <Icon />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* My Pillars */}
      {pillars.length > 0 && (
        <div className="px-5 mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8] dark:text-[#475569] mb-2.5">My Pillars</p>
          <div className="space-y-1.5">
            {pillars.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom section */}
      <div className="mt-auto px-3 pb-4 space-y-1">
        {/* Settings */}
        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className={[
            'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150',
            isActive('/dashboard/settings', false)
              ? 'bg-[#2563EB] text-white'
              : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] hover:text-[#0F172A] dark:hover:text-white',
          ].join(' ')}
        >
          <SettingsIcon />
          Settings
        </Link>

        {/* Usage meter */}
        <div className="px-2 pt-3 pb-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-[#94A3B8]">Ideas used</span>
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">{ideaCount}/50</span>
          </div>
          <div className="h-1.5 bg-[#E2E8F0] dark:bg-[#334155] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#2563EB] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${usagePct}%` }}
              transition={spring}
            />
          </div>
          <p className="text-[10px] text-[#94A3B8] mt-1.5">Free tier · 50 ideas max</p>
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-2.5 px-3 pt-3 border-t border-[#E2E8F0] dark:border-[#334155]">
          <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-bold">
              {(user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? '?').toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#0F172A] dark:text-white truncate">{user?.firstName ?? 'Account'}</p>
            <p className="text-[11px] text-[#94A3B8] truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#450a0a] transition-colors duration-150 flex-shrink-0"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Shell ────────────────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  const { signOut } = useClerk()
  const router = useRouter()
  const { pillars, loadingPillars } = useAppContext()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push('/sign-in')
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (!loadingPillars && isSignedIn && pillars.length === 0) {
      router.push('/onboarding/welcome')
    }
  }, [loadingPillars, isSignedIn, pillars.length, router])

  // Show loading until auth + onboarding check both resolve
  if (!isLoaded || !isSignedIn || loadingPillars || pillars.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-[#0F172A]">
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

  const handleLogout = () => signOut({ redirectUrl: '/' })

  return (
    <div className="flex h-screen bg-white dark:bg-[#0F172A] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[240px] flex-shrink-0 bg-[#F8F9FA] dark:bg-[#1E293B] border-r border-[#E2E8F0] dark:border-[#334155]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={spring}
              className="fixed left-0 top-0 h-full w-[240px] bg-[#F8F9FA] dark:bg-[#1E293B] border-r border-[#E2E8F0] dark:border-[#334155] z-50 md:hidden"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] dark:border-[#334155] flex-shrink-0">
          {/* Left: hamburger on mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#334155] text-[#64748B] dark:text-[#94A3B8] md:hidden"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <Link href="/dashboard" className="flex items-center gap-2 md:hidden hover:opacity-80 transition-opacity duration-150">
              <LogoMark size={22} />
              <span className="font-bold text-[#0F172A] dark:text-white text-[15px]">CreatorOS</span>
            </Link>
          </div>

          {/* Right: logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[#450a0a] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#FECACA] transition-all duration-150"
          >
            <LogoutIcon />
            Log out
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

// ─── Layout export ─────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <Shell>{children}</Shell>
    </AppProvider>
  )
}
