"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './POS.module.css';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stockQuantity: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function POSPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [taxPercent, setTaxPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEvent, setCustomerEvent] = useState('');

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
          const cats = Array.from(new Set(data.map((p: any) => p.category)));
          setCategories(['All', ...cats]);
        }
      });
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCat === 'All' || p.category === selectedCat;
    const matchName = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchName;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = (subtotal * taxPercent) / 100;
  const finalAmount = subtotal + taxAmount - discountAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    // In a real app we might select a customer
    const orderData = {
      items: cart.map(c => ({ productId: c.id, quantity: c.quantity, price: c.price })),
      totalAmount: subtotal,
      taxAmount: taxAmount,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      paymentMethod: 'CASH',
      customer: {
        name: customerName,
        phone: customerPhone,
        eventDate: customerEvent
      }
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        const order = await res.json();
        setLastOrder(order);
        setCart([]);
        setTaxPercent(0);
        setDiscountAmount(0);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEvent('');
        setIsInvoiceModalOpen(true);
        // Refresh products to show updated stock
        const pRes = await fetch('/api/products');
        setProducts(await pRes.json());
      }
    } catch (error) {
      console.error(error);
      alert(t('error'));
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Panel: Products */}
      <div className={styles.productsPanel}>
        <div className={styles.header}>
          <h2>{t('pos')}</h2>
          <input 
            type="text" 
            placeholder={t('search')} 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.categoryFilters}>
          {categories.map(c => (
            <button 
              key={c} 
              className={c === selectedCat ? styles.catBtnActive : styles.catBtn}
              onClick={() => setSelectedCat(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className={styles.productGrid}>
          {filteredProducts.map(p => (
            <div key={p.id} className={styles.productCard} onClick={() => addToCart(p)}>
              <div className={styles.productCardInner}>
                <h4>{p.name}</h4>
                <p className={styles.price}>₹{p.price.toFixed(2)}</p>
                <span className={styles.stockBadge}>{t('stock')}: {p.stockQuantity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Cart */}
      <div className={styles.cartPanel}>
        <h2>{t('cart')}</h2>
        
        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>{t('empty_cart')}</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.cartItemInfo}>
                  <strong>{item.name}</strong>
                  <span>₹{item.price.toFixed(2)}</span>
                </div>
                <div className={styles.cartItemActions}>
                  <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                  <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>x</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.cartSummary}>
          <div className={styles.summaryRow}>
            <span>{t('total')}</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>{t('tax')} (%)</span>
            <input 
              type="number" 
              value={taxPercent} 
              onChange={e => setTaxPercent(Number(e.target.value))} 
              className={styles.numInput} 
              min="0"
            />
          </div>
          <div className={styles.summaryRow}>
            <span>{t('discount')} (₹)</span>
            <input 
              type="number" 
              value={discountAmount} 
              onChange={e => setDiscountAmount(Number(e.target.value))} 
              className={styles.numInput} 
              min="0"
            />
          </div>
          <div className={`${styles.summaryRow} ${styles.finalTotal}`}>
            <span>{t('final_amount')}</span>
            <span>₹{finalAmount.toFixed(2)}</span>
          </div>

          <div style={{ marginTop: '1rem', borderTop: '1px dashed #cbd5e1', paddingTop: '1rem' }}>
            <div className={styles.summaryRow}>
              <span style={{ fontSize: '0.85rem' }}>Name <span style={{color:'red'}}>*</span></span>
              <input 
                type="text" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                className={styles.numInput} 
                placeholder="e.g. Rahul"
                style={{ width: '120px' }}
              />
            </div>
            <div className={styles.summaryRow}>
              <span style={{ fontSize: '0.85rem' }}>Phone <span style={{color:'red'}}>*</span></span>
              <input 
                type="text" 
                value={customerPhone} 
                onChange={e => setCustomerPhone(e.target.value)} 
                className={styles.numInput} 
                placeholder="9876543210"
                style={{ width: '120px' }}
              />
            </div>
            <div className={styles.summaryRow}>
              <span style={{ fontSize: '0.85rem' }}>Event / BDay</span>
              <input 
                type="text" 
                value={customerEvent} 
                onChange={e => setCustomerEvent(e.target.value)} 
                className={styles.numInput} 
                placeholder="15 Aug"
                style={{ width: '120px' }}
              />
            </div>
          </div>

          <button 
            className={styles.checkoutBtn} 
            disabled={cart.length === 0 || !customerName.trim() || !customerPhone.trim()}
            onClick={handleCheckout}
          >
            {t('checkout')}
          </button>
        </div>
      </div>

      {/* Invoice Modal */}
      {isInvoiceModalOpen && lastOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.invoiceModal}>
            <div className={styles.invoiceHeader}>
              <h2>{t('invoice')}</h2>
              <button className={styles.printBtn} onClick={() => window.print()}>{t('print')}</button>
            </div>
            <div className={styles.invoiceBody} id="printable-invoice">
              <h1 style={{textAlign: 'center', marginBottom: '1rem'}}>{t('app_title')}</h1>
              <p><strong>Order ID:</strong> {lastOrder.id}</p>
              <p><strong>Date:</strong> {new Date(lastOrder.createdAt).toLocaleString()}</p>
              
              <table style={{width: '100%', marginTop: '1rem', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{borderBottom: '1px solid #ddd'}}>
                    <th style={{textAlign: 'left', padding: '0.5rem'}}>Item</th>
                    <th style={{textAlign: 'right', padding: '0.5rem'}}>Qty</th>
                    <th style={{textAlign: 'right', padding: '0.5rem'}}>Price</th>
                    <th style={{textAlign: 'right', padding: '0.5rem'}}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length === 0 ? (
                    lastOrder.items.map((item: any, i: number) => (
                       <tr key={i} style={{borderBottom: '1px solid #eee'}}>
                        <td style={{padding: '0.5rem'}}>Product ID: {item.productId}</td>
                        <td style={{textAlign: 'right', padding: '0.5rem'}}>{item.quantity}</td>
                        <td style={{textAlign: 'right', padding: '0.5rem'}}>₹{item.priceAtTime.toFixed(2)}</td>
                        <td style={{textAlign: 'right', padding: '0.5rem'}}>₹{item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : null}
                  {/* Wait, cart was cleared. Instead of using cart, we should fetch items from order or simply render from lastOrder */}
                  {lastOrder.items && lastOrder.items.map((item: any, i: number) => (
                    <tr key={i} style={{borderBottom: '1px solid #eee'}}>
                      <td style={{padding: '0.5rem'}}>Product ID: {item.productId.slice(-5)}</td>
                      <td style={{textAlign: 'right', padding: '0.5rem'}}>{item.quantity}</td>
                      <td style={{textAlign: 'right', padding: '0.5rem'}}>₹{item.priceAtTime.toFixed(2)}</td>
                      <td style={{textAlign: 'right', padding: '0.5rem'}}>₹{item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{marginTop: '1rem', textAlign: 'right'}}>
                <p>Tax: ₹{lastOrder.taxAmount.toFixed(2)}</p>
                <p>Discount: ₹{lastOrder.discountAmount.toFixed(2)}</p>
                <h3>Total: ₹{lastOrder.finalAmount.toFixed(2)}</h3>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setIsInvoiceModalOpen(false)} className={styles.closeBtn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
