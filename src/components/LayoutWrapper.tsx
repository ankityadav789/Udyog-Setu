"use client";

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './LayoutWrapper.module.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/onboarding') {
    return (
      <LanguageProvider>
        {children}
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <div className={styles.wrapper}>
        <Sidebar />
        <div className={styles.mainContent}>
          <Header />
          <main className={styles.pageContent}>
            {children}
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
}
