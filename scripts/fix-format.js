const { createClient } = require('@supabase/supabase-js');

const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jaHZ1aWxxaWZyZW1sb2h1dnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzk4NjgsImV4cCI6MjA4OTc1NTg2OH0.iyf8fWzbCDeSWPawyTvLUkMCUV4_aKxroXiOOEpoAqE';
const s = createClient('https://nchvuilqifremlohuvva.supabase.co', ANON_KEY);

function checkQuality(q) {
  const issues = [];
  const ans = (q.sample_answer || '').trim();
  const title = (q.title || '').toLowerCase();
  const content = (q.content || '').toLowerCase();

  // 1. Redundant headers
  if (/^## (Câu trả lời|Sample Answer|Trả lời)/i.test(ans)) {
    issues.push('REDUNDANT_HEADER');
  }

  // 2. Too short  
  if (ans.length < 300) issues.push(`TOO_SHORT(${ans.length})`);

  // 3. No Markdown structure
  const hasStructure = ans.includes('**') || ans.includes('- ') || ans.includes('## ') || ans.includes('1.') || ans.includes('###');
  if (!hasStructure && ans.length > 100) issues.push('NO_STRUCTURE');

  // 4. Tech questions that need code
  const techTerms = ['javascript', 'typescript', 'react', 'next.js', 'hook', 'async', 'await', 
    'promise', 'sql', 'query', 'css', 'html', 'api', 'http', 'git', 'docker', 
    'node', 'python', 'closure', 'event loop', 'redux', 'useState', 'useEffect',
    'cors', 'jwt', 'oauth', 'webpack', 'vite', 'tailwind', 'prisma', 'graphql'];
  const needsCode = techTerms.some(t => title.includes(t) || content.includes(t));
  if (needsCode && !ans.includes('```')) issues.push('MISSING_CODE');

  // 5. Generic content
  const badPhrases = ['placeholder', 'TODO', 'lorem ipsum', 'chưa có nội dung', 'coming soon', 'insert answer'];
  for (const p of badPhrases) {
    if (ans.toLowerCase().includes(p)) issues.push(`GENERIC(${p})`);
  }

  // 6. Repetitive content
  const lines = ans.split('\n').map(l => l.trim()).filter(l => l.length > 15);
  const unique = new Set(lines);
  if (lines.length > 6 && unique.size < lines.length * 0.6) issues.push('REPETITIVE');

  // 7. Thin technical answer
  if (needsCode && ans.length < 500) issues.push(`THIN_TECH(${ans.length})`);

  return {
    issues,
    hasSource: ans.includes('https://'),
    hasCode: ans.includes('```'),
    length: ans.length,
    needsCode
  };
}

