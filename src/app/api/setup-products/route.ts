import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const products = await request.json();

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid payload expected array" }, { status: 400 });
    }

    // 1. Export identical payload to DATASET physical file
    const datasetPath = path.join(process.cwd(), 'DATASET');
    fs.writeFileSync(datasetPath, JSON.stringify(products, null, 2), 'utf8');

    // 2. Insert into the SQLite Database (Product model has always existed, so safe to use client)
    if (products.length > 0) {
      for (const p of products) {
        await prisma.product.create({
          data: {
            name: p.name,
            price: parseFloat(p.price),
            category: p.category,
            stockQuantity: p.stockQuantity || 100 // default stock for quick start
          }
        });
      }
    }

    return NextResponse.json({ success: true, count: products.length });
  } catch (error) {
    console.error("POST /api/setup-products error:", error);
    return NextResponse.json({ error: "Failed to setup products and export dataset" }, { status: 500 });
  }
}
