import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, price, category, stockQuantity, sku } = body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),

        ...(price !== undefined && {
          price: Number(price),
        }),

        ...(category && { category }),

        ...(stockQuantity !== undefined && {
          stockQuantity: Number(stockQuantity),
        }),

        ...(sku && sku.trim() !== "" && { sku: sku.trim() }),
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // ✅ ALWAYS SOFT DELETE (no hard delete)
    await prisma.product.update({
      where: { id },
      data: {
        name: `[DELETED] ${id}`,
        stockQuantity: 0,
        sku: `DELETED-${Date.now()}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}