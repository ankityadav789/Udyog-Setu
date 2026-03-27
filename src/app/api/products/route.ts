import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
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

    // Optional validation
    if (!name || isNaN(Number(price))) {
      return NextResponse.json({ error: "Name and valid price are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        category: category || "Uncategorized",
        stockQuantity: Number(stockQuantity) || 0,
        sku: sku || null,
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
