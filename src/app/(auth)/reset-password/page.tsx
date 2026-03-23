"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();

  // Listen for the auth event from the reset link
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setSessionReady(true);
        }
      }
    );

    // Check if already in a session (user clicked reset link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect to dashboard after 2s
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 2000);
  };

  // Password strength
  const getStrength = () => {
    if (!password) return { level: 0, text: "", color: "" };
    if (password.length < 6) return { level: 1, text: "Yếu", color: "bg-red-500" };
    if (password.length < 8) return { level: 2, text: "Trung bình", color: "bg-amber-500" };
    if (/(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(password))
      return { level: 4, text: "Rất mạnh", color: "bg-emerald-500" };
    if (/(?=.*[A-Z])(?=.*[0-9])/.test(password))
      return { level: 3, text: "Mạnh", color: "bg-blue-500" };
    return { level: 2, text: "Trung bình", color: "bg-amber-500" };
  };

  const strength = getStrength();

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute -bottom-[30%] -right-[20%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00AAFF] shadow-md shadow-[#0066FF]/20">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold">
            Dev<span className="text-gradient">Ready</span>
          </span>
        </Link>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          {success ? (
            <CardContent className="p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 mb-4">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold">Đổi mật khẩu thành công!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Mật khẩu mới đã được cập nhật. Đang chuyển đến Dashboard...
              </p>
            </CardContent>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-2">
                  <ShieldCheck className="h-5.5 w-5.5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
                <CardDescription>
                  Nhập mật khẩu mới cho tài khoản của bạn.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!sessionReady ? (
                  <div className="text-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Đang xác thực link đặt lại mật khẩu...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReset} className="space-y-4">
                    {error && (
                      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="password">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Ít nhất 6 ký tự"
                          className="pl-9 pr-9 h-11"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {/* Password strength */}
                      {password && (
                        <div className="space-y-1.5">
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4].map(i => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-colors ${
                                  i <= strength.level ? strength.color : "bg-muted/50"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Độ mạnh: <span className="font-medium text-foreground">{strength.text}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="confirm">
                        Xác nhận mật khẩu mới
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm"
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập lại mật khẩu mới"
                          className="pl-9 h-11"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        {confirmPassword && password === confirmPassword && (
                          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 glow-blue bg-gradient-to-r from-[#0066FF] to-[#0055DD] text-white border-0"
                      disabled={loading || !password || !confirmPassword}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Đặt lại mật khẩu
                    </Button>
                  </form>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
