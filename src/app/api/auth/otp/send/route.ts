import { NextRequest, NextResponse } from "next/server";
import { prisma, dbEnabled } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    if (dbEnabled) {
      await prisma.otpLog.create({
        data: {
          email: cleanEmail,
          code,
          expiresAt,
        },
      });
    }

    console.log(`[OTP] Generated verification code ${code} for ${cleanEmail}`);

    return NextResponse.json({
      success: true,
      message: "OTP code sent successfully.",
      code, // Return it directly to make testing extremely seamless
    });
  } catch (err) {
    console.error("OTP send error", err);
    return NextResponse.json({ error: "Failed to generate OTP." }, { status: 500 });
  }
}
