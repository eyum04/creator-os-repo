'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase'
import type { Pillar } from '@/lib/types'

interface AppContextValue {
  pillars: Pillar[]
  ideaCount: number
  loadingPillars: boolean
  refreshPillars: () => Promise<void>
  refreshIdeaCount: () => Promise<void>
}

const AppContext = createContext<AppContextValue>({
  pillars: [],
  ideaCount: 0,
  loadingPillars: true,
  refreshPillars: async () => {},
  refreshIdeaCount: async () => {},
})

export function useAppContext() {
  return useContext(AppContext)
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const [pillars, setPillars] = useState<Pillar[]>([])
  const [ideaCount, setIdeaCount] = useState(0)
  const [loadingPillars, setLoadingPillars] = useState(true)

  const refreshPillars = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('pillars')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    if (data) setPillars(data)
  }, [user])

  const refreshIdeaCount = useCallback(async () => {
    if (!user) return
    const { count } = await supabase
      .from('ideas')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    setIdeaCount(count ?? 0)
  }, [user])

  useEffect(() => {
    if (!user) return
    setLoadingPillars(true)
    Promise.all([refreshPillars(), refreshIdeaCount()]).finally(() =>
      setLoadingPillars(false)
    )
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppContext.Provider value={{ pillars, ideaCount, loadingPillars, refreshPillars, refreshIdeaCount }}>
      {children}
    </AppContext.Provider>
  )
}
