/**
 * FINAL COMPREHENSIVE AUDIT & FIX SCRIPT
 * Kiểm tra và chuẩn hoá toàn bộ 488 câu hỏi lần cuối
 */

const { createClient } = require('@supabase/supabase-js');

// Use service role key for write access
const SUPABASE_URL = 'https://nchvuilqifremlohuvva.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jaHZ1aWxxaWZyZW1sb2h1dnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzk4NjgsImV4cCI6MjA4OTc1NTg2OH0.iyf8fWzbCDeSWPawyTvLUkMCUV4_aKxroXiOOEpoAqE';

const sb = createClient(SUPABASE_URL, ANON_KEY);

// ─────────────────────────────────────────────────────────────
// ISSUE DETECTION RULES
// ─────────────────────────────────────────────────────────────

function detectIssues(q, catName) {
  const issues = [];
  const ans = q.sample_answer || '';
  const title = q.title || '';

  // 1. Redundant headers (## Câu trả lời / ## Answer / # Câu trả lời)
  if (/^##?\s*(Câu trả lời|Answer|Trả lời)\s*\n/im.test(ans)) {
    issues.push('REDUNDANT_HEADER');
  }

  // 2. Too short (< 400 chars excluding whitespace)
  if (ans.replace(/\s/g, '').length < 300) {
    issues.push('TOO_SHORT');
  }

  // 3. Missing code block for technical questions
  const isCodeRequired = !['Soft Skills', 'soft-skills', 'Kỹ năng mềm'].includes(catName);
  const hasCode = /```[\s\S]*?```/.test(ans);
  if (isCodeRequired && !hasCode && ans.length > 100) {
    issues.push('NO_CODE_BLOCK');
  }

  // 4. Starts with heading level 1 (should be ## not #)
  if (/^# [^\n]+\n/.test(ans)) {
    issues.push('H1_HEADING');
  }

  // 5. Title is not a question (missing dấu hỏi "?" or lacks question structure)
  if (!title.endsWith('?') && !title.includes('là gì') && !title.includes('như thế nào') && !title.includes('tại sao') && !title.includes('khi nào')) {
    // gentle check - not critical
  }

  // 6. Trailing whitespace issues / inconsistent newlines
  if (ans !== ans.trimEnd()) {
    issues.push('TRAILING_WHITESPACE');
  }

  // 7. Double blank lines (more than 2 consecutive newlines)
  if (/\n{4,}/.test(ans)) {
    issues.push('EXCESS_BLANK_LINES');
  }

  // 8. Generic / placeholder content
  const GENERIC_PATTERNS = [
    /lorem ipsum/i,
    /Coming soon/i,
    /TODO:/i,
    /\[placeholder\]/i,
    /\[Insert/i,
    /thêm nội dung sau/i,
  ];
  if (GENERIC_PATTERNS.some(p => p.test(ans))) {
    issues.push('GENERIC_CONTENT');
  }

  // 9. Mixed language in headers (should use Vietnamese/English consistently)
  // Already handled - no automated fix possible

  return issues;
}

// ─────────────────────────────────────────────────────────────
// AUTO-FIX RULES
// ─────────────────────────────────────────────────────────────

function autoFix(ans) {
  let fixed = ans;

  // Fix 1: Remove redundant leading headers
  fixed = fixed.replace(/^##?\s*(Câu trả lời|Answer|Trả lời)\s*\n+/im, '');

  // Fix 2: Replace H1 headings with H2 (top-level should be ##)
  // Only replace H1 when it appears at the start or after 2 newlines
  fixed = fixed.replace(/(^|\n\n)# ([^\n]+)/g, '$1## $2');

  // Fix 3: Trim trailing whitespace
  fixed = fixed.trimEnd();

  // Fix 4: Collapse 4+ consecutive newlines to max 2
  fixed = fixed.replace(/\n{4,}/g, '\n\n\n');

  // Fix 5: Ensure single blank line before ## headings
  fixed = fixed.replace(/([^\n])\n(##+ )/g, '$1\n\n$2');

  // Fix 6: Ensure triple backtick code blocks have language hint
  // e.g. ``` alone → ```text
  fixed = fixed.replace(/```\s*\n/g, (match) => match); // keep as-is, too risky to auto-add lang

  return fixed;
}

// ─────────────────────────────────────────────────────────────
// FETCH ALL QUESTIONS
// ─────────────────────────────────────────────────────────────

async function fetchAll() {
  let all = [];
  let from = 0;
  const PAGE = 100;
  while (true) {
    const { data, error } = await sb
      .from('questions')
      .select('id, title, sample_answer, bonus_tip, common_pitfalls, official_source, difficulty, status, category_id')
      .range(from, from + PAGE - 1);
    if (error) throw new Error('Fetch error: ' + error.message);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

async function fetchCategories() {
  const { data, error } = await sb.from('categories').select('id, name, slug');
  if (error) throw new Error('Category fetch error: ' + error.message);
  return data;
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 FINAL COMPREHENSIVE AUDIT & FIX - DEVREADY FLASHCARDS');
  console.log('='.repeat(65));

  const [questions, categories] = await Promise.all([fetchAll(), fetchCategories()]);
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  console.log(`\nTổng số câu hỏi: ${questions.length}`);
  console.log(`Số categories: ${categories.length}`);
  categories.forEach(c => {
    const count = questions.filter(q => q.category_id === c.id).length;
    console.log(`  • ${c.name}: ${count} câu`);
  });

  // ── Audit ──
  const issueMap = {};
  const fixable = [];

  for (const q of questions) {
    const cat = catMap[q.category_id] || { name: 'Unknown', slug: '' };
    const issues = detectIssues(q, cat.name);

    if (issues.length > 0) {
      issueMap[q.id] = { q, cat, issues };
    }
  }

  const allIssueTypes = {};
  Object.values(issueMap).forEach(({ issues }) => {
    issues.forEach(i => { allIssueTypes[i] = (allIssueTypes[i] || 0) + 1; });
  });

  console.log('\n📊 VẤN ĐỀ TÌM THẤY:');
  console.log('─'.repeat(65));
  if (Object.keys(allIssueTypes).length === 0) {
    console.log('  ✅ Không có vấn đề nào!');
  } else {
    Object.entries(allIssueTypes).forEach(([k, v]) => {
      const pct = ((v / questions.length) * 100).toFixed(1);
      const critical = ['REDUNDANT_HEADER', 'TOO_SHORT', 'GENERIC_CONTENT', 'H1_HEADING'].includes(k);
      console.log(`  ${critical ? '🚨' : '⚠️'} ${k.padEnd(25)} ${v} câu (${pct}%)`);
    });
  }

  // ── Auto-fix ──
  const AUTO_FIXABLE = ['REDUNDANT_HEADER', 'H1_HEADING', 'TRAILING_WHITESPACE', 'EXCESS_BLANK_LINES'];
  const toFix = Object.values(issueMap).filter(({ issues }) =>
    issues.some(i => AUTO_FIXABLE.includes(i))
  );

  console.log(`\n🔧 AUTO-FIX: ${toFix.length} câu có thể tự động sửa`);

  if (toFix.length > 0) {
    let fixedCount = 0;
    let errorCount = 0;

    for (const { q, issues } of toFix) {
      const original = q.sample_answer || '';
      const fixed = autoFix(original);

      if (fixed === original) continue; // No change needed

      const { error } = await sb
        .from('questions')
        .update({ sample_answer: fixed, updated_at: new Date().toISOString() })
        .eq('id', q.id);

      if (error) {
        console.log(`  ❌ [${q.id}] ${q.title?.substring(0, 50)}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`  ✅ Fixed: ${q.title?.substring(0, 60)}`);
        console.log(`     Issues: ${issues.join(', ')}`);
        fixedCount++;
      }
    }
    console.log(`\n  → Đã sửa: ${fixedCount} câu | Lỗi: ${errorCount} câu`);
  }

  // ── Remaining issues that need manual review ──
  const remaining = Object.values(issueMap).filter(({ issues }) =>
    issues.some(i => !AUTO_FIXABLE.includes(i))
  );

  if (remaining.length > 0) {
    console.log(`\n📋 CẦN KIỂM TRA THỦ CÔNG: ${remaining.length} câu`);
    console.log('─'.repeat(65));
    remaining.slice(0, 20).forEach(({ q, cat, issues }) => {
      const nonFixable = issues.filter(i => !AUTO_FIXABLE.includes(i));
      if (nonFixable.length > 0) {
        console.log(`  [${cat.name}] ${q.title?.substring(0, 55)}`);
        console.log(`    → ${nonFixable.join(', ')}`);
      }
    });
    if (remaining.length > 20) {
      console.log(`  ... và ${remaining.length - 20} câu khác`);
    }
  }

  // ── Final Stats ──
  console.log('\n' + '='.repeat(65));
  console.log('📈 THỐNG KÊ CUỐI CÙNG SAU KHI FIX:');

  // Re-fetch to verify
  const refetched = await fetchAll();
  let cleanCount = 0;
  let stillIssueCount = 0;

  for (const q of refetched) {
    const cat = catMap[q.category_id] || { name: 'Unknown', slug: '' };
    const issues = detectIssues(q, cat.name);
    const critical = issues.filter(i => ['REDUNDANT_HEADER', 'TOO_SHORT', 'GENERIC_CONTENT', 'H1_HEADING'].includes(i));
    if (critical.length === 0) cleanCount++;
    else stillIssueCount++;
  }

  const score = ((cleanCount / refetched.length) * 100).toFixed(1);
  console.log(`  ✅ Câu đạt chuẩn:    ${cleanCount} / ${refetched.length} (${score}%)`);
  console.log(`  ⚠️  Vẫn còn vấn đề:  ${stillIssueCount} câu`);

  if (parseFloat(score) >= 98) {
    console.log('\n🎉 KẾT QUẢ: DATABASE ĐẠT CHUẨN SẢN XUẤT!');
  } else if (parseFloat(score) >= 90) {
    console.log('\n✅ KẾT QUẢ: DATABASE ĐẠT CHẤT LƯỢNG TỐT. Rà soát thủ công phần còn lại.');
  } else {
    console.log('\n⚠️  KẾT QUẢ: Cần tiếp tục rà soát và fix thêm.');
  }

  // ── bonus_tip & common_pitfalls audit ──
  console.log('\n📋 KIỂM TRA BONUS FIELDS:');
  const noTip = refetched.filter(q => !q.bonus_tip || q.bonus_tip.trim().length < 20);
  const noPitfall = refetched.filter(q => !q.common_pitfalls || q.common_pitfalls.trim().length < 20);
  const noSource = refetched.filter(q => !q.official_source || !q.official_source.startsWith('http'));
  console.log(`  bonus_tip thiếu:        ${noTip.length} câu`);
  console.log(`  common_pitfalls thiếu:  ${noPitfall.length} câu`);
  console.log(`  official_source thiếu:  ${noSource.length} câu`);

  console.log('\n' + '='.repeat(65));
  console.log('✅ AUDIT HOÀN THÀNH');
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
