"use client";

import React, { useState, useEffect } from 'react';
import styles from './SetupProducts.module.css';

export default function SetupProducts() {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<{name: string, price: string, category: string, stockQuantity: number}[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('100');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(console.error);
  }, []);

  // Determine dynamic terminology based on the active profile category
  const categoryName = profile ? profile.category : '';
  let entityName = "Products";
  let itemCategory = "General";
  
  if (categoryName === 'Bakery') { entityName = "Cakes & Items"; itemCategory = "Baked Goods"; }
  else if (categoryName === 'Restaurant') { entityName = "Dishes"; itemCategory = "Menu Item"; }
  else if (categoryName === 'Salon') { entityName = "Services"; itemCategory = "Treatment"; }
  else if (categoryName === 'Medical') { entityName = "Medicines"; itemCategory = "Drug"; }
  else if (categoryName === 'Book Shop') { entityName = "Books"; itemCategory = "Books"; }
  else if (categoryName === 'General Store') { entityName = "Groceries"; itemCategory = "Kirana"; }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    setProducts([...products, { name, price, category: itemCategory, stockQuantity: parseInt(stock) || 10 }]);
    setName('');
    setPrice('');
    setStock('100');
  };

  const handleRemove = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Send array of products exactly to API for DB saving AND DATASET file export
      await fetch('/api/setup-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products)
      });
      // Force reload to land on Dashboard inside the App Layout wrapper
      window.location.href = '/dashboard';
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Let's build your catalog</h2>
          <p>Add your first few <strong>{entityName.toLowerCase()}</strong> for {profile?.businessName || 'your business'}.</p>
        </div>

        <form className={styles.addForm} onSubmit={handleAdd}>
          <div className={styles.inputGroup}>
            <input 
              type="text" 
              placeholder={`${entityName} Name`}
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <input 
              type="number" 
              step="0.01"
              placeholder="Price (₹)"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup} style={{ maxWidth: '100px' }}>
            <input 
              type="number" 
              placeholder="Stock"
              value={stock}
              onChange={e => setStock(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.addBtn} disabled={!name || !price}>
            Add
          </button>
        </form>

        <div className={styles.list}>
          {products.length === 0 ? (
            <div className={styles.empty}>
              No {entityName.toLowerCase()} added yet. Add a few above to get started quickly!
            </div>
          ) : (
            products.map((p, i) => (
              <div key={i} className={styles.listItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{p.name}</span>
                  <span className={styles.itemMeta}>₹{p.price} • {p.stockQuantity} Stock</span>
                </div>
                <button type="button" className={styles.removeBtn} onClick={() => handleRemove(i)}>
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.counter}>{products.length} {entityName.toLowerCase()} ready</span>
          <button 
            className={styles.primaryBtn} 
            onClick={handleFinish}
            disabled={loading}
          >
            {loading ? 'Finalizing...' : 'Launch UdyogSetu'}
          </button>
        </div>
      </div>
    </div>
  );
}
