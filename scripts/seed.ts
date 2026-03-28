import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { NOT: { name: { startsWith: '[DELETED]' } } }
  });

  if (products.length < 2) {
    console.error("Not enough non-deleted products available to simulate trends.");
    return;
  }

  // Pick exactly the first two products to simulate spiking demand
  const p1 = products[0];
  const p2 = products[1];

  const customerNames = ["Priyanshu", "Gaurav", "Anmol", "Sunil", "Aisha", "Rahul"];

  console.log(`Simulating order geometry for: ${p1.name} and ${p2.name}`);

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(14, 0, 0, 0); 
    
    // Mathematically forcing a chronological spike the closer i gets to 0 (Today)
    // 6 days ago (i=6): q1=2, q2=3
    // Today (i=0): q1=14, q2=21
    const q1 = (7 - i) * 2; 
    const q2 = (7 - i) * 3; 

    // Generate random Customer logic linking to CRM ledger seamlessly
    const cName = customerNames[Math.floor(Math.random() * customerNames.length)];
    let cust = await prisma.customer.findFirst({ where: { name: cName } });
    
    if (!cust) {
      // Create new customer
      cust = await prisma.customer.create({
        data: {
          name: cName,
          phone: "9876" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
          createdAt: d
        }
      });
    }

    if (!cust) return;

    const sub1 = p1.price * q1;
    const sub2 = p2.price * q2;
    const total = sub1 + sub2;

    await prisma.order.create({
      data: {
        customerId: cust.id,
        totalAmount: total,
        finalAmount: total,
        taxAmount: 0,
        discountAmount: 0,
        createdAt: d,
        items: {
          create: [
            {
              productId: p1.id,
              quantity: q1,
              priceAtTime: p1.price,
              subtotal: sub1
            },
            {
              productId: p2.id,
              quantity: q2,
              priceAtTime: p2.price,
              subtotal: sub2
            }
          ]
        }
      }
    });

    console.log(`[Historical Injection: -${i} Days] Ordered by ${cName} -> ${q1}x ${p1.name}, ${q2}x ${p2.name} | Total: ₹${total}`);
  }

  console.log("Telemetry simulation completely finalized! Refresh your dashboard.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
