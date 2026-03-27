import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Using raw queries to bypass Prisma client schema cache entirely without requiring server restart
    const profile = await prisma.storeProfile.findFirst();
    
    return NextResponse.json(profile || { isOnboarded: false });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessName, category } = body;

    const existing = await prisma.storeProfile.findFirst();

    if (existing) {
      await prisma.storeProfile.update({
        where: { id: existing.id },
        data: {
          businessName,
          category,
          isOnboarded: true
        }
      });

      return NextResponse.json({ success: true, updated: true });

    } else {
      await prisma.storeProfile.create({
        data: {
          businessName,
          category,
          isOnboarded: true
        }
      });

      return NextResponse.json(
        { success: true, created: true },
        { status: 201 }
      );
    }

  } catch (error) {
    console.error("POST /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { businessName } = await request.json();
    if (!businessName) return NextResponse.json({ error: "Missing name" }, { status: 400 });
    
    await prisma.storeProfile.updateMany({
      data: { businessName }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.storeProfile.deleteMany();;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/profile error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
