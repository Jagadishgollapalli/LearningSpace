import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://vxfmwlnsjtaikbgyvxms.supabase.co'
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Zm13bG5zanRhaWtiZ3l2eG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTYyNDYsImV4cCI6MjA5MzY5MjI0Nn0.cSlhBYAAFOXpZlpQjNbvWPD2_PEdGsY6kJN8wloNm3s'
export const BUCKET = 'note-files'

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY)
