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

    // Send real email using Resend API key
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";

    if (resendApiKey) {
      try {
        const mailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `ResumeIQ <${resendFromEmail}>`,
            to: cleanEmail,
            subject: "Your ResumeIQ Verification Code",
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #4f46e5; text-align: center; margin-bottom: 24px;">ResumeIQ Account Verification</h2>
                <p style="font-size: 14px; color: #334155; line-height: 1.5;">Hello,</p>
                <p style="font-size: 14px; color: #334155; line-height: 1.5;">You requested a verification code to access your ResumeIQ account. Please use the following one-time password (OTP):</p>
                <div style="font-size: 36px; font-weight: bold; text-align: center; letter-spacing: 6px; color: #1e1b4b; margin: 30px 0; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                  ${code}
                </div>
                <p style="font-size: 12px; color: #64748b; line-height: 1.5;">This code will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">build by <a href="https://kvai.in" style="color: #4f46e5; text-decoration: none;">kvai.in</a></p>
              </div>
            `
          })
        });

        if (!mailRes.ok) {
          const errText = await mailRes.text();
          console.error("Resend API response failure:", errText);
          let parsedError = errText;
          try {
            const errObj = JSON.parse(errText);
            parsedError = errObj.message || errText;
          } catch {
            // ignore
          }
          return NextResponse.json({ error: `Resend API Error: ${parsedError}` }, { status: 400 });
        } else {
          console.log(`[Resend] Successfully sent OTP code to ${cleanEmail}`);
        }
      } catch (mailErr: any) {
        console.error("Resend API email sending failed:", mailErr);
        return NextResponse.json({ error: `Connection failed: ${mailErr.message || mailErr}` }, { status: 500 });
      }
    } else {
      console.warn("[Resend] RESEND_API_KEY environment variable is not configured. Falling back to console log code.");
      return NextResponse.json({ error: "Resend API key is missing on the server. Please add it to your environment variables." }, { status: 500 });
    }

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
