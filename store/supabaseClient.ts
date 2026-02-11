import { createClient } from '@supabase/supabase-js'
import { Database } from '../types' // We will auto-generate or manually define this in types.ts

// These should be in your .env file
const supabaseUrl = "https://njzdblwjpuogbjujrxrw.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qemRibHdqcHVvZ2JqdWpyeHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDIyODcsImV4cCI6MjA4NDgxODI4N30.dyu_C-7Y3lJ0r4TNsxppgm1rabPepttnaTypJzRkjC4"

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase URL or Anon Key. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || ''
)
