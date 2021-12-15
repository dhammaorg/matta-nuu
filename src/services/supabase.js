import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yrurtmpzqkbrrhzaylcg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzOTQ3NzIzNSwiZXhwIjoxOTU1MDUzMjM1fQ.06nzTqNHDLk0yGyk_D3wgjvHJeEZXpHQ26Rct36kcq0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
export default supabase
