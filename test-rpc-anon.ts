import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data: questions } = await supabase.from('questions').select('id, view_count').order('view_count', { ascending: false }).limit(1)
  const q_id = questions![0].id
  
  // Call RPC
  console.log('Sending RPC');
  const { error, data } = await supabase.rpc('increment_question_view_count', { q_id });
  console.log('Error:', error);
  console.log('Data:', data);
}
test()
