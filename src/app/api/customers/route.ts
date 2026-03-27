import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orders: true, // to calculate total spent and orders
      }
    });
    
    // Map data to include stats
    const customerStats = customers.map((c: any) => ({
      ...c,
      totalSpent: c.orders.reduce((sum: number, o: any) => sum + o.finalAmount, 0),
      orderCount: c.orders.length,
      orders: undefined // remove full orders to keep payload small
    }));

    return NextResponse.json(customerStats);
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: { name, phone: phone || null, email: email || null }
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
