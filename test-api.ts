import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data: questions } = await supabase.from('questions').select('id, view_count').eq('is_approved', true).order('view_count', { ascending: false }).limit(5)
  console.log('Top 5 views:', questions?.map(q => q.view_count))
  
  if (questions && questions.length > 3) {
    const q_id = questions[3].id
    const old_count = questions[3].view_count
    console.log(`Incrementing question ${q_id} (old count: ${old_count})`);
    
    // Call RPC as anon user (via API, exactly like browser)
    const { error } = await supabase.rpc('increment_question_view_count', { q_id });
    if (error) {
      console.error('RPC Error:', error);
    } else {
      console.log('RPC Success!');
      const { data: newQ } = await supabase.from('questions').select('view_count').eq('id', q_id).maybeSingle();
      console.log('New count:', newQ?.view_count);
    }
  }
}
test()
