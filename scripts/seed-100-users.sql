-- =====================================================
-- Seed 100 fake users into DevReady
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================

-- Enable unaccent extension if not already enabled
CREATE EXTENSION IF NOT EXISTS unaccent;

DO $$
DECLARE
  i INTEGER;
  new_user_id UUID;
  first_names TEXT[] := ARRAY[
    'Minh', 'Hai', 'Hung', 'Dung', 'Tuan', 'Hoang', 'Long', 'Phuc', 'Duc', 'Thanh',
    'Quang', 'Bao', 'Khoa', 'Nam', 'Tung', 'Kien', 'Trung', 'Phong', 'Khoi', 'Hung',
    'An', 'Binh', 'Cuong', 'Dat', 'Giang', 'Hieu', 'Khanh', 'Lam', 'Nghia', 'Nhan',
    'Phat', 'Quan', 'Son', 'Tai', 'Thien', 'Trong', 'Vinh', 'Vu', 'Duy', 'Huy',
    'Linh', 'Thao', 'Ngoc', 'Trang', 'Mai', 'Ha', 'Lan', 'Anh', 'Phuong', 'Thy'
  ];
  display_first TEXT[] := ARRAY[
    'Minh', 'Hải', 'Hùng', 'Dũng', 'Tuấn', 'Hoàng', 'Long', 'Phúc', 'Đức', 'Thành',
    'Quang', 'Bảo', 'Khoa', 'Nam', 'Tùng', 'Kiên', 'Trung', 'Phong', 'Khôi', 'Hưng',
    'An', 'Bình', 'Cường', 'Đạt', 'Giang', 'Hiếu', 'Khánh', 'Lâm', 'Nghĩa', 'Nhân',
    'Phát', 'Quân', 'Sơn', 'Tài', 'Thiện', 'Trọng', 'Vinh', 'Vũ', 'Duy', 'Huy',
    'Linh', 'Thảo', 'Ngọc', 'Trang', 'Mai', 'Hà', 'Lan', 'Anh', 'Phương', 'Thy'
  ];
  last_names_ascii TEXT[] := ARRAY[
    'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Huynh', 'Phan', 'Vu', 'Vo', 'Dang',
    'Bui', 'Do', 'Ho', 'Ngo', 'Duong', 'Ly', 'Dao', 'Dinh', 'Luong', 'Trinh'
  ];
  last_names_vn TEXT[] := ARRAY[
    'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
    'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đào', 'Đinh', 'Lương', 'Trịnh'
  ];
  schools TEXT[] := ARRAY[
    'FPT Polytechnic', 'HCMUT', 'UIT - ĐHQG TPHCM', 'HCMUS', 'ĐH Bách Khoa HN',
    'ĐH Công Nghệ - ĐHQGHN', 'FPT University', 'RMIT Vietnam', 'ĐH SPKT TPHCM',
    'ĐH Tôn Đức Thắng', 'ĐH KHTN TPHCM', 'ĐH Kinh Tế TPHCM', 'ĐH Hutech',
    'ĐH Greenwich Vietnam', 'ĐH Duy Tân'
  ];
  majors_list TEXT[] := ARRAY[
    'Lập trình ứng dụng', 'Khoa học máy tính', 'Kỹ thuật phần mềm',
    'Hệ thống thông tin', 'An toàn thông tin', 'Trí tuệ nhân tạo',
    'Công nghệ thông tin', 'Khoa học dữ liệu', 'Mạng máy tính',
    'Thiết kế Web', 'DevOps Engineering'
  ];
  target_roles_list TEXT[] := ARRAY[
    'Frontend Developer', 'Backend Developer', 'Fullstack Developer',
    'Mobile Developer', 'DevOps Engineer', 'Data Engineer',
    'QA Engineer', 'UI/UX Designer', 'Cloud Engineer', 'Software Engineer'
  ];
  fname_idx INTEGER;
  lname_idx INTEGER;
  v_full_name TEXT;
  v_username TEXT;
  v_email TEXT;
  v_school TEXT;
  v_major TEXT;
  v_target_role TEXT;
  v_edu_year INTEGER;
  v_streak INTEGER;
  v_created TIMESTAMPTZ;
  v_last_active DATE;
  v_role TEXT;
BEGIN
  FOR i IN 1..100 LOOP
    -- Random indexes
    fname_idx := 1 + floor(random() * array_length(first_names, 1))::int;
    lname_idx := 1 + floor(random() * array_length(last_names_ascii, 1))::int;

    -- Build names
    v_full_name := last_names_vn[lname_idx] || ' ' || display_first[fname_idx];
    v_username := lower(first_names[fname_idx]) || '_' || lower(last_names_ascii[lname_idx]) || i;
    v_email := v_username || '@devready.demo';

    -- Random profile data
    v_school := schools[1 + floor(random() * array_length(schools, 1))::int];
    v_major := majors_list[1 + floor(random() * array_length(majors_list, 1))::int];
    v_target_role := target_roles_list[1 + floor(random() * array_length(target_roles_list, 1))::int];
    v_edu_year := 1 + floor(random() * 4)::int;
    v_streak := floor(random() * 45)::int;

    -- Random created date (within last 90 days)
    v_created := NOW() - (floor(random() * 90) || ' days')::interval
                       - (floor(random() * 86400) || ' seconds')::interval;
    v_last_active := (v_created + (floor(random() * (EXTRACT(EPOCH FROM (NOW() - v_created)) / 86400 + 1)) || ' days')::interval)::date;
    
    -- Random role (3% moderator, 97% user)
    v_role := CASE WHEN random() < 0.03 THEN 'moderator' ELSE 'user' END;

    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      aud,
      role
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      v_email,
      crypt('DevReady@2026', gen_salt('bf')),
      v_created,
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_full_name),
      v_created,
      NOW(),
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO new_user_id;

    -- Update the auto-created profile with realistic data
    UPDATE public.profiles
    SET
      full_name = v_full_name,
      username = v_username,
      school_name = v_school,
      major = v_major,
      target_role = v_target_role,
      education_years = v_edu_year,
      streak_count = v_streak,
      last_active_date = v_last_active,
      onboarding_completed = true,
      role = v_role,
      updated_at = NOW()
    WHERE id = new_user_id;

  END LOOP;

  RAISE NOTICE '✅ Successfully created 100 demo users!';
END $$;

-- Verify results
SELECT 
  COUNT(*) as total_profiles,
  COUNT(*) FILTER (WHERE role = 'user') as users,
  COUNT(*) FILTER (WHERE role = 'moderator') as moderators,
  COUNT(*) FILTER (WHERE role = 'admin') as admins
FROM public.profiles;
