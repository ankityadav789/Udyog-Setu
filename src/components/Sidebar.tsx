"use client";
import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { t } = useLanguage();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout? This will reset your session profile.")) {
      try {
        await fetch('/api/profile', { method: 'DELETE' });
        window.location.href = '/';
      } catch (e) {
        console.error("Failed to logout", e);
      }
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 14C4 14 7.5 8 12 8C16.5 8 20 14 20 14V22H16V16H8V22H4V14Z" fill="#4f46e5"/>
          <path d="M2 14H22" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <h2 style={{ margin: 0, padding: 0 }}>{t('app_title')}</h2>
      </div>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.link}>{t('dashboard')}</Link>
        <Link href="/pos" className={styles.link}>{t('pos')}</Link>
        <Link href="/inventory" className={styles.link}>{t('inventory')}</Link>
        <Link href="/customers" className={styles.link}>{t('customers')}</Link>
      </nav>
      <div className={styles.footer}>
        <button className={styles.logout} onClick={handleLogout}>{t('logout')}</button>
      </div>
    </aside>
  );
}
