import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const product = await prisma.product.create({
      data: {
        name: 'Test',
        price: 100,
        category: 'TestCat',
        stockQuantity: 10,
        sku: null,
      }
    });
    console.log(product);
  } catch(e) {
    console.error("PRISMA ERROR", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
