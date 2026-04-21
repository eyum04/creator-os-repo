import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const client = createClient(supabaseUrl, supabaseAnonKey)

export const supabase = client

export function useSupabaseClient() {
  return client
}
