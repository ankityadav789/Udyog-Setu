import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Using raw queries to bypass Prisma client schema cache entirely without requiring server restart
    const profiles: any[] = await prisma.$queryRaw`SELECT * FROM StoreProfile LIMIT 1`;
    const profile = profiles.length > 0 ? profiles[0] : null;
    
    // SQLite boolean 1/0 mapped to true/false
    if (profile) {
      profile.isOnboarded = profile.isOnboarded === 1;
    }
    
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

    const existing: any[] = await prisma.$queryRaw`SELECT * FROM StoreProfile LIMIT 1`;

    if (existing.length > 0) {
      await prisma.$executeRaw`
        UPDATE StoreProfile 
        SET businessName = ${businessName}, category = ${category}, isOnboarded = 1
        WHERE id = ${existing[0].id}
      `;
      return NextResponse.json({ success: true, updated: true });
    } else {
      const newId = Date.now().toString();
      await prisma.$executeRaw`
        INSERT INTO StoreProfile (id, businessName, category, isOnboarded, createdAt, updatedAt)
        VALUES (${newId}, ${businessName}, ${category}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      return NextResponse.json({ success: true, created: true }, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/profile error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { businessName } = await request.json();
    if (!businessName) return NextResponse.json({ error: "Missing name" }, { status: 400 });
    
    await prisma.$executeRaw`UPDATE StoreProfile SET businessName = ${businessName}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.$executeRaw`DELETE FROM StoreProfile`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/profile error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
