export const MAJOR_OPTIONS = [
  { value: 'cntt', label: 'Công nghệ thông tin (CNTT)' },
  { value: 'udpm', label: 'Ứng dụng phần mềm (UDPM)' },
  { value: 'lttbdd', label: 'Lập trình thiết bị di động' },
  { value: 'tkdh', label: 'Thiết kế đồ hoạ' },
  { value: 'tkweb', label: 'Thiết kế website' },
  { value: 'mmt', label: 'Mạng máy tính (MMT)' },
  { value: 'qtdn', label: 'Quản trị doanh nghiệp' },
  { value: 'tmdt', label: 'Thương mại điện tử' },
  { value: 'other', label: 'Khác...' },
] as const;

export const TARGET_ROLE_OPTIONS = [
  { value: 'frontend', label: 'Frontend Developer' },
  { value: 'backend', label: 'Backend Developer' },
  { value: 'fullstack', label: 'Fullstack Developer' },
  { value: 'mobile', label: 'Mobile Developer' },
  { value: 'devops', label: 'DevOps Engineer' },
  { value: 'data', label: 'Data Engineer / Analyst' },
  { value: 'qa', label: 'QA / Tester' },
  { value: 'uiux', label: 'UI/UX Designer' },
  { value: 'other', label: 'Khác...' },
] as const;

export const EDUCATION_YEARS_OPTIONS = [
  { value: '1', label: 'Năm 1' },
  { value: '2', label: 'Năm 2' },
  { value: '3', label: 'Năm 3' },
  { value: '4', label: 'Năm 4' },
  { value: 'graduated', label: 'Đã tốt nghiệp' },
] as const;
