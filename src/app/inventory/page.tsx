"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Inventory.module.css';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stockQuantity: number;
  sku: string | null;
}

export default function InventoryPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '', price: '', category: '', stockQuantity: '', sku: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        stockQuantity: product.stockQuantity.toString(),
        sku: product.sku || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: '', stockQuantity: '', sku: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('inventory')}</h1>
        <button className={styles.primaryBtn} onClick={() => handleOpenModal()}>
          + {t('add_product')}
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <p style={{ padding: '1rem' }}>Loading...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('product_name')}</th>
                <th>{t('category')}</th>
                <th>{t('price')}</th>
                <th>{t('stock')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    {t('no_data')}
                  </td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className={p.stockQuantity <= 5 ? styles.lowStock : ''}>
                    <td>{p.name} {p.sku && <span className={styles.sku}>({p.sku})</span>}</td>
                    <td>{p.category}</td>
                    <td>₹{p.price.toFixed(2)}</td>
                    <td>
                      <span className={p.stockQuantity <= 5 ? styles.badgeDanger : styles.badgeSuccess}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => handleOpenModal(p)}>{t('edit')}</button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)}>{t('delete')}</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>{editingProduct ? t('edit') : t('add_product')}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>{t('product_name')}</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>{t('price')}</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>{t('stock')}</label>
                  <input required type="number" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>{t('category')}</label>
                  <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>SKU (Optional)</label>
                  <input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>{t('cancel')}</button>
                <button type="submit" className={styles.saveBtn}>{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
