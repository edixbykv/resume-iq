import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, dbEnabled } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    if (!dbEnabled) {
      return NextResponse.json({ applications: [] });
    }

    const applications = await prisma.jobApplication.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (err) {
    console.error("applications get error", err);
    return NextResponse.json({ error: "Failed to fetch applications." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { company, role, status, date, notes } = await req.json();
    if (!company || !role) {
      return NextResponse.json({ error: "Company and Role are required." }, { status: 400 });
    }

    if (!dbEnabled) {
      const mockApp = {
        id: `mock_${Math.random().toString(36).slice(2, 6)}`,
        company,
        role,
        status: status || "APPLIED",
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        notes,
      };
      return NextResponse.json({ success: true, application: mockApp });
    }

    const app = await prisma.jobApplication.create({
      data: {
        userId: session.user.id,
        company,
        role,
        status: status || "APPLIED",
        date: date ? new Date(date) : new Date(),
        notes,
      },
    });

    return NextResponse.json({ success: true, application: app });
  } catch (err) {
    console.error("applications post error", err);
    return NextResponse.json({ error: "Failed to create application." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { id, status, notes } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required." }, { status: 400 });
    }

    if (!dbEnabled) {
      return NextResponse.json({ success: true });
    }

    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Application not found or unauthorized." }, { status: 403 });
    }

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: {
        status: status || existing.status,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (err) {
    console.error("applications put error", err);
    return NextResponse.json({ error: "Failed to update application." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required." }, { status: 400 });
    }

    if (!dbEnabled) {
      return NextResponse.json({ success: true });
    }

    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Application not found or unauthorized." }, { status: 403 });
    }

    await prisma.jobApplication.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("applications delete error", err);
    return NextResponse.json({ error: "Failed to delete application." }, { status: 500 });
  }
}
