const { createClient } = require('@supabase/supabase-js');
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jaHZ1aWxxaWZyZW1sb2h1dnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzk4NjgsImV4cCI6MjA4OTc1NTg2OH0.iyf8fWzbCDeSWPawyTvLUkMCUV4_aKxroXiOOEpoAqE';
const s = createClient('https://nchvuilqifremlohuvva.supabase.co', ANON_KEY);

async function testDirectUpdate() {
  // Test updating a SPECIFIC row to see if it works or silently fails
  const testId = '6276e9c9-9fc7-4bdb-aedc-fd05444c5fb4'; // var/let/const question
  
  // Get current value
  const { data: before } = await s.from('questions').select('sample_answer').eq('id', testId).single();
  console.log('BEFORE (first 80):', JSON.stringify(before?.sample_answer?.substring(0, 80)));
  
  // Try to update (remove ## Câu trả lời header)
  const cleaned = before?.sample_answer?.replace(/^## Câu trả lời\s*\n+/, '').trimStart();
  console.log('CLEANED (first 80):', JSON.stringify(cleaned?.substring(0, 80)));
  
  const { data: updateResult, error: updateErr, count } = await s
    .from('questions')
    .update({ sample_answer: cleaned })
    .eq('id', testId)
    .select();
  
  console.log('Update error:', updateErr?.message || 'none');
  console.log('Update result:', JSON.stringify(updateResult));
  
  // Re-fetch to verify
  const { data: after } = await s.from('questions').select('sample_answer').eq('id', testId).single();
  console.log('AFTER (first 80):', JSON.stringify(after?.sample_answer?.substring(0, 80)));
  console.log('Updated?', !after?.sample_answer?.startsWith('## Câu trả lời'));
}

testDirectUpdate().catch(console.error);
