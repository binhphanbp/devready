import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data: questions } = await supabase.from('questions').select('id, view_count').limit(1)
  const q_id = questions![0].id
  const old_count = questions![0].view_count
  console.log('Old count:', old_count);
  const { error } = await supabase.rpc('increment_question_view_count', { q_id });
  if (error) console.error('Error:', error);
  const { data: newQ } = await supabase.from('questions').select('view_count').eq('id', q_id)
  console.log('New count:', newQ![0].view_count);
}
test()
