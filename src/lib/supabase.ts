import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'
import { useMemo } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function useSupabaseClient() {
  const { getToken } = useAuth()

  return useMemo(
    () =>
      createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          fetch: async (url: RequestInfo | URL, options: RequestInit = {}) => {
            const token = await getToken({ template: 'supabase' })
            const headers = new Headers(options.headers)
            if (token) headers.set('Authorization', `Bearer ${token}`)
            return fetch(url, { ...options, headers })
          },
        },
      }),
    [getToken]
  )
}
