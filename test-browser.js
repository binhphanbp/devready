const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const q_id = 'c8a61004-ae00-42e0-84d0-5aaf0911f924' // Migrations: Zero-downtime schema changes? (currently 498)
  console.log("Calling rpc for", q_id)
  const { data, error } = await supabase.rpc('increment_question_view_count', { q_id })
  console.log("Result:", data, "Error:", error)
}
run()
