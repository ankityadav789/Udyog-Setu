"use client";
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useStore } from '@/context/StoreContext';
import styles from './Header.module.css';

export default function Header() {
  const { language, toggleLanguage } = useLanguage();
  const { profile, refreshProfile } = useStore();

  const handleProfileClick = async () => {
    if (!profile) return;
    const newName = window.prompt("Update your Business Name:", profile.businessName);
    if (newName && newName.trim() !== profile.businessName) {
      try {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessName: newName.trim() })
        });
        await refreshProfile();
      } catch (e) {
        console.error("Failed to update profile", e);
      }
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.search}>
          {/* Add search later if needed */}
        </div>
        <div className={styles.actions}>
          <button onClick={toggleLanguage} className={styles.langBtn}>
            {language === 'en' ? 'हिन्दी' : 'English'}
          </button>
          <div className={styles.avatar} onClick={handleProfileClick} title="Update Profile">
            {profile?.businessName ? profile.businessName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
