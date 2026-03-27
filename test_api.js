fetch('http://localhost:3000/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Test', price: 100, category: 'TestCat', stockQuantity: 10, sku: '' })
})
.then(async r => {
  const text = await r.text();
  console.log("Status:", r.status);
  console.log("Body:", text);
})
.catch(console.error);
