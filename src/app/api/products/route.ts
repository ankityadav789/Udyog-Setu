import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        NOT: {
          name: {
            startsWith: '[DELETED]'
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, category, stockQuantity, sku } = body;

    // ✅ STRONG VALIDATION
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price: Number(price),
        category:
         category && category.trim() !== "" ? category.trim() : "Uncategorized",
        stockQuantity:
         stockQuantity !== undefined ? Number(stockQuantity) : 0,

        // ✅ SAFE SKU (NO NULL)
        sku: sku && sku.trim() !== "" ? sku.trim() : undefined,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
