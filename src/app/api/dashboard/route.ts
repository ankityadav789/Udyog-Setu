import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month'; // 'day', 'week', 'month'

    // KPI: Total Overall Sales & Orders Today (parallel execution)
    const today = startOfDay(new Date());
    const [totalSalesAgg, ordersToday] = await Promise.all([
      prisma.order.aggregate({
        _sum: { finalAmount: true },
      }),
      prisma.order.count({
        where: { createdAt: { gte: today } }
      })
    ]);
    const totalSales = totalSalesAgg._sum.finalAmount || 0;

    // Chart: Sales Trend (last 7 days logic simplified)
    // ✅ Proper date range handling
    let startDate = startOfMonth(new Date());

    if (range === 'day') {
      startDate = startOfDay(new Date());
    } else if (range === 'week') {
      startDate = startOfWeek(new Date());
    }

    // ✅ Fetch all orders in range
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: { createdAt: true, finalAmount: true }
    });
    
    // Grouping by date string
    const salesTrendMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
      salesTrendMap[dateStr] = 0;
    }

    recentOrders.forEach((o: any) => {
      const dateStr = o.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      if (salesTrendMap[dateStr] !== undefined) {
        salesTrendMap[dateStr] += o.finalAmount;
      }
    });
    
    const salesTrend = Object.keys(salesTrendMap).sort().map(date => ({
      date,
      sales: salesTrendMap[date]
    }));

    // Top Products
    const orderItems = await prisma.orderItem.findMany({
        where: {
    order: {
      createdAt: { gte: startDate }
    }
  },
      include: { product: true }
    });

    const productSalesMap: Record<string, {name: string, sales: number, count: number}> = {};
    orderItems.forEach((item: any) => {
      if (!item.product || item.product.name.startsWith('[DELETED]')) return;
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
