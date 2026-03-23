"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute -top-[30%] -left-[20%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />

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
          {sent ? (
            <CardContent className="p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 mb-4">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold">Kiểm tra email</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Chúng tôi đã gửi link đặt lại mật khẩu đến{" "}
                <strong className="text-foreground">{email}</strong>.
                Vui lòng kiểm tra hộp thư (bao gồm thư rác).
              </p>
              <div className="mt-6 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setSent(false); setEmail(""); }}
                >
                  Gửi lại email
                </Button>
                <Button variant="ghost" className="w-full" render={<Link href="/login" />}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Quay lại đăng nhập
                </Button>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-2">
                  <Mail className="h-5.5 w-5.5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Quên mật khẩu?</CardTitle>
                <CardDescription>
                  Nhập email đã đăng ký, chúng tôi sẽ gửi link để đặt lại mật khẩu.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="email">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-9 h-11"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 glow-blue bg-gradient-to-r from-[#0066FF] to-[#0055DD] text-white border-0"
                    disabled={loading || !email.trim()}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Gửi link đặt lại mật khẩu
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Quay lại đăng nhập
                  </Link>
                </p>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
