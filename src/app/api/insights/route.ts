import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { NOT: { name: { startsWith: '[DELETED]' } } }
    });
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Fetch velocity from recent orders mapping
      const recentOrderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: sevenDaysAgo }
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const salesVelocity: Record<string, number> = {};
    for (const item of recentOrderItems) {
  if (!item.product || item.product.name.startsWith('[DELETED]')) continue;

  salesVelocity[item.productId] =
    (salesVelocity[item.productId] || 0) + item.quantity;
}

    let highestSellingId = null;
    let maxSold = 0;
    for (const pId in salesVelocity) {
      if (salesVelocity[pId] > maxSold) {
        maxSold = salesVelocity[pId];
        highestSellingId = pId;
      }
    }

    const insights: string[] = [];

    for (const p of products) {
      const soldRecently = salesVelocity[p.id] || 0;
      
      if (p.id === highestSellingId && maxSold > 0) {
        insights.push(`⭐ ${p.name} is in high demand. Order more of this item to increase sales.`);
      }

      // Rule 1: Critical Low Stock
      if (p.stockQuantity <= 3) {
        insights.push(`⚠️ ${p.name} stock is critically low (only ${p.stockQuantity} remaining).`);
        
        // Rule 3: Predictive Smart Restock based on velocity mapping
        const recommendedRestock = Math.max(soldRecently + 5, 10); // Predict baseline + buffer
        insights.push(`💡 Buy at least ${recommendedRestock} units of ${p.name} tomorrow to prevent an upcoming shortage.`);
      }

      // Rule 2: High Velocity Demand Spikes (Excluding already warned low stock)
      if (soldRecently >= 5 && p.stockQuantity > 3) {
         insights.push(`📈 ${p.name} demand is rising fast! (Sold ${soldRecently} units recently)`);
      }
    }

    if (insights.length === 0) {
       insights.push(`✅ Inventory ecosystems are healthy. No urgent alerts.`);
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error("GET /api/insights error:", error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
