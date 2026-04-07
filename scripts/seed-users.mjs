// Seed 80 realistic Vietnamese users via Supabase Management API
// Run: node scripts/seed-users.mjs

const SUPABASE_URL = 'https://nchvuilqifremlohuvva.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jaHZ1aWxxaWZyZW1sb2h1dnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzk4NjgsImV4cCI6MjA4OTc1NTg2OH0.iyf8fWzbCDeSWPawyTvLUkMCUV4_aKxroXiOOEpoAqE';

// We need service_role key for admin operations
// For now, we'll use the SQL approach via the Supabase Dashboard API

// This script generates the SQL and copies to clipboard
const users = [
  { name: 'Nguyen Minh Duc', user: 'minh.duc', school: 'FPT Polytechnic', major: 'Ky thuat phan mem', role: 'Frontend Developer', year: 3, streak: 12 },
  { name: 'Tran Thi Ngoc Linh', user: 'ngoclinh.tran', school: 'UIT - DHQG TPHCM', major: 'Khoa hoc may tinh', role: 'Backend Developer', year: 2, streak: 5 },
  { name: 'Le Hoang Nam', user: 'hoangnam.le', school: 'DH Bach Khoa HN', major: 'Cong nghe thong tin', role: 'Fullstack Developer', year: 4, streak: 22 },
  { name: 'Pham Quoc Bao', user: 'quocbao.pham', school: 'FPT University', major: 'He thong thong tin', role: 'DevOps Engineer', year: 3, streak: 8 },
  { name: 'Hoang Thi Mai', user: 'maihoang.99', school: 'DH Ton Duc Thang', major: 'Thiet ke Web', role: 'UI/UX Designer', year: 2, streak: 3 },
  { name: 'Huynh Van Tuan', user: 'tuanhuynh.dev', school: 'HCMUT', major: 'Ky thuat phan mem', role: 'Backend Developer', year: 4, streak: 18 },
  { name: 'Vo Thanh Phong', user: 'thanhphong.vo', school: 'RMIT Vietnam', major: 'Khoa hoc du lieu', role: 'Data Engineer', year: 3, streak: 7 },
  { name: 'Dang Thi Ha', user: 'hadang.2k3', school: 'DH SPKT TPHCM', major: 'Cong nghe thong tin', role: 'Frontend Developer', year: 2, streak: 0 },
  { name: 'Bui Duc Huy', user: 'duchuy.bui', school: 'DH Duy Tan', major: 'An toan thong tin', role: 'Cloud Engineer', year: 3, streak: 14 },
  { name: 'Do Van Khanh', user: 'vankhanh.do', school: 'DH Hutech', major: 'Mang may tinh', role: 'DevOps Engineer', year: 4, streak: 9 },
  { name: 'Nguyen Thi Phuong', user: 'phuongnguyen.03', school: 'FPT Polytechnic', major: 'Thiet ke Web', role: 'Frontend Developer', year: 2, streak: 1 },
  { name: 'Tran Quang Hieu', user: 'quanghieu.tran', school: 'HCMUS', major: 'Ky thuat phan mem', role: 'Fullstack Developer', year: 3, streak: 25 },
  { name: 'Le Van Tai', user: 'vantai.le', school: 'DH Cong Nghe', major: 'Tri tue nhan tao', role: 'Software Engineer', year: 4, streak: 11 },
  { name: 'Pham Thi Thao', user: 'thaopham.dev', school: 'DH KHTN TPHCM', major: 'Khoa hoc may tinh', role: 'QA Engineer', year: 2, streak: 6 },
  { name: 'Hoang Duc Thinh', user: 'ducthinh.hoang', school: 'FPT University', major: 'He thong thong tin', role: 'Backend Developer', year: 3, streak: 16 },
  { name: 'Nguyen Van Long', user: 'vanlong.nguyen', school: 'DH Bach Khoa HN', major: 'Ky thuat phan mem', role: 'Software Engineer', year: 4, streak: 20 },
  { name: 'Tran Thi Anh', user: 'anhtran.2k4', school: 'UIT - DHQG TPHCM', major: 'An toan thong tin', role: 'Cloud Engineer', year: 1, streak: 2 },
  { name: 'Le Quoc Cuong', user: 'quoccuong.le', school: 'HCMUT', major: 'Cong nghe thong tin', role: 'Backend Developer', year: 3, streak: 13 },
  { name: 'Pham Van Son', user: 'vanson.pham', school: 'DH Ton Duc Thang', major: 'Khoa hoc du lieu', role: 'Data Engineer', year: 4, streak: 7 },
  { name: 'Vo Thi Trang', user: 'trangg.vo', school: 'RMIT Vietnam', major: 'Thiet ke Web', role: 'UI/UX Designer', year: 2, streak: 4 },
  { name: 'Nguyen Thanh Dat', user: 'thanhdat.ng', school: 'FPT Polytechnic', major: 'Ky thuat phan mem', role: 'Frontend Developer', year: 3, streak: 17 },
  { name: 'Dang Quoc Viet', user: 'quocviet.dang', school: 'DH Duy Tan', major: 'He thong thong tin', role: 'Fullstack Developer', year: 4, streak: 10 },
  { name: 'Bui Thi Lan', user: 'lanbui.03', school: 'DH SPKT TPHCM', major: 'Cong nghe thong tin', role: 'QA Engineer', year: 2, streak: 1 },
  { name: 'Ho Van Phuc', user: 'vanphuc.ho', school: 'DH Hutech', major: 'Mang may tinh', role: 'DevOps Engineer', year: 3, streak: 8 },
  { name: 'Ngo Thi My', user: 'myy.ngo', school: 'DH Greenwich Vietnam', major: 'Thiet ke Web', role: 'UI/UX Designer', year: 1, streak: 0 },
  { name: 'Nguyen Huu Khoi', user: 'huukhoi.ng', school: 'FPT University', major: 'Tri tue nhan tao', role: 'Software Engineer', year: 4, streak: 28 },
  { name: 'Tran Van Hung', user: 'vanhung.tran', school: 'HCMUS', major: 'An toan thong tin', role: 'Cloud Engineer', year: 3, streak: 6 },
  { name: 'Le Thi Thy', user: 'thyle.2k3', school: 'DH KHTN TPHCM', major: 'Khoa hoc may tinh', role: 'Backend Developer', year: 2, streak: 3 },
  { name: 'Pham Duc Quan', user: 'ducquan.pham', school: 'DH Bach Khoa HN', major: 'Ky thuat phan mem', role: 'Fullstack Developer', year: 4, streak: 15 },
  { name: 'Hoang Van Giang', user: 'vangiang.hoang', school: 'UIT - DHQG TPHCM', major: 'He thong thong tin', role: 'Data Engineer', year: 3, streak: 9 },
  { name: 'Nguyen Thi Ngoc', user: 'ngocnguyen.04', school: 'FPT Polytechnic', major: 'Thiet ke Web', role: 'Frontend Developer', year: 2, streak: 2 },
  { name: 'Tran Duc Manh', user: 'ducmanh.tran', school: 'HCMUT', major: 'Cong nghe thong tin', role: 'Software Engineer', year: 4, streak: 19 },
  { name: 'Le Van Nghia', user: 'vannghia.le', school: 'DH Ton Duc Thang', major: 'An toan thong tin', role: 'DevOps Engineer', year: 3, streak: 11 },
  { name: 'Pham Thi Huong', user: 'huongpham.99', school: 'DH Cong Nghe', major: 'Khoa hoc du lieu', role: 'QA Engineer', year: 2, streak: 4 },
  { name: 'Vo Quoc Tien', user: 'quoctien.vo', school: 'RMIT Vietnam', major: 'Ky thuat phan mem', role: 'Backend Developer', year: 3, streak: 14 },
  { name: 'Nguyen Van Huy', user: 'vanhuy.nguyen', school: 'FPT University', major: 'Tri tue nhan tao', role: 'Software Engineer', year: 4, streak: 23 },
  { name: 'Dang Thi Kim', user: 'kimdang.2k4', school: 'DH SPKT TPHCM', major: 'Thiet ke Web', role: 'UI/UX Designer', year: 1, streak: 0 },
  { name: 'Bui Van Thanh', user: 'vanthanh.bui', school: 'DH Duy Tan', major: 'He thong thong tin', role: 'Fullstack Developer', year: 3, streak: 7 },
  { name: 'Do Thi Ngan', user: 'ngando.03', school: 'DH Greenwich Vietnam', major: 'Cong nghe thong tin', role: 'Frontend Developer', year: 2, streak: 5 },
  { name: 'Ho Quoc Tuan', user: 'quoctuan.ho', school: 'DH Hutech', major: 'Mang may tinh', role: 'Cloud Engineer', year: 4, streak: 10 },
  { name: 'Nguyen Thi Bich', user: 'bichnguyen.dev', school: 'FPT Polytechnic', major: 'Khoa hoc may tinh', role: 'Backend Developer', year: 3, streak: 8 },
  { name: 'Tran Van Phat', user: 'vanphat.tran', school: 'HCMUS', major: 'Ky thuat phan mem', role: 'Fullstack Developer', year: 4, streak: 21 },
  { name: 'Le Duc Kien', user: 'duckien.le', school: 'UIT - DHQG TPHCM', major: 'An toan thong tin', role: 'DevOps Engineer', year: 3, streak: 12 },
  { name: 'Pham Van Trung', user: 'vantrung.pham', school: 'DH Bach Khoa HN', major: 'Khoa hoc du lieu', role: 'Data Engineer', year: 4, streak: 6 },
  { name: 'Hoang Thi Diem', user: 'diemhoang.2k3', school: 'DH KHTN TPHCM', major: 'Thiet ke Web', role: 'UI/UX Designer', year: 2, streak: 1 },
  { name: 'Nguyen Quoc Phong', user: 'quocphong.ng', school: 'FPT University', major: 'He thong thong tin', role: 'Software Engineer', year: 3, streak: 16 },
  { name: 'Tran Thi Hoa', user: 'hoatran.04', school: 'HCMUT', major: 'Cong nghe thong tin', role: 'QA Engineer', year: 2, streak: 3 },
  { name: 'Le Van Duy', user: 'vanduy.le', school: 'DH Ton Duc Thang', major: 'Ky thuat phan mem', role: 'Frontend Developer', year: 4, streak: 18 },
  { name: 'Pham Quoc An', user: 'quocan.pham', school: 'RMIT Vietnam', major: 'Tri tue nhan tao', role: 'Software Engineer', year: 3, streak: 9 },
  { name: 'Vo Van Nhan', user: 'vannhan.vo', school: 'DH Duy Tan', major: 'An toan thong tin', role: 'Cloud Engineer', year: 4, streak: 7 },
  { name: 'Nguyen Duc Thang', user: 'ducthang.ng', school: 'FPT Polytechnic', major: 'Mang may tinh', role: 'DevOps Engineer', year: 3, streak: 15 },
  { name: 'Dang Van Lam', user: 'vanlam.dang', school: 'DH SPKT TPHCM', major: 'Ky thuat phan mem', role: 'Backend Developer', year: 4, streak: 11 },
  { name: 'Bui Thi Hien', user: 'hienbui.dev', school: 'DH Hutech', major: 'Khoa hoc may tinh', role: 'QA Engineer', year: 2, streak: 2 },
  { name: 'Ho Van Binh', user: 'vanbinh.ho', school: 'DH Greenwich Vietnam', major: 'Cong nghe thong tin', role: 'Fullstack Developer', year: 3, streak: 8 },
  { name: 'Ngo Duc Minh', user: 'ducminh.ngo', school: 'DH Cong Nghe', major: 'Khoa hoc du lieu', role: 'Data Engineer', year: 4, streak: 13 },
  { name: 'Nguyen Thi Thanh', user: 'thanhnguyen.03', school: 'FPT University', major: 'Thiet ke Web', role: 'Frontend Developer', year: 2, streak: 4 },
  { name: 'Tran Quoc Hung', user: 'quochung.tran', school: 'HCMUT', major: 'He thong thong tin', role: 'Software Engineer', year: 4, streak: 20 },
  { name: 'Le Thi Hoa', user: 'hoale.2k4', school: 'UIT - DHQG TPHCM', major: 'An toan thong tin', role: 'Backend Developer', year: 1, streak: 0 },
  { name: 'Pham Van Hau', user: 'vanhau.pham', school: 'DH Bach Khoa HN', major: 'Ky thuat phan mem', role: 'Fullstack Developer', year: 4, streak: 17 },
  { name: 'Hoang Quoc Dat', user: 'quocdat.hoang', school: 'DH Ton Duc Thang', major: 'Tri tue nhan tao', role: 'Software Engineer', year: 3, streak: 10 },
  { name: 'Nguyen Van Khang', user: 'vankhang.ng', school: 'FPT Polytechnic', major: 'Cong nghe thong tin', role: 'DevOps Engineer', year: 3, streak: 6 },
  { name: 'Tran Thi Cam', user: 'camtran.99', school: 'DH KHTN TPHCM', major: 'Khoa hoc may tinh', role: 'QA Engineer', year: 2, streak: 1 },
  { name: 'Le Quoc Hung', user: 'quochung.le', school: 'RMIT Vietnam', major: 'Ky thuat phan mem', role: 'Backend Developer', year: 4, streak: 14 },
  { name: 'Pham Thi Dung', user: 'dungpham.dev', school: 'DH Duy Tan', major: 'He thong thong tin', role: 'Frontend Developer', year: 2, streak: 5 },
  { name: 'Vo Duc Anh', user: 'ducanh.vo', school: 'HCMUS', major: 'An toan thong tin', role: 'Cloud Engineer', year: 3, streak: 9 },
  { name: 'Nguyen Thi Ha My', user: 'hamy.nguyen', school: 'FPT University', major: 'Thiet ke Web', role: 'UI/UX Designer', year: 2, streak: 3 },
  { name: 'Dang Quoc Thinh', user: 'quocthinh.dang', school: 'DH SPKT TPHCM', major: 'Khoa hoc du lieu', role: 'Data Engineer', year: 4, streak: 11 },
  { name: 'Bui Van Quang', user: 'vanquang.bui', school: 'DH Hutech', major: 'Mang may tinh', role: 'DevOps Engineer', year: 3, streak: 7 },
  { name: 'Do Duc Hieu', user: 'duchieu.do', school: 'DH Greenwich Vietnam', major: 'Ky thuat phan mem', role: 'Software Engineer', year: 4, streak: 16 },
  { name: 'Ho Thi Thu', user: 'thuho.2k3', school: 'DH Cong Nghe', major: 'Cong nghe thong tin', role: 'Frontend Developer', year: 2, streak: 2 },
  { name: 'Ngo Van Phu', user: 'vanphu.ngo', school: 'FPT Polytechnic', major: 'Tri tue nhan tao', role: 'Backend Developer', year: 3, streak: 8 },
  { name: 'Nguyen Duc Truong', user: 'ductruong.ng', school: 'HCMUT', major: 'He thong thong tin', role: 'Fullstack Developer', year: 4, streak: 19 },
  { name: 'Tran Van Loc', user: 'vanloc.tran', school: 'UIT - DHQG TPHCM', major: 'An toan thong tin', role: 'Cloud Engineer', year: 3, streak: 5 },
  { name: 'Le Thi Mai Anh', user: 'maianh.le', school: 'DH Bach Khoa HN', major: 'Khoa hoc may tinh', role: 'QA Engineer', year: 2, streak: 3 },
  { name: 'Pham Quoc Vinh', user: 'quocvinh.pham', school: 'DH Ton Duc Thang', major: 'Ky thuat phan mem', role: 'Software Engineer', year: 4, streak: 22 },
  { name: 'Hoang Van Tri', user: 'vantri.hoang', school: 'RMIT Vietnam', major: 'Khoa hoc du lieu', role: 'Data Engineer', year: 3, streak: 6 },
  { name: 'Nguyen Thi Dao', user: 'daonguyen.04', school: 'FPT University', major: 'Thiet ke Web', role: 'UI/UX Designer', year: 1, streak: 0 },
  { name: 'Tran Duc Phuc', user: 'ducphuc.tran', school: 'DH Duy Tan', major: 'Cong nghe thong tin', role: 'Backend Developer', year: 4, streak: 13 },
  { name: 'Le Van Hien', user: 'vanhien.le', school: 'DH SPKT TPHCM', major: 'He thong thong tin', role: 'Frontend Developer', year: 3, streak: 9 },
  { name: 'Pham Thi Yen', user: 'yenpham.2k3', school: 'DH KHTN TPHCM', major: 'Khoa hoc may tinh', role: 'Software Engineer', year: 2, streak: 4 },
];

