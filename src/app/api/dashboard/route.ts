import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month'; // 'day', 'week', 'month'

    // KPI: Total Overall Sales
    const totalSalesAgg = await prisma.order.aggregate({
      _sum: { finalAmount: true },
    });
    const totalSales = totalSalesAgg._sum.finalAmount || 0;

    // KPI: Orders Today
    const today = startOfDay(new Date());
    const ordersToday = await prisma.order.count({
      where: { createdAt: { gte: today } }
    });

    // Chart: Sales Trend (last 7 days logic simplified)
    const recentOrders = await prisma.order.findMany({
      take: 30, // Just taking last 30 for simplicity in this demo
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, finalAmount: true }
    });
    
    // Grouping by date string
    const salesTrendMap: Record<string, number> = {};
    recentOrders.forEach((o: any) => {
      const dateStr = o.createdAt.toISOString().split('T')[0];
      salesTrendMap[dateStr] = (salesTrendMap[dateStr] || 0) + o.finalAmount;
    });
    
    const salesTrend = Object.keys(salesTrendMap).sort().map(date => ({
      date,
      sales: salesTrendMap[date]
    }));

    // Top Products
    const orderItems = await prisma.orderItem.findMany({
      include: { product: true }
    });

    const productSalesMap: Record<string, {name: string, sales: number, count: number}> = {};
    orderItems.forEach((item: any) => {
      const pId = item.productId;
      if (!productSalesMap[pId]) {
        productSalesMap[pId] = { name: item.product.name, sales: 0, count: 0 };
      }
      productSalesMap[pId].sales += item.subtotal;
      productSalesMap[pId].count += item.quantity;
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return NextResponse.json({
      kpi: {
        totalSales,
        ordersToday
      },
      salesTrend,
      topProducts
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
