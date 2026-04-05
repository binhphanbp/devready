'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Code2,
  GraduationCap,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  SkipForward,
  Sparkles,
  School,
  Calendar,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MAJOR_OPTIONS,
  TARGET_ROLE_OPTIONS,
  EDUCATION_YEARS_OPTIONS,
} from '@/lib/constants/profile-options';

const steps = [
  {
    id: 1,
    title: 'Thông tin học vấn',
    description: 'Cho chúng tôi biết về trường học của bạn',
    icon: GraduationCap,
  },
  {
    id: 2,
    title: 'Mục tiêu nghề nghiệp',
    description: 'Bạn muốn trở thành gì?',
    icon: Target,
  },
  {
    id: 3,
    title: 'Hoàn tất',
    description: 'Xác nhận và bắt đầu hành trình',
    icon: CheckCircle2,
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Form data
  const [schoolName, setSchoolName] = useState('FPT Polytechnic');
  const [educationYears, setEducationYears] = useState('');
  const [major, setMajor] = useState('');
  const [customMajor, setCustomMajor] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [customTargetRole, setCustomTargetRole] = useState('');

  // Check if user is logged in and hasn't completed onboarding
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.push('/dashboard');
        return;
      }

      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
    }

    router.push('/dashboard');
  };

  const handleSubmit = async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const finalMajor =
      major === 'other'
        ? customMajor
        : MAJOR_OPTIONS.find((m) => m.value === major)?.label || major;
    const finalTargetRole =
      targetRole === 'other'
        ? customTargetRole
        : TARGET_ROLE_OPTIONS.find((r) => r.value === targetRole)?.label ||
          targetRole;

    const { error } = await supabase
      .from('profiles')
      .update({
        school_name: schoolName || 'FPT Polytechnic',
        education_years:
          educationYears === 'graduated'
            ? null
            : parseInt(educationYears) || null,
        major: finalMajor || null,
        target_role: finalTargetRole || null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error saving onboarding data:', error);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  const canProceedStep1 = schoolName.trim().length > 0;
  const canProceedStep2 =
    targetRole.length > 0 &&
    (targetRole !== 'other' || customTargetRole.trim().length > 0);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute -top-[30%] -left-[20%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute -bottom-[20%] -right-[20%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00AAFF] shadow-md shadow-[#0066FF]/20">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold">
            Dev<span className="text-gradient">Ready</span>
          </span>
        </Link>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'bg-gradient-to-br from-[#0066FF] to-[#00AAFF] text-white shadow-md shadow-[#0066FF]/20'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`hidden sm:block h-0.5 w-12 md:w-20 transition-all duration-500 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted/30'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Main Card */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Education */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-6"
                >
                  {/* Header */}
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 mb-4">
                      <GraduationCap className="h-7 w-7 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold">Thông tin học vấn</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      Giúp chúng tôi cá nhân hoá nội dung cho bạn
                    </p>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4">
                    {/* School Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="schoolName"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <School className="h-3.5 w-3.5 text-muted-foreground" />
                        Trường học
                      </Label>
                      <Input
                        id="schoolName"
                        placeholder="VD: FPT Polytechnic"
                        className="h-11"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                      />
                    </div>

                    {/* Education Year */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="educationYears"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        Năm học
                      </Label>
                      <Select
                        value={educationYears}
                        onValueChange={(v) => setEducationYears(v ?? '')}
                      >
                        <SelectTrigger className="h-11" id="educationYears">
                          <SelectValue placeholder="Chọn năm học của bạn" />
                        </SelectTrigger>
                        <SelectContent>
                          {EDUCATION_YEARS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Major */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="major"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        Chuyên ngành
                      </Label>
                      <Select
                        value={major}
                        onValueChange={(v) => setMajor(v ?? '')}
                      >
                        <SelectTrigger className="h-11" id="major">
                          <SelectValue placeholder="Chọn chuyên ngành" />
                        </SelectTrigger>
                        <SelectContent>
                          {MAJOR_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {major === 'other' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Input
                            placeholder="Nhập chuyên ngành của bạn..."
                            className="h-11 mt-2"
                            value={customMajor}
                            onChange={(e) => setCustomMajor(e.target.value)}
                            autoFocus
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSkip}
                      disabled={loading}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <SkipForward className="mr-1.5 h-3.5 w-3.5" />
                      Bỏ qua
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!canProceedStep1}
                      className="glow-blue bg-gradient-to-r from-[#0066FF] to-[#0055DD] text-white border-0"
                    >
                      Tiếp theo
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Career Goals */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-6"
                >
                  {/* Header */}
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                      <Target className="h-7 w-7 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold">Mục tiêu nghề nghiệp</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      Chúng tôi sẽ gợi ý câu hỏi phỏng vấn phù hợp với mục tiêu
                      của bạn
                    </p>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4">
                    {/* Target Role */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="targetRole"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        Vị trí mong muốn
                      </Label>
                      <Select
                        value={targetRole}
                        onValueChange={(v) => setTargetRole(v ?? '')}
                      >
                        <SelectTrigger className="h-11" id="targetRole">
                          <SelectValue placeholder="Chọn vị trí bạn mong muốn" />
                        </SelectTrigger>
                        <SelectContent>
                          {TARGET_ROLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {targetRole === 'other' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Input
                            placeholder="Nhập vị trí bạn mong muốn..."
                            className="h-11 mt-2"
                            value={customTargetRole}
                            onChange={(e) =>
                              setCustomTargetRole(e.target.value)
                            }
                            autoFocus
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Motivational note */}
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <div className="flex gap-3">
                        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Lợi ích khi hoàn tất
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            DevReady sẽ ưu tiên hiển thị câu hỏi phỏng vấn phù
                            hợp với vị trí và chuyên ngành của bạn, giúp bạn
                            luyện tập hiệu quả hơn.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                      Quay lại
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!canProceedStep2}
                      className="glow-blue bg-gradient-to-r from-[#0066FF] to-[#0055DD] text-white border-0"
                    >
                      Tiếp theo
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Summary */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-6"
                >
                  {/* Header */}
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 mb-4">
                      <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold">Xác nhận thông tin</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      Kiểm tra lại thông tin trước khi bắt đầu
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="space-y-3">
                    <SummaryRow
                      icon={<School className="h-4 w-4 text-blue-400" />}
                      label="Trường học"
                      value={schoolName || 'Chưa cung cấp'}
                    />
                    <SummaryRow
                      icon={<Calendar className="h-4 w-4 text-cyan-400" />}
                      label="Năm học"
                      value={
                        educationYears
                          ? EDUCATION_YEARS_OPTIONS.find(
                              (o) => o.value === educationYears,
                            )?.label || educationYears
                          : 'Chưa chọn'
                      }
                    />
                    <SummaryRow
                      icon={<BookOpen className="h-4 w-4 text-purple-400" />}
                      label="Chuyên ngành"
                      value={
                        major === 'other'
                          ? customMajor || 'Chưa nhập'
                          : MAJOR_OPTIONS.find((m) => m.value === major)
                              ?.label || 'Chưa chọn'
                      }
                    />
                    <SummaryRow
                      icon={<Briefcase className="h-4 w-4 text-amber-400" />}
                      label="Vị trí mong muốn"
                      value={
                        targetRole === 'other'
                          ? customTargetRole || 'Chưa nhập'
                          : TARGET_ROLE_OPTIONS.find(
                              (r) => r.value === targetRole,
                            )?.label || 'Chưa chọn'
                      }
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      disabled={loading}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                      Quay lại
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="glow-blue bg-gradient-to-r from-[#0066FF] to-[#0055DD] text-white border-0 min-w-[140px]"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Bắt đầu ngay
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Bạn có thể cập nhật thông tin này bất kỳ lúc nào trong{' '}
          <Link href="/profile" className="text-primary hover:underline">
            Cài đặt hồ sơ
          </Link>
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-3.5">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
