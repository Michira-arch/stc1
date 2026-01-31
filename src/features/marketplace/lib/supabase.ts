
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://njzdblwjpuogbjujrxrw.supabase.co'
const supabaseAnonKey = 'sb_publishable_hWJUlDww4kgl4FYJPMT3Lg_1QvuJy9D'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