// Generate SQL for batch insert (to be run in Supabase SQL Editor)
function generateSQL() {
  const values = users.map(u => {
    const e = (s) => s.replace(/'/g, "''");
    const daysAgo = Math.floor(Math.random() * 80) + 1;
    const lastActive = Math.floor(Math.random() * 7);
    return `    ('${e(u.name)}', '${e(u.user)}', '${e(u.school)}', '${e(u.major)}', '${e(u.role)}', ${u.year}, ${u.streak}, ${daysAgo}, ${lastActive})`;
  }).join(',\n');

  return `DO $$
DECLARE
  new_id UUID;
  r RECORD;
BEGIN
  FOR r IN (
    SELECT * FROM (VALUES
${values}
    ) AS t(full_name, username, school, major, target_role, edu_year, streak, days_ago, last_active_offset)
  )
  LOOP
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, aud, role
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      r.username || '@gmail.com',
      crypt('DevReady@2026', gen_salt('bf')),
      NOW() - (r.days_ago || ' days')::interval,
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', r.full_name),
      NOW() - (r.days_ago || ' days')::interval,
      NOW(),
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO new_id;

    UPDATE public.profiles SET
      full_name = r.full_name,
      username = r.username,
      school_name = r.school,
      major = r.major,
      target_role = r.target_role,
      education_years = r.edu_year,
      streak_count = r.streak,
      last_active_date = CURRENT_DATE - r.last_active_offset,
      onboarding_completed = true,
      role = 'user',
      updated_at = NOW()
    WHERE id = new_id;
  END LOOP;

  RAISE NOTICE 'Done! Created 80 realistic Vietnamese users.';
END $$;`;
}

const sql = generateSQL();
// Write to file for easy copy
const fs = await import('fs');
fs.writeFileSync('scripts/generated-seed.sql', sql, 'utf8');
console.log('Generated SQL written to scripts/generated-seed.sql');
console.log(`Total users: ${users.length}`);
console.log('First 3 names:', users.slice(0, 3).map(u => u.name).join(', '));
