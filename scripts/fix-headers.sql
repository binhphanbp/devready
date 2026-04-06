-- ============================================================
-- DEVREADY: Fix "## Câu trả lời" headers in sample_answer
-- Chạy script này trong Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/nchvuilqifremlohuvva/sql/new
-- ============================================================

-- BƯỚC 1: Kiểm tra bao nhiêu câu cần fix
SELECT COUNT(*) as can_fix 
FROM questions 
WHERE sample_answer LIKE '## Câu trả lời%';

-- BƯỚC 2: Preview kết quả transform (xem trước)
SELECT 
  id,
  LEFT(sample_answer, 100) as truoc,
  LEFT(
    LTRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(sample_answer, E'^## Câu trả lời mẫu[^\n]*\n+', '', ''),
        E'^## Câu trả lời[^\n]*\n+', '', ''
      )
    ), 
    100
  ) as sau
FROM questions
WHERE sample_answer LIKE '## Câu trả lời%'
LIMIT 5;

-- BƯỚC 3: Thực hiện fix tất cả
UPDATE questions
SET sample_answer = LTRIM(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      sample_answer,
      E'^## Câu trả lời mẫu[^\n]*\n+',
      '',
      ''
    ),
    E'^## Câu trả lời[^\n]*\n+',
    '',
    ''
  )
)
WHERE sample_answer LIKE '## Câu trả lời%';

-- BƯỚC 4: Verify — Số câu còn lại sau fix
SELECT COUNT(*) as con_lai FROM questions WHERE sample_answer LIKE '## Câu trả lời%';

-- BƯỚC 5: Final quality stats
SELECT 
  c.name as category,
  COUNT(q.id) as total,
  AVG(LENGTH(q.sample_answer))::INT as avg_length,
  SUM(CASE WHEN q.sample_answer LIKE '## Câu trả lời%' THEN 1 ELSE 0 END) as old_format,
  SUM(CASE WHEN q.sample_answer LIKE '%```%' THEN 1 ELSE 0 END) as has_code,
  SUM(CASE WHEN q.sample_answer LIKE '%https://%' THEN 1 ELSE 0 END) as has_source
FROM questions q
JOIN categories c ON q.category_id = c.id
GROUP BY c.name
ORDER BY c.name;