async function main() {
  console.log('🔍 KIỂM TRA CHẤT LƯỢNG TOÀN DIỆN - DEVREADY FLASHCARDS');
  console.log('='.repeat(65));

  const { data: questions, error } = await s
    .from('questions')
    .select('id, title, content, sample_answer, difficulty, category_id, official_source')
    .order('category_id')
    .limit(600);

  if (error) { console.error('Lỗi fetch:', error.message); return; }

  const { data: categories } = await s.from('categories').select('id, name');
  const catMap = {};
  (categories || []).forEach(c => catMap[c.id] = c.name);

  console.log(`\nTổng số câu hỏi: ${questions.length}`);

  const byCategory = {};
  const allIssues = [];

  for (const q of questions) {
    const cat = catMap[q.category_id] || 'Unknown';
    if (!byCategory[cat]) byCategory[cat] = { total: 0, withIssues: 0, noCode: 0, noSource: 0, tooShort: 0, redundant: 0 };
    byCategory[cat].total++;

    const { issues, hasSource, hasCode, length, needsCode } = checkQuality(q);

    if (!hasSource) byCategory[cat].noSource++;
    if (issues.includes('MISSING_CODE')) byCategory[cat].noCode++;
    if (issues.some(i => i.startsWith('TOO_SHORT') || i.startsWith('THIN_'))) byCategory[cat].tooShort++;
    if (issues.includes('REDUNDANT_HEADER')) byCategory[cat].redundant++;

    if (issues.length > 0) {
      byCategory[cat].withIssues++;
      allIssues.push({ cat, title: q.title, issues, length, hasCode, hasSource, needsCode, id: q.id });
    }
  }

  // ─── Category Report ───────────────────────────────────────
  console.log('\n📊 THEO CATEGORY:');
  console.log('─'.repeat(82));
  console.log(
    'Category'.padEnd(22) + 'Total'.padEnd(7) + 'Issues'.padEnd(9) +
    'Redundant'.padEnd(11) + 'NoCode'.padEnd(9) + 'Short'.padEnd(8) + 'NoSource'
  );
  console.log('─'.repeat(82));

  let totals = { total: 0, issues: 0, redundant: 0, noCode: 0, short: 0, noSource: 0 };
  for (const [cat, d] of Object.entries(byCategory).sort()) {
    const pct = Math.round(d.withIssues / d.total * 100);
    const status = d.redundant > 0 ? '❌' : d.withIssues > d.total * 0.3 ? '⚠️' : '✅';
    console.log(
      `${status} ${cat.padEnd(20)}` +
      String(d.total).padEnd(7) +
      `${d.withIssues}(${pct}%)`.padEnd(9) +
      String(d.redundant).padEnd(11) +
      String(d.noCode).padEnd(9) +
      String(d.tooShort).padEnd(8) +
      String(d.noSource)
    );
    totals.total += d.total;
    totals.issues += d.withIssues;
    totals.redundant += d.redundant;
    totals.noCode += d.noCode;
    totals.short += d.tooShort;
    totals.noSource += d.noSource;
  }
  console.log('─'.repeat(82));
  console.log(
    '   TỔNG CỘNG'.padEnd(22) +
    String(totals.total).padEnd(7) +
    String(totals.issues).padEnd(9) +
    String(totals.redundant).padEnd(11) +
    String(totals.noCode).padEnd(9) +
    String(totals.short).padEnd(8) +
    String(totals.noSource)
  );

  // ─── Issue Breakdown ───────────────────────────────────────
  console.log('\n📈 PHÂN LOẠI VẤN ĐỀ:');
  const typeCounts = {};
  for (const item of allIssues) {
    for (const iss of item.issues) {
      const key = iss.replace(/\(.*\)/, '');
      typeCounts[key] = (typeCounts[key] || 0) + 1;
    }
  }
  for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    const pct = Math.round(count / questions.length * 100);
    const status = ['REDUNDANT_HEADER', 'TOO_SHORT', 'NO_STRUCTURE'].includes(type) ? '❌' : '⚠️';
    console.log(`  ${status} ${type.padEnd(28)} ${String(count).padEnd(6)} câu (${pct}%)`);
  }

  // ─── Critical Cases ────────────────────────────────────────
  const critical = allIssues.filter(i =>
    i.issues.includes('REDUNDANT_HEADER') ||
    i.issues.some(x => x.startsWith('TOO_SHORT')) ||
    i.issues.includes('NO_STRUCTURE') ||
    i.issues.includes('REPETITIVE')
  );

  console.log(`\n🚨 CRITICAL CASES (cần fix ngay): ${critical.length} câu`);
  if (critical.length === 0) {
    console.log('  ✅ Không có vấn đề nghiêm trọng!');
  } else {
    critical.slice(0, 20).forEach((item, idx) => {
      console.log(`\n  ${idx + 1}. [${item.cat}] "${item.title}"`);
      console.log(`     Issues: ${item.issues.join(' | ')}`);
      console.log(`     Độ dài: ${item.length} | Code: ${item.hasCode} | Source: ${item.hasSource}`);
    });
    if (critical.length > 20) console.log(`\n  ... và ${critical.length - 20} câu nữa`);
  }

  // ─── Sample Content Per Category ──────────────────────────
  console.log('\n\n📖 XEM MẪU NỘI DUNG (1 câu/category):');
  const seen = new Set();
  for (const q of questions) {
    const cat = catMap[q.category_id] || 'Unknown';
    if (seen.has(cat)) continue;
    seen.add(cat);
    const ans = (q.sample_answer || '').trim();
    console.log(`\n${'═'.repeat(65)}`);
    console.log(`[${cat}] ${q.title}`);
    console.log(`${'─'.repeat(65)}`);
    console.log(ans.substring(0, 500));
    if (ans.length > 500) console.log(`\n...(total ${ans.length} chars)`);
    console.log(`\n→ Code: ${ans.includes('```')} | Source: ${ans.includes('https://')} | Dài: ${ans.length} chars`);
  }

  // ─── Final Verdict ─────────────────────────────────────────
  const criticalCount = totals.redundant + critical.filter(i => i.issues.some(x => x.startsWith('TOO_SHORT') || x === 'NO_STRUCTURE')).length;
  const qualityScore = Math.round((1 - (criticalCount / totals.total)) * 100);
  const warningScore = Math.round((1 - (totals.issues / totals.total)) * 100);

  console.log('\n\n' + '═'.repeat(65));
  console.log('🎯 KẾT QUẢ KIỂM TRA CUỐI CÙNG');
  console.log('═'.repeat(65));
  console.log(`  Điểm CRITICAL (❌):  ${qualityScore}/100 (issues cần fix ngay)`);
  console.log(`  Điểm WARNING  (⚠️):  ${warningScore}/100 (bao gồm cả issues nhỏ)`);
  console.log(`  Missing code blocks: ${totals.noCode}/${totals.total} câu kỹ thuật thiếu code`);
  console.log(`  Missing sources:     ${totals.noSource}/${totals.total} câu thiếu source URL`);

  if (criticalCount === 0) {
    console.log('\n  ✅ ĐÁNH GIÁ: KHÔNG CÓ VẤN ĐỀ NGHIÊM TRỌNG');
    if (warningScore >= 85) console.log('  ✅ Nội dung đạt chuẩn chuyên nghiệp tốt');
    else console.log('  ⚠️  Một số điểm nhỏ cần cải thiện (chủ yếu code examples và sources)');
  } else {
    console.log(`\n  ❌ CẦN FIX: ${criticalCount} câu có vấn đề nghiêm trọng`);
  }
  console.log('═'.repeat(65));
}

main().catch(console.error);
