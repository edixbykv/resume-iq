import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, dbEnabled } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { razorpayOrderId, razorpayPaymentId, amount } = await req.json();

    if (dbEnabled) {
      // Create payment log in database
      await prisma.payment.create({
        data: {
          userId: session.user.id,
          amount: amount || 900,
          currency: "INR",
          status: "SUCCESS",
          razorpayOrderId,
          razorpayPaymentId,
        },
      });

      // Upgrade user's plan to premium
      await prisma.user.update({
        where: { id: session.user.id },
        data: { plan: "PREMIUM" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and logged.",
    });
  } catch (err) {
    console.error("Payment log error", err);
    return NextResponse.json({ error: "Failed to log payment transaction." }, { status: 500 });
  }
}
