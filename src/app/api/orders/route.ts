import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customer, totalAmount, taxAmount, discountAmount, finalAmount, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Process customer independently using raw SQL to sidestep Prisma Schema cache
    let customerId = null;
    const prismaAny = prisma as any;
    if (customer && customer.name && customer.phone) {
      const existing: any[] = await prismaAny.$queryRaw`SELECT id FROM Customer WHERE phone = ${customer.phone} LIMIT 1`;
      
      if (existing.length > 0) {
        customerId = existing[0].id;
        await prismaAny.$executeRaw`
          UPDATE Customer 
          SET name = ${customer.name}, eventDate = ${customer.eventDate || null} 
          WHERE id = ${customerId}
        `;
      } else {
        customerId = Date.now().toString();
        await prismaAny.$executeRaw`
          INSERT INTO Customer (id, name, phone, eventDate, createdAt, updatedAt)
          VALUES (${customerId}, ${customer.name}, ${customer.phone}, ${customer.eventDate || null}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
      }
    }

    // Process inside a transaction
    const order = await prisma.$transaction(async (tx: any) => {
      // 1. Create the Order
      const newOrder = await tx.order.create({
        data: {
          customerId: customerId,
          totalAmount: Number(totalAmount),
          taxAmount: Number(taxAmount),
          discountAmount: Number(discountAmount),
          finalAmount: Number(finalAmount),
          paymentMethod: paymentMethod || "CASH",
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: Number(item.quantity),
              priceAtTime: Number(item.price),
              subtotal: Number(item.quantity) * Number(item.price),
            }))
          }
        },
        include: { items: true }
      });

      // 2. Decrement Product Stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: Number(item.quantity)
            }
          }
        });
      }

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: {
          include: { product: true }
        }
      }
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
