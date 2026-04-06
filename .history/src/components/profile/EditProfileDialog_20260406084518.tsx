'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Pencil,
  Loader2,
  Camera,
  User,
  AtSign,
  School,
  Calendar,
  BookOpen,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  MAJOR_OPTIONS,
  TARGET_ROLE_OPTIONS,
  EDUCATION_YEARS_OPTIONS,
  VIETNAM_UNIVERSITIES,
} from '@/lib/constants/profile-options';

interface Profile {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  school_name: string | null;
  education_years: number | null;
  major: string | null;
  target_role: string | null;
}

interface EditProfileDialogProps {
  profile: Profile | null;
  userId: string;
  userEmail: string | undefined;
}

export function EditProfileDialog({
  profile,
  userId,
  userEmail,
}: EditProfileDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);

  // Form state
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [schoolName, setSchoolName] = useState(profile?.school_name ?? '');
  const [educationYears, setEducationYears] = useState(
    profile?.education_years !== null && profile?.education_years !== undefined
      ? String(profile.education_years)
      : '',
  );
  const [major, setMajor] = useState(profile?.major ?? '');
  const [targetRole, setTargetRole] = useState(profile?.target_role ?? '');

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.avatar_url ?? null,
  );

  const initials = (fullName || userEmail || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      // Reset transient state on close
      setAvatarFile(null);
      setAvatarPreview(profile?.avatar_url ?? null);
      setAvatarError(null);
      setFullName(profile?.full_name ?? '');
      setFullNameError(null);
      setUsername(profile?.username ?? '');
      setUsernameError(null);
      setSchoolName(profile?.school_name ?? '');
      setShowSchoolSuggestions(false);
      setEducationYears(
        profile?.education_years !== null &&
          profile?.education_years !== undefined
          ? String(profile.education_years)
          : '',
      );
      setMajor(profile?.major ?? '');
      setTargetRole(profile?.target_role ?? '');
      setSaveError(null);
      setSaveSuccess(false);
    }
    setOpen(value);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarError('Vui lòng chọn file hình ảnh.');
      return;
    }
    // Validate file size (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Ảnh phải nhỏ hơn 5 MB.');
      return;
    }

    setAvatarError(null);
    setSaveError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleUsernameBlur = useCallback(async () => {
    const trimmed = username.trim();
    if (!trimmed || trimmed === profile?.username) {
      setUsernameError(null);
      return;
    }
    // Basic format validation
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(trimmed)) {
      setUsernameError(
        'Username chỉ gồm chữ cái, số, dấu gạch dưới, 3–30 ký tự.',
      );
      return;
    }

    setCheckingUsername(true);
    setUsernameError(null);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmed)
        .neq('id', userId)
        .maybeSingle();

      if (data) {
        setUsernameError('Username này đã được sử dụng.');
      }
    } finally {
      setCheckingUsername(false);
    }
  }, [username, profile?.username, userId]);

  const handleSave = async () => {
    if (checkingUsername) return;

    // Re-validate username before submitting in case the field was never blurred
    const trimmedUsername = username.trim();
    if (trimmedUsername && trimmedUsername !== profile?.username) {
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(trimmedUsername)) {
        setUsernameError('Username chỉ gồm chữ cái, số, dấu gạch dưới, 3\u201330 ký tự.');
        return;
      }
      setCheckingUsername(true);
      const supabaseCheck = createClient();
      const { data: existing } = await supabaseCheck
        .from('profiles')
        .select('id')
        .eq('username', trimmedUsername)
        .neq('id', userId)
        .maybeSingle();
      setCheckingUsername(false);
      if (existing) {
        setUsernameError('Username này đã được sử dụng.');
        return;
      }
    }

    if (usernameError) return;

    setLoading(true);
    setSaveError(null);
    setSaveSuccess(false);
    setFullNameError(null);
    setAvatarError(null);

    // Validate required fields
    if (!fullName.trim()) {
      setFullNameError('Tên hiển thị không được để trống.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      let avatarUrl = profile?.avatar_url ?? null;

      // Upload avatar if a new file was selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${userId}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          setAvatarError('Không thể tải ảnh lên. Vui lòng thử lại.');
          setLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Append cache-busting param so browser reloads the image
        avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
      }

      const updates: Record<string, unknown> = {
        full_name: fullName.trim() || null,
        username: username.trim() || null,
        avatar_url: avatarUrl,
        school_name: schoolName.trim() || null,
        education_years:
          educationYears && educationYears !== 'graduated'
            ? parseInt(educationYears, 10)
            : null,
        major: major || null,
        target_role: targetRole || null,
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (updateError) {
        if (updateError.code === '23505') {
          setUsernameError('Username này đã được sử dụng.');
        } else {
          setSaveError('Không thể lưu thông tin. Vui lòng thử lại.');
        }
        return;
      }

      setSaveSuccess(true);
      router.refresh();

      setTimeout(() => {
        setOpen(false);
        setSaveSuccess(false);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  // Derived: schools with only 2 academic years
  const isTwoYearSchool = schoolName.toLowerCase().includes('polytechnic');
  const availableYearOptions = isTwoYearSchool
    ? EDUCATION_YEARS_OPTIONS.slice(0, 2)
    : EDUCATION_YEARS_OPTIONS;

  // Auto-reset education year if it's invalid for the selected school
  const handleSchoolChange = (value: string) => {
    setSchoolName(value);
    const isPolytechnic = value.toLowerCase().includes('polytechnic');
    if (isPolytechnic && educationYears !== '1' && educationYears !== '2') {
      setEducationYears('');
    }
  };

  // Autocomplete: filter universities by current input
  const filteredSchools =
    schoolName.length >= 1
      ? VIETNAM_UNIVERSITIES.filter((s) =>
          s.toLowerCase().includes(schoolName.toLowerCase()),
        ).slice(0, 8)
      : [];

  return (
    <>
      <Button
        size="sm"
        className="gap-1.5 shrink-0"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-3.5 w-3.5" />
        Chỉnh sửa
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* ── Section 1: Personal Info ── */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Thông tin cá nhân
              </p>

              {/* Avatar upload */}
              <div className="flex items-center gap-4">
                <div
                  className="relative group cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <Avatar className="h-20 w-20 border-2 border-border ring-2 ring-primary/20">
                    <AvatarImage
                      src={avatarPreview ?? undefined}
                      alt="Avatar preview"
                    />
                    <AvatarFallback className="bg-linear-to-br from-[#0066FF] to-[#0055DD] text-white text-lg font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium"
                    onClick={handleAvatarClick}
                  >
                    Tải ảnh lên
                  </button>
                  <p className="mt-0.5 text-xs">JPG, PNG, WebP — tối đa 5 MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Full name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="full-name"
                  className="flex items-center gap-1.5 text-sm"
                >
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Tên hiển thị
                </Label>
                <Input
                  id="full-name"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="username"
                  className="flex items-center gap-1.5 text-sm"
                >
                  <AtSign className="h-3.5 w-3.5 text-muted-foreground" />
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="nguyenvana"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameError(null);
                  }}
                  onBlur={handleUsernameBlur}
                  className={
                    usernameError
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }
                />
                {checkingUsername && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Đang kiểm tra...
                  </p>
                )}
                {usernameError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {usernameError}
                  </p>
                )}
              </div>
            </div>

            <Separator className="opacity-40" />

            {/* ── Section 2: Academic & Career ── */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Học vấn &amp; Nghề nghiệp
              </p>

              {/* School name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="school-name"
                  className="flex items-center gap-1.5 text-sm"
                >
                  <School className="h-3.5 w-3.5 text-muted-foreground" />
                  Trường học
                </Label>
                <div className="relative">
                  <Input
                    id="school-name"
                    placeholder="FPT Polytechnic"
                    value={schoolName}
                    onChange={(e) => handleSchoolChange(e.target.value)}
                    onFocus={() => setShowSchoolSuggestions(true)}
                    onBlur={() => setShowSchoolSuggestions(false)}
                    autoComplete="off"
                  />
                  {showSchoolSuggestions && filteredSchools.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 border border-border rounded-md shadow-md bg-popover overflow-hidden">
                      {filteredSchools.map((school) => (
                        <button
                          key={school}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            handleSchoolChange(school);
                            setShowSchoolSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          {school}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Education year */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Năm học
                </Label>
                <Select
                  value={educationYears}
                  onValueChange={(v) => setEducationYears(v ?? '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn năm học" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_YEARS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Major */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  Chuyên ngành
                </Label>
                <Select value={major} onValueChange={(v) => setMajor(v ?? '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chuyên ngành" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAJOR_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target role */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm">
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                  Mục tiêu nghề nghiệp
                </Label>
                <Select
                  value={targetRole}
                  onValueChange={(v) => setTargetRole(v ?? '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vị trí mục tiêu" />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Error / Success feedback */}
            {saveError && (
              <p className="text-sm text-red-500 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {saveError}
              </p>
            )}
            {saveSuccess && (
              <p className="text-sm text-emerald-500 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Đã lưu thành công!
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-1">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Huỷ
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading || !!usernameError || checkingUsername}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
