import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, email } = body;

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/customers/[id] error:", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.customer.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/customers/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
