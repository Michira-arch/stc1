import { createClient } from '@supabase/supabase-js'
import { Database } from '../types' // We will auto-generate or manually define this in types.ts

// These should be in your .env file
const supabaseUrl = "https://njzdblwjpuogbjujrxrw.supabase.co"
const supabaseAnonKey = "sb_publishable_hWJUlDww4kgl4FYJPMT3Lg_1QvuJy9D"

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase URL or Anon Key. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || ''
)
