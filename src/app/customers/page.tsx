"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Customers.module.css';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  totalSpent?: number;
  orderCount?: number;
}

export default function CustomersPage() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenModal = (c?: Customer) => {
    if (c) {
      setEditingCustomer(c);
      setFormData({ name: c.name, phone: c.phone || '', email: c.email || '' });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', email: '' });
    }
    setIsModalOpen(true);
  };

  const handleOpenHistory = async (c: Customer) => {
    setHistoryCustomer(c);
    setIsHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/customers/${c.id}/orders`);
      const data = await res.json();
      if (Array.isArray(data)) setHistoryOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
    const method = editingCustomer ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('customers')}</h1>
        <button className={styles.primaryBtn} onClick={() => handleOpenModal()}>
          + {t('add_customer')}
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <p style={{ padding: '1rem' }}>Loading...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('customer_name')}</th>
                <th>{t('phone')}</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    {t('no_data')}
                  </td>
                </tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                      {c.email && <div className={styles.subtext}>{c.email}</div>}
                    </td>
                    <td>{c.phone || '-'}</td>
                    <td>{c.orderCount || 0}</td>
                    <td className={styles.totalSpent}>₹{(c.totalSpent || 0).toFixed(2)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.primaryBtn} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleOpenHistory(c)}>History</button>
                        <button className={styles.editBtn} onClick={() => handleOpenModal(c)}>{t('edit')}</button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(c.id)}>{t('delete')}</button>
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
            <h2>{editingCustomer ? t('edit') : t('add_customer')}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>{t('customer_name')}</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>{t('phone')} (Optional)</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>{t('email')} (Optional)</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>{t('cancel')}</button>
                <button type="submit" className={styles.saveBtn}>{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isHistoryModalOpen && historyCustomer && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '650px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
               <div>
                 <h2 style={{ marginBottom: '0.2rem', color: '#0f172a' }}>Order Ledger</h2>
                 <p style={{ color: '#64748b', fontSize: '0.95rem' }}>{historyCustomer.name} • {historyCustomer.phone || 'No Phone'}</p>
               </div>
               <button onClick={() => setIsHistoryModalOpen(false)} style={{ background: 'none', border:'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b', padding: '0.5rem' }}>✕</button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
              {loadingHistory ? (
                 <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Loading complete ledger...</p>
              ) : historyOrders.length === 0 ? (
                 <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No orders found for this customer.</p>
              ) : (
                 Object.entries(
                   historyOrders.reduce((acc: any, order: any) => {
                     const date = new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
                     if (!acc[date]) acc[date] = [];
                     acc[date].push(order);
                     return acc;
                   }, {})
                 ).map(([date, dayOrders]: [string, any]) => (
                   <div key={date} style={{ marginBottom: '1.5rem' }}>
                     <h3 style={{ fontSize: '1.05rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>{date}</h3>
                     {dayOrders.map((o: any) => (
                       <div key={o.id} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '0.8rem', border: '1px solid #e2e8f0' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px dashed #cbd5e1' }}>
                           <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>Total: ₹{o.finalAmount.toFixed(2)}</span>
                         </div>
                         <div style={{ fontSize: '0.9rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                           {o.items.map((i: any, idx: number) => (
                             <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                               <span>{i.quantity}x {i.product?.name || 'Unknown Item'}</span>
                               <span style={{ color: '#64748b' }}>₹{i.subtotal.toFixed(2)}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                     ))}
                   </div>
                 ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
