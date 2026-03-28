import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
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

        // ✅ SAFE SKU HANDLING (no null, no empty)
        ...(sku !== undefined && {
          sku: sku && sku.trim() !== "" ? sku.trim() : undefined
        }),
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}