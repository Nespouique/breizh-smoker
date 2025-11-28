import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ifxeettkasrlnofkmwuy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmeGVldHRrYXNybG5vZmttd3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTQ3NDEsImV4cCI6MjA3OTY5MDc0MX0.C0fCq_ui57wmRitaJHhtel7WvI5p2dsbTT-_yhF37Mg'

export const supabase = createClient(supabaseUrl, supabaseKey)
