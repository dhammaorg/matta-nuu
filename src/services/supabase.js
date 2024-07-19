import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yrurtmpzqkbrrhzaylcg.supabase.co'
// This is an anon key, it can be safely share, because every table is protected
// with row level security i.e. only the user linked to that row can edit it
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydXJ0bXB6cWticnJoemF5bGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE0MDAwODgsImV4cCI6MjAzNjk3NjA4OH0.XN_1nQAmLoLuNCXgvdYyDC3xmbXwLHbA1UEZ6U28Ncg'
const options = {
  schema: 'public',
  headers: { 'x-my-custom-header': 'my-app-name' },
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
}
const supabase = createClient(supabaseUrl, supabaseAnonKey, options)
export default supabase
