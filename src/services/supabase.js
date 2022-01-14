import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yrurtmpzqkbrrhzaylcg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzOTQ3NzIzNSwiZXhwIjoxOTU1MDUzMjM1fQ.06nzTqNHDLk0yGyk_D3wgjvHJeEZXpHQ26Rct36kcq0'
const options = {
  schema: 'public',
  headers: { 'x-my-custom-header': 'my-app-name' },
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
}
const supabase = createClient(supabaseUrl, supabaseAnonKey, options)
export default supabase
