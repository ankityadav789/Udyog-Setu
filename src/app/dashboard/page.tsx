"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Dashboard.module.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

export default function Home() {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading Dashboard...</div>;
  }

  if (!data || data.error) {
    return <div style={{ padding: '2rem', color: 'red' }}>Error loading dashboard data.</div>;
  }

  const { kpi, salesTrend, topProducts } = data;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("dashboard")}</h1>
      
      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <h3>{t("total_sales")}</h3>
          <p>₹ {kpi.totalSales.toFixed(2)}</p>
        </div>
        <div className={styles.kpiCard}>
          <h3>{t("orders_today")}</h3>
          <p>{kpi.ordersToday}</p>
        </div>
      </div>

      {/* Charts Area */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
          <h3>{t("sales_trend")} (Last 30 Days)</h3>
          <div className={styles.chartWrapper}>
            {salesTrend && salesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip formatter={(value) => `₹${value}`} labelStyle={{color: 'black'}} />
                  <Line type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} dot={{r: 4}} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.noData}>{t('no_data')}</div>
            )}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>{t("top_products")}</h3>
          <div className={styles.chartWrapper}>
            {topProducts && topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{fontSize: 12}} />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 12}} width={80} />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Bar dataKey="sales" fill="var(--secondary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.noData}>{t('no_data')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
