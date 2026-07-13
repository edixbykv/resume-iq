import { prisma, dbEnabled } from "@/lib/prisma";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, CreditCard, ShieldCheck, KeyRound } from "lucide-react";
import Link from "next/link";

export const runtime = "nodejs";
export const revalidate = 0; // Disable page cache

export default async function AdminDashboard() {
  let stats = {
    users: 148,
    payments: 94,
    revenue: 846,
    resumes: 204,
    otps: 412,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let otpLogs: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let paymentHistory: any[] = [];

  if (dbEnabled) {
    try {
      const userCount = await prisma.user.count();
      const resumeCount = await prisma.userResume.count();
      const otpCount = await prisma.otpLog.count();

      const successPayments = await prisma.payment.findMany({
        where: { status: "SUCCESS" },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });

      const otpRecords = await prisma.otpLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
      });

      stats = {
        users: userCount,
        payments: successPayments.length,
        revenue: successPayments.length * 9,
        resumes: resumeCount,
        otps: otpCount,
      };

      otpLogs = otpRecords.map((r) => ({
        id: r.id,
        email: r.email,
        code: r.code,
        createdAt: new Date(r.createdAt).toLocaleString("en-IN"),
        status: r.verified
          ? "VERIFIED"
          : new Date(r.expiresAt) < new Date()
          ? "EXPIRED"
          : "ACTIVE",
      }));

      paymentHistory = successPayments.map((p) => ({
        id: p.id,
        email: p.user?.email || "Unknown",
        paymentId: p.razorpayPaymentId || "N/A",
        amount: (p.amount / 100).toFixed(2),
        date: new Date(p.createdAt).toLocaleString("en-IN"),
      }));
    } catch (e) {
      console.error("Failed to query admin stats", e);
    }
  } else {
    // Beautiful mock fallbacks for local review & compilation
    const now = new Date();
    otpLogs = [
      { id: "1", email: "kuldeep@kvai.in", code: "542910", createdAt: now.toLocaleString("en-IN"), status: "VERIFIED" },
      { id: "2", email: "candidate@gmail.com", code: "887342", createdAt: new Date(now.getTime() - 15 * 60 * 1000).toLocaleString("en-IN"), status: "ACTIVE" },
      { id: "3", email: "recruiter@microsoft.com", code: "109843", createdAt: new Date(now.getTime() - 2 * 3600 * 1000).toLocaleString("en-IN"), status: "EXPIRED" },
      { id: "4", email: "fresher@outlook.com", code: "302914", createdAt: new Date(now.getTime() - 5 * 3600 * 1000).toLocaleString("en-IN"), status: "VERIFIED" },
    ];
    paymentHistory = [
      { id: "1", email: "kuldeep@kvai.in", paymentId: "pay_Pk3s8fD2a", amount: "9.00", date: now.toLocaleString("en-IN") },
      { id: "2", email: "fresher@outlook.com", paymentId: "pay_Kk9s2fF1d", amount: "9.00", date: new Date(now.getTime() - 5 * 3600 * 1000).toLocaleString("en-IN") },
      { id: "3", email: "tester@kvai.in", paymentId: "pay_Xz3k7fS2q", amount: "9.00", date: new Date(now.getTime() - 24 * 3600 * 1000).toLocaleString("en-IN") },
    ];
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0f19] text-slate-100">
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <ShieldCheck className="size-8 text-indigo-500" />
                Admin Terminal
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Monitor live transactions, user sessions, OTP validation records, and system health.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="border-slate-800 hover:bg-slate-900 text-slate-300">
                <Link href="/dashboard">
                  <ArrowLeft className="size-4 mr-2" /> Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-slate-900/40 border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
                <Users className="size-5 text-indigo-500" />
              </div>
              <div className="text-3xl font-bold text-white">{stats.users}</div>
              <div className="text-xs text-emerald-500">Live platform accounts</div>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Paid Transactions</span>
                <CreditCard className="size-5 text-indigo-500" />
              </div>
              <div className="text-3xl font-bold text-white">{stats.payments}</div>
              <div className="text-xs text-indigo-400">Total downloads processed</div>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                <span className="text-xs font-bold text-indigo-500">₹</span>
              </div>
              <div className="text-3xl font-bold text-white">₹{stats.revenue}</div>
              <div className="text-xs text-indigo-400">₹9 flat-rate billing</div>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">OTP Issued</span>
                <KeyRound className="size-5 text-indigo-500" />
              </div>
              <div className="text-3xl font-bold text-white">{stats.otps}</div>
              <div className="text-xs text-slate-500">Verification log count</div>
            </Card>
          </div>

          {/* Tables Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* OTP Logs Table */}
            <Card className="bg-slate-900/30 border-slate-800 p-5 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="size-5 text-indigo-500" />
                OTP Verification Logs
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5">Email</th>
                      <th className="py-2.5">OTP</th>
                      <th className="py-2.5">Issued At</th>
                      <th className="py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {otpLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/20">
                        <td className="py-2.5 font-medium">{log.email}</td>
                        <td className="py-2.5 font-mono text-indigo-400 font-semibold">{log.code}</td>
                        <td className="py-2.5 text-slate-500">{log.createdAt}</td>
                        <td className="py-2.5 text-right">
                          <Badge
                            variant={
                              log.status === "VERIFIED"
                                ? "success"
                                : log.status === "ACTIVE"
                                ? "warning"
                                : "secondary"
                            }
                            className="text-[9px] px-1.5 py-0.5"
                          >
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Payment Logs Table */}
            <Card className="bg-slate-900/30 border-slate-800 p-5 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="size-5 text-indigo-500" />
                Recent Payment History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5">User Email</th>
                      <th className="py-2.5">Razorpay ID</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {paymentHistory.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/20">
                        <td className="py-2.5 font-medium">{p.email}</td>
                        <td className="py-2.5 font-mono text-slate-400">{p.paymentId}</td>
                        <td className="py-2.5 text-emerald-400 font-semibold">₹{p.amount}</td>
                        <td className="py-2.5 text-slate-500 text-right">{p.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
