DO $$
DECLARE
  new_id UUID;
  r RECORD;
BEGIN
  FOR r IN (
    SELECT * FROM (VALUES
    ('Nguyen Minh Duc', 'minh.duc', 'FPT Polytechnic', 'Ky thuat phan mem', 'Frontend Developer', 3, 12, 10, 4),
    ('Tran Thi Ngoc Linh', 'ngoclinh.tran', 'UIT - DHQG TPHCM', 'Khoa hoc may tinh', 'Backend Developer', 2, 5, 10, 6),
    ('Le Hoang Nam', 'hoangnam.le', 'DH Bach Khoa HN', 'Cong nghe thong tin', 'Fullstack Developer', 4, 22, 33, 5),
    ('Pham Quoc Bao', 'quocbao.pham', 'FPT University', 'He thong thong tin', 'DevOps Engineer', 3, 8, 58, 2),
    ('Hoang Thi Mai', 'maihoang.99', 'DH Ton Duc Thang', 'Thiet ke Web', 'UI/UX Designer', 2, 3, 7, 3),
    ('Huynh Van Tuan', 'tuanhuynh.dev', 'HCMUT', 'Ky thuat phan mem', 'Backend Developer', 4, 18, 31, 6),
    ('Vo Thanh Phong', 'thanhphong.vo', 'RMIT Vietnam', 'Khoa hoc du lieu', 'Data Engineer', 3, 7, 44, 5),
    ('Dang Thi Ha', 'hadang.2k3', 'DH SPKT TPHCM', 'Cong nghe thong tin', 'Frontend Developer', 2, 0, 15, 3),
    ('Bui Duc Huy', 'duchuy.bui', 'DH Duy Tan', 'An toan thong tin', 'Cloud Engineer', 3, 14, 43, 5),
    ('Do Van Khanh', 'vankhanh.do', 'DH Hutech', 'Mang may tinh', 'DevOps Engineer', 4, 9, 69, 5),
    ('Nguyen Thi Phuong', 'phuongnguyen.03', 'FPT Polytechnic', 'Thiet ke Web', 'Frontend Developer', 2, 1, 13, 1),
    ('Tran Quang Hieu', 'quanghieu.tran', 'HCMUS', 'Ky thuat phan mem', 'Fullstack Developer', 3, 25, 51, 0),
    ('Le Van Tai', 'vantai.le', 'DH Cong Nghe', 'Tri tue nhan tao', 'Software Engineer', 4, 11, 45, 6),
    ('Pham Thi Thao', 'thaopham.dev', 'DH KHTN TPHCM', 'Khoa hoc may tinh', 'QA Engineer', 2, 6, 66, 6),
    ('Hoang Duc Thinh', 'ducthinh.hoang', 'FPT University', 'He thong thong tin', 'Backend Developer', 3, 16, 9, 1),
    ('Nguyen Van Long', 'vanlong.nguyen', 'DH Bach Khoa HN', 'Ky thuat phan mem', 'Software Engineer', 4, 20, 19, 4),
    ('Tran Thi Anh', 'anhtran.2k4', 'UIT - DHQG TPHCM', 'An toan thong tin', 'Cloud Engineer', 1, 2, 32, 4),
    ('Le Quoc Cuong', 'quoccuong.le', 'HCMUT', 'Cong nghe thong tin', 'Backend Developer', 3, 13, 55, 1),
    ('Pham Van Son', 'vanson.pham', 'DH Ton Duc Thang', 'Khoa hoc du lieu', 'Data Engineer', 4, 7, 25, 0),
    ('Vo Thi Trang', 'trangg.vo', 'RMIT Vietnam', 'Thiet ke Web', 'UI/UX Designer', 2, 4, 11, 6),
    ('Nguyen Thanh Dat', 'thanhdat.ng', 'FPT Polytechnic', 'Ky thuat phan mem', 'Frontend Developer', 3, 17, 22, 2),
    ('Dang Quoc Viet', 'quocviet.dang', 'DH Duy Tan', 'He thong thong tin', 'Fullstack Developer', 4, 10, 48, 0),
    ('Bui Thi Lan', 'lanbui.03', 'DH SPKT TPHCM', 'Cong nghe thong tin', 'QA Engineer', 2, 1, 16, 3),
    ('Ho Van Phuc', 'vanphuc.ho', 'DH Hutech', 'Mang may tinh', 'DevOps Engineer', 3, 8, 25, 3),
    ('Ngo Thi My', 'myy.ngo', 'DH Greenwich Vietnam', 'Thiet ke Web', 'UI/UX Designer', 1, 0, 66, 0),
    ('Nguyen Huu Khoi', 'huukhoi.ng', 'FPT University', 'Tri tue nhan tao', 'Software Engineer', 4, 28, 20, 6),
    ('Tran Van Hung', 'vanhung.tran', 'HCMUS', 'An toan thong tin', 'Cloud Engineer', 3, 6, 15, 1),
    ('Le Thi Thy', 'thyle.2k3', 'DH KHTN TPHCM', 'Khoa hoc may tinh', 'Backend Developer', 2, 3, 38, 2),
    ('Pham Duc Quan', 'ducquan.pham', 'DH Bach Khoa HN', 'Ky thuat phan mem', 'Fullstack Developer', 4, 15, 20, 1),
    ('Hoang Van Giang', 'vangiang.hoang', 'UIT - DHQG TPHCM', 'He thong thong tin', 'Data Engineer', 3, 9, 26, 1),
    ('Nguyen Thi Ngoc', 'ngocnguyen.04', 'FPT Polytechnic', 'Thiet ke Web', 'Frontend Developer', 2, 2, 43, 3),
    ('Tran Duc Manh', 'ducmanh.tran', 'HCMUT', 'Cong nghe thong tin', 'Software Engineer', 4, 19, 51, 0),
    ('Le Van Nghia', 'vannghia.le', 'DH Ton Duc Thang', 'An toan thong tin', 'DevOps Engineer', 3, 11, 71, 0),
    ('Pham Thi Huong', 'huongpham.99', 'DH Cong Nghe', 'Khoa hoc du lieu', 'QA Engineer', 2, 4, 9, 0),
    ('Vo Quoc Tien', 'quoctien.vo', 'RMIT Vietnam', 'Ky thuat phan mem', 'Backend Developer', 3, 14, 77, 6),
    ('Nguyen Van Huy', 'vanhuy.nguyen', 'FPT University', 'Tri tue nhan tao', 'Software Engineer', 4, 23, 22, 6),
    ('Dang Thi Kim', 'kimdang.2k4', 'DH SPKT TPHCM', 'Thiet ke Web', 'UI/UX Designer', 1, 0, 25, 3),
    ('Bui Van Thanh', 'vanthanh.bui', 'DH Duy Tan', 'He thong thong tin', 'Fullstack Developer', 3, 7, 69, 4),
    ('Do Thi Ngan', 'ngando.03', 'DH Greenwich Vietnam', 'Cong nghe thong tin', 'Frontend Developer', 2, 5, 15, 3),
    ('Ho Quoc Tuan', 'quoctuan.ho', 'DH Hutech', 'Mang may tinh', 'Cloud Engineer', 4, 10, 49, 3),
    ('Nguyen Thi Bich', 'bichnguyen.dev', 'FPT Polytechnic', 'Khoa hoc may tinh', 'Backend Developer', 3, 8, 51, 5),
    ('Tran Van Phat', 'vanphat.tran', 'HCMUS', 'Ky thuat phan mem', 'Fullstack Developer', 4, 21, 46, 4),
    ('Le Duc Kien', 'duckien.le', 'UIT - DHQG TPHCM', 'An toan thong tin', 'DevOps Engineer', 3, 12, 56, 6),
    ('Pham Van Trung', 'vantrung.pham', 'DH Bach Khoa HN', 'Khoa hoc du lieu', 'Data Engineer', 4, 6, 29, 2),
    ('Hoang Thi Diem', 'diemhoang.2k3', 'DH KHTN TPHCM', 'Thiet ke Web', 'UI/UX Designer', 2, 1, 24, 6),
    ('Nguyen Quoc Phong', 'quocphong.ng', 'FPT University', 'He thong thong tin', 'Software Engineer', 3, 16, 10, 5),
    ('Tran Thi Hoa', 'hoatran.04', 'HCMUT', 'Cong nghe thong tin', 'QA Engineer', 2, 3, 38, 5),
    ('Le Van Duy', 'vanduy.le', 'DH Ton Duc Thang', 'Ky thuat phan mem', 'Frontend Developer', 4, 18, 51, 1),
    ('Pham Quoc An', 'quocan.pham', 'RMIT Vietnam', 'Tri tue nhan tao', 'Software Engineer', 3, 9, 64, 2),
    ('Vo Van Nhan', 'vannhan.vo', 'DH Duy Tan', 'An toan thong tin', 'Cloud Engineer', 4, 7, 5, 6),
    ('Nguyen Duc Thang', 'ducthang.ng', 'FPT Polytechnic', 'Mang may tinh', 'DevOps Engineer', 3, 15, 11, 5),
    ('Dang Van Lam', 'vanlam.dang', 'DH SPKT TPHCM', 'Ky thuat phan mem', 'Backend Developer', 4, 11, 19, 6),
    ('Bui Thi Hien', 'hienbui.dev', 'DH Hutech', 'Khoa hoc may tinh', 'QA Engineer', 2, 2, 1, 6),
    ('Ho Van Binh', 'vanbinh.ho', 'DH Greenwich Vietnam', 'Cong nghe thong tin', 'Fullstack Developer', 3, 8, 7, 3),
    ('Ngo Duc Minh', 'ducminh.ngo', 'DH Cong Nghe', 'Khoa hoc du lieu', 'Data Engineer', 4, 13, 60, 1),
    ('Nguyen Thi Thanh', 'thanhnguyen.03', 'FPT University', 'Thiet ke Web', 'Frontend Developer', 2, 4, 72, 3),
    ('Tran Quoc Hung', 'quochung.tran', 'HCMUT', 'He thong thong tin', 'Software Engineer', 4, 20, 65, 4),
    ('Le Thi Hoa', 'hoale.2k4', 'UIT - DHQG TPHCM', 'An toan thong tin', 'Backend Developer', 1, 0, 20, 2),
    ('Pham Van Hau', 'vanhau.pham', 'DH Bach Khoa HN', 'Ky thuat phan mem', 'Fullstack Developer', 4, 17, 61, 4),
    ('Hoang Quoc Dat', 'quocdat.hoang', 'DH Ton Duc Thang', 'Tri tue nhan tao', 'Software Engineer', 3, 10, 7, 6),
    ('Nguyen Van Khang', 'vankhang.ng', 'FPT Polytechnic', 'Cong nghe thong tin', 'DevOps Engineer', 3, 6, 38, 1),
    ('Tran Thi Cam', 'camtran.99', 'DH KHTN TPHCM', 'Khoa hoc may tinh', 'QA Engineer', 2, 1, 26, 0),
    ('Le Quoc Hung', 'quochung.le', 'RMIT Vietnam', 'Ky thuat phan mem', 'Backend Developer', 4, 14, 35, 4),
    ('Pham Thi Dung', 'dungpham.dev', 'DH Duy Tan', 'He thong thong tin', 'Frontend Developer', 2, 5, 1, 5),
    ('Vo Duc Anh', 'ducanh.vo', 'HCMUS', 'An toan thong tin', 'Cloud Engineer', 3, 9, 43, 5),
    ('Nguyen Thi Ha My', 'hamy.nguyen', 'FPT University', 'Thiet ke Web', 'UI/UX Designer', 2, 3, 20, 3),
    ('Dang Quoc Thinh', 'quocthinh.dang', 'DH SPKT TPHCM', 'Khoa hoc du lieu', 'Data Engineer', 4, 11, 46, 0),
    ('Bui Van Quang', 'vanquang.bui', 'DH Hutech', 'Mang may tinh', 'DevOps Engineer', 3, 7, 5, 1),
    ('Do Duc Hieu', 'duchieu.do', 'DH Greenwich Vietnam', 'Ky thuat phan mem', 'Software Engineer', 4, 16, 27, 3),
    ('Ho Thi Thu', 'thuho.2k3', 'DH Cong Nghe', 'Cong nghe thong tin', 'Frontend Developer', 2, 2, 5, 4),
    ('Ngo Van Phu', 'vanphu.ngo', 'FPT Polytechnic', 'Tri tue nhan tao', 'Backend Developer', 3, 8, 68, 3),
    ('Nguyen Duc Truong', 'ductruong.ng', 'HCMUT', 'He thong thong tin', 'Fullstack Developer', 4, 19, 70, 6),
    ('Tran Van Loc', 'vanloc.tran', 'UIT - DHQG TPHCM', 'An toan thong tin', 'Cloud Engineer', 3, 5, 71, 6),
    ('Le Thi Mai Anh', 'maianh.le', 'DH Bach Khoa HN', 'Khoa hoc may tinh', 'QA Engineer', 2, 3, 50, 3),
    ('Pham Quoc Vinh', 'quocvinh.pham', 'DH Ton Duc Thang', 'Ky thuat phan mem', 'Software Engineer', 4, 22, 60, 4),
    ('Hoang Van Tri', 'vantri.hoang', 'RMIT Vietnam', 'Khoa hoc du lieu', 'Data Engineer', 3, 6, 46, 1),
    ('Nguyen Thi Dao', 'daonguyen.04', 'FPT University', 'Thiet ke Web', 'UI/UX Designer', 1, 0, 69, 6),
    ('Tran Duc Phuc', 'ducphuc.tran', 'DH Duy Tan', 'Cong nghe thong tin', 'Backend Developer', 4, 13, 66, 0),
    ('Le Van Hien', 'vanhien.le', 'DH SPKT TPHCM', 'He thong thong tin', 'Frontend Developer', 3, 9, 57, 0),
    ('Pham Thi Yen', 'yenpham.2k3', 'DH KHTN TPHCM', 'Khoa hoc may tinh', 'Software Engineer', 2, 4, 64, 0)
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
END $$;