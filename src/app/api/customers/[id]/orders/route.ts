import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: any) {
  try {
    const params = await context.params;
    const { id } = params;
    
    const orders = await prisma.order.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/customers/[id]/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch customer orders" }, { status: 500 });
  }
}
