-- =============================================
-- Step 1: Delete the fake "U xx" users
-- =============================================
DELETE FROM auth.users
WHERE id IN (
  SELECT id FROM public.profiles
  WHERE full_name LIKE 'U %'
    AND username LIKE 'u%_%'
);

-- =============================================
-- Step 2: Insert 80 realistic Vietnamese users
-- =============================================
DO $$
DECLARE
  new_id UUID;
  r RECORD;
BEGIN
  FOR r IN (
    SELECT * FROM (VALUES
      ('Nguyen Minh Duc','minh.duc','Nguyen Minh Duc','FPT Polytechnic','Ky thuat phan mem','Frontend Developer',3,12),
      ('Tran Thi Ngoc Linh','ngoclinh.tran','Tran Thi Ngoc Linh','UIT - DHQG TPHCM','Khoa hoc may tinh','Backend Developer',2,5),
      ('Le Hoang Nam','hoangnam.le','Le Hoang Nam','DH Bach Khoa HN','Cong nghe thong tin','Fullstack Developer',4,22),
      ('Pham Quoc Bao','quocbao.pham','Pham Quoc Bao','FPT University','He thong thong tin','DevOps Engineer',3,8),
      ('Hoang Thi Mai','maihoang.99','Hoang Thi Mai','DH Ton Duc Thang','Thiet ke Web','UI/UX Designer',2,3),
      ('Huynh Van Tuan','tuanhuynh.dev','Huynh Van Tuan','HCMUT','Ky thuat phan mem','Backend Developer',4,18),
      ('Vo Thanh Phong','thanhphong.vo','Vo Thanh Phong','RMIT Vietnam','Khoa hoc du lieu','Data Engineer',3,7),
      ('Dang Thi Ha','hadang.2k3','Dang Thi Ha','DH SPKT TPHCM','Cong nghe thong tin','Frontend Developer',2,0),
      ('Bui Duc Huy','duchuy.bui','Bui Duc Huy','DH Duy Tan','An toan thong tin','Cloud Engineer',3,14),
      ('Do Van Khanh','vankhanh.do','Do Van Khanh','DH Hutech','Mang may tinh','DevOps Engineer',4,9),
      ('Nguyen Thi Phuong','phuongnguyen.03','Nguyen Thi Phuong','FPT Polytechnic','Thiet ke Web','Frontend Developer',2,1),
      ('Tran Quang Hieu','quanghieu.tran','Tran Quang Hieu','HCMUS','Ky thuat phan mem','Fullstack Developer',3,25),
      ('Le Van Tai','vantai.le','Le Van Tai','DH Cong Nghe','Tri tue nhan tao','Software Engineer',4,11),
      ('Pham Thi Thao','thaopham.dev','Pham Thi Thao','DH KHTN TPHCM','Khoa hoc may tinh','QA Engineer',2,6),
      ('Hoang Duc Thinh','ducthinh.hoang','Hoang Duc Thinh','FPT University','He thong thong tin','Backend Developer',3,16),
      ('Nguyen Van Long','vanlong.nguyen','Nguyen Van Long','DH Bach Khoa HN','Ky thuat phan mem','Software Engineer',4,20),
      ('Tran Thi Anh','anhtran.2k4','Tran Thi Anh','UIT - DHQG TPHCM','An toan thong tin','Cloud Engineer',1,2),
      ('Le Quoc Cuong','quoccuong.le','Le Quoc Cuong','HCMUT','Cong nghe thong tin','Backend Developer',3,13),
      ('Pham Van Son','vanson.pham','Pham Van Son','DH Ton Duc Thang','Khoa hoc du lieu','Data Engineer',4,7),
      ('Vo Thi Trang','trangg.vo','Vo Thi Trang','RMIT Vietnam','Thiet ke Web','UI/UX Designer',2,4),
      ('Nguyen Thanh Dat','thanhdat.ng','Nguyen Thanh Dat','FPT Polytechnic','Ky thuat phan mem','Frontend Developer',3,17),
      ('Dang Quoc Viet','quocviet.dang','Dang Quoc Viet','DH Duy Tan','He thong thong tin','Fullstack Developer',4,10),
      ('Bui Thi Lan','lanbui.03','Bui Thi Lan','DH SPKT TPHCM','Cong nghe thong tin','QA Engineer',2,1),
      ('Ho Van Phuc','vanphuc.ho','Ho Van Phuc','DH Hutech','Mang may tinh','DevOps Engineer',3,8),
      ('Ngo Thi My','myy.ngo','Ngo Thi My','DH Greenwich Vietnam','Thiet ke Web','UI/UX Designer',1,0),
      ('Nguyen Huu Khoi','huukhoi.ng','Nguyen Huu Khoi','FPT University','Tri tue nhan tao','Software Engineer',4,28),
      ('Tran Van Hung','vanhung.tran','Tran Van Hung','HCMUS','An toan thong tin','Cloud Engineer',3,6),
      ('Le Thi Thy','thyle.2k3','Le Thi Thy','DH KHTN TPHCM','Khoa hoc may tinh','Backend Developer',2,3),
      ('Pham Duc Quan','ducquan.pham','Pham Duc Quan','DH Bach Khoa HN','Ky thuat phan mem','Fullstack Developer',4,15),
      ('Hoang Van Giang','vangiang.hoang','Hoang Van Giang','UIT - DHQG TPHCM','He thong thong tin','Data Engineer',3,9),
      ('Nguyen Thi Ngoc','ngocnguyen.04','Nguyen Thi Ngoc','FPT Polytechnic','Thiet ke Web','Frontend Developer',2,2),
      ('Tran Duc Manh','ducmanh.tran','Tran Duc Manh','HCMUT','Cong nghe thong tin','Software Engineer',4,19),
      ('Le Van Nghia','vannghia.le','Le Van Nghia','DH Ton Duc Thang','An toan thong tin','DevOps Engineer',3,11),
      ('Pham Thi Huong','huongpham.99','Pham Thi Huong','DH Cong Nghe','Khoa hoc du lieu','QA Engineer',2,4),
      ('Vo Quoc Tien','quoctien.vo','Vo Quoc Tien','RMIT Vietnam','Ky thuat phan mem','Backend Developer',3,14),
      ('Nguyen Van Huy','vanhuy.nguyen','Nguyen Van Huy','FPT University','Tri tue nhan tao','Software Engineer',4,23),
      ('Dang Thi Kim','kimdang.2k4','Dang Thi Kim','DH SPKT TPHCM','Thiet ke Web','UI/UX Designer',1,0),
      ('Bui Van Thanh','vanthanh.bui','Bui Van Thanh','DH Duy Tan','He thong thong tin','Fullstack Developer',3,7),
      ('Do Thi Ngan','ngando.03','Do Thi Ngan','DH Greenwich Vietnam','Cong nghe thong tin','Frontend Developer',2,5),
      ('Ho Quoc Tuan','quoctuan.ho','Ho Quoc Tuan','DH Hutech','Mang may tinh','Cloud Engineer',4,10),
      ('Nguyen Thi Bich','bichnguyen.dev','Nguyen Thi Bich','FPT Polytechnic','Khoa hoc may tinh','Backend Developer',3,8),
      ('Tran Van Phat','vanphat.tran','Tran Van Phat','HCMUS','Ky thuat phan mem','Fullstack Developer',4,21),
      ('Le Duc Kien','duckien.le','Le Duc Kien','UIT - DHQG TPHCM','An toan thong tin','DevOps Engineer',3,12),
      ('Pham Van Trung','vantrung.pham','Pham Van Trung','DH Bach Khoa HN','Khoa hoc du lieu','Data Engineer',4,6),
      ('Hoang Thi Diem','diemhoang.2k3','Hoang Thi Diem','DH KHTN TPHCM','Thiet ke Web','UI/UX Designer',2,1),
      ('Nguyen Quoc Phong','quocphong.ng','Nguyen Quoc Phong','FPT University','He thong thong tin','Software Engineer',3,16),
      ('Tran Thi Hoa','hoatran.04','Tran Thi Hoa','HCMUT','Cong nghe thong tin','QA Engineer',2,3),
      ('Le Van Duy','vanduy.le','Le Van Duy','DH Ton Duc Thang','Ky thuat phan mem','Frontend Developer',4,18),
      ('Pham Quoc An','quocan.pham','Pham Quoc An','RMIT Vietnam','Tri tue nhan tao','Software Engineer',3,9),
      ('Vo Van Nhan','vannhan.vo','Vo Van Nhan','DH Duy Tan','An toan thong tin','Cloud Engineer',4,7),
      ('Nguyen Duc Thang','ducthang.ng','Nguyen Duc Thang','FPT Polytechnic','Mang may tinh','DevOps Engineer',3,15),
      ('Dang Van Lam','vanlam.dang','Dang Van Lam','DH SPKT TPHCM','Ky thuat phan mem','Backend Developer',4,11),
      ('Bui Thi Hien','hienbui.dev','Bui Thi Hien','DH Hutech','Khoa hoc may tinh','QA Engineer',2,2),
      ('Ho Van Binh','vanbinh.ho','Ho Van Binh','DH Greenwich Vietnam','Cong nghe thong tin','Fullstack Developer',3,8),
      ('Ngo Duc Minh','ducminh.ngo','Ngo Duc Minh','DH Cong Nghe','Khoa hoc du lieu','Data Engineer',4,13),
      ('Nguyen Thi Thanh','thanhnguyen.03','Nguyen Thi Thanh','FPT University','Thiet ke Web','Frontend Developer',2,4),
      ('Tran Quoc Hung','quochung.tran','Tran Quoc Hung','HCMUT','He thong thong tin','Software Engineer',4,20),
      ('Le Thi Hoa','hoale.2k4','Le Thi Hoa','UIT - DHQG TPHCM','An toan thong tin','Backend Developer',1,0),
      ('Pham Van Hau','vanhau.pham','Pham Van Hau','DH Bach Khoa HN','Ky thuat phan mem','Fullstack Developer',4,17),
      ('Hoang Quoc Dat','quocdat.hoang','Hoang Quoc Dat','DH Ton Duc Thang','Tri tue nhan tao','Software Engineer',3,10),
      ('Nguyen Van Khang','vankhang.ng','Nguyen Van Khang','FPT Polytechnic','Cong nghe thong tin','DevOps Engineer',3,6),
      ('Tran Thi Cam','camtran.99','Tran Thi Cam','DH KHTN TPHCM','Khoa hoc may tinh','QA Engineer',2,1),
      ('Le Quoc Hung','quochung.le','Le Quoc Hung','RMIT Vietnam','Ky thuat phan mem','Backend Developer',4,14),
      ('Pham Thi Dung','dungpham.dev','Pham Thi Dung','DH Duy Tan','He thong thong tin','Frontend Developer',2,5),
      ('Vo Duc Anh','ducanh.vo','Vo Duc Anh','HCMUS','An toan thong tin','Cloud Engineer',3,9),
      ('Nguyen Thi Ha My','hamy.nguyen','Nguyen Thi Ha My','FPT University','Thiet ke Web','UI/UX Designer',2,3),
      ('Dang Quoc Thinh','quocthinh.dang','Dang Quoc Thinh','DH SPKT TPHCM','Khoa hoc du lieu','Data Engineer',4,11),
      ('Bui Van Quang','vanquang.bui','Bui Van Quang','DH Hutech','Mang may tinh','DevOps Engineer',3,7),
      ('Do Duc Hieu','duchieu.do','Do Duc Hieu','DH Greenwich Vietnam','Ky thuat phan mem','Software Engineer',4,16),
      ('Ho Thi Thu','thuho.2k3','Ho Thi Thu','DH Cong Nghe','Cong nghe thong tin','Frontend Developer',2,2),
      ('Ngo Van Phu','vanphu.ngo','Ngo Van Phu','FPT Polytechnic','Tri tue nhan tao','Backend Developer',3,8),
      ('Nguyen Duc Truong','ductruong.ng','Nguyen Duc Truong','HCMUT','He thong thong tin','Fullstack Developer',4,19),
      ('Tran Van Loc','vanloc.tran','Tran Van Loc','UIT - DHQG TPHCM','An toan thong tin','Cloud Engineer',3,5),
      ('Le Thi Mai Anh','maianh.le','Le Thi Mai Anh','DH Bach Khoa HN','Khoa hoc may tinh','QA Engineer',2,3),
      ('Pham Quoc Vinh','quocvinh.pham','Pham Quoc Vinh','DH Ton Duc Thang','Ky thuat phan mem','Software Engineer',4,22),
      ('Hoang Van Tri','vantri.hoang','Hoang Van Tri','RMIT Vietnam','Khoa hoc du lieu','Data Engineer',3,6),
      ('Nguyen Thi Dao','daonguyen.04','Nguyen Thi Dao','FPT University','Thiet ke Web','UI/UX Designer',1,0),
      ('Tran Duc Phuc','ducphuc.tran','Tran Duc Phuc','DH Duy Tan','Cong nghe thong tin','Backend Developer',4,13),
      ('Le Van Hien','vanhien.le','Le Van Hien','DH SPKT TPHCM','He thong thong tin','Frontend Developer',3,9),
      ('Pham Thi Yen','yenpham.2k3','Pham Thi Yen','DH KHTN TPHCM','Khoa hoc may tinh','Software Engineer',2,4)
    ) AS t(full_name, username, display_name, school, major, target_role, edu_year, streak)
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
      NOW() - (floor(random() * 80 + 1) || ' days')::interval,
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', r.display_name),
      NOW() - (floor(random() * 80 + 1) || ' days')::interval,
      NOW(),
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO new_id;

    UPDATE public.profiles SET
      full_name = r.display_name,
      username = r.username,
      school_name = r.school,
      major = r.major,
      target_role = r.target_role,
      education_years = r.edu_year,
      streak_count = r.streak,
      last_active_date = CURRENT_DATE - (floor(random() * 7))::int,
      onboarding_completed = true,
      role = 'user',
      updated_at = NOW()
    WHERE id = new_id;
  END LOOP;

  RAISE NOTICE 'Done! Created 80 realistic users.';
END $$;

-- Verify
SELECT full_name, username, school_name, target_role, streak_count
FROM public.profiles ORDER BY created_at DESC LIMIT 15;
