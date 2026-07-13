"use client";

import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Github } from "@/components/site/brand-icons";
import { ArrowLeft, Loader2, Mail, Sparkles } from "lucide-react";
import Link from "next/link";

function SignInContent() {
  const [loading, setLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  // Email OTP States
  const [emailInput, setEmailInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  const handleSignIn = (provider: string) => {
    setLoading(provider);
    signIn(provider, { callbackUrl });
  };

  const handleSendOtp = async () => {
    if (!emailInput || !emailInput.includes("@")) {
      setOtpError("Please enter a valid email address.");
      return;
    }
    setSendingOtp(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
      } else {
        setOtpError(data.error || "Failed to send verification code.");
      }
    } catch {
      setOtpError("An error occurred. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError("Please enter the 6-digit verification code.");
      return;
    }
    setVerifyingOtp(true);
    setOtpError("");
    try {
      const result = (await signIn("credentials", {
        email: emailInput,
        code: otpCode,
        callbackUrl,
      })) as unknown as { error?: string };
      if (result?.error) {
        setOtpError("Invalid or expired verification code.");
      }
    } catch {
      setOtpError("An error occurred during verification.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground">
            <Link href="/analyze"><ArrowLeft className="size-4 mr-1.5" /> Back to analyzer</Link>
          </Button>

          <Card className="p-8 bg-card border border-border shadow-xl space-y-6 text-card-foreground">
            <div className="text-center">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Sign in to ResumeIQ</h1>
              <p className="mt-2 text-xs text-muted-foreground">
                Save your analyses, track history, and unlock premium features.
              </p>
            </div>

            {error === "OAuthAccountNotLinked" && (
              <div className="rounded-lg bg-amber-950/20 border border-amber-900/30 p-3 text-xs text-amber-600 dark:text-amber-300 text-center font-medium">
                An account with this email already exists using a different sign-in method.
              </div>
            )}

            {/* Email OTP Section */}
            <div className="space-y-4">

              {otpError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg p-3 text-center">
                  {otpError}
                </div>
              )}

              {!otpSent ? (
                <div className="space-y-3">
                  <div className="space-y-1 text-left">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="name@company.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="gradient"
                    className="w-full justify-center gap-2"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || loading !== null}
                  >
                    {sendingOtp ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Mail className="size-4" />
                    )}
                    Send Verification Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground text-center mb-1">
                    We sent a verification code to <span className="text-foreground font-semibold">{emailInput}</span>. Enter it below to sign in.
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-center text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono tracking-widest text-base"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />

                  </div>
                  <Button
                    variant="gradient"
                    className="w-full justify-center gap-2"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || loading !== null}
                  >
                    {verifyingOtp ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    Verify & Log In
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpError("");
                    }}
                  >
                    Change Email
                  </Button>
                </div>
              )}
            </div>

            <p className="mt-6 text-center text-[10px] text-muted-foreground leading-normal">
              By signing in, you agree to our{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
                Terms of Service
              </Link>
              .
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#070a13] text-white">Loading…</div>}>
      <SignInContent />
    </Suspense>
  );
}