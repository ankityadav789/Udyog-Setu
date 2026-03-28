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
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let isMounted = true;

  const loadData = async () => {
    try {
      const [resData, insightsData] = await Promise.all([
        fetch(`/api/dashboard?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/insights?t=${Date.now()}`, { cache: 'no-store' })
      ]);

      if (!resData.ok || !insightsData.ok) {
        throw new Error("API failed");
      }

      const dashboardJson = await resData.json();
      const insightsJson = await insightsData.json();

      if (!isMounted) return;

      setData(dashboardJson);
      if (Array.isArray(insightsJson)) setInsights(insightsJson);

      setLoading(false);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      if (isMounted) setLoading(false); // ✅ FIX
    }
  };

  loadData();
  const intervalId = setInterval(loadData, 5000);

  return () => {
    isMounted = false;
    clearInterval(intervalId);
  };
}, []);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading Dashboard...</div>;
  }

  if (!data || data.error) {
    return <div style={{ padding: '2rem', color: 'red' }}>Error loading dashboard data.</div>;
  }

  const kpi = data?.kpi || {};
  const salesTrend = data?.salesTrend || [];
  const topProducts = data?.topProducts || [];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("dashboard")}</h1>
      
      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <h3>{t("total_sales")}</h3>
          <p>₹ {Number(kpi?.totalSales || 0).toFixed(2)}</p>
        </div>
        <div className={styles.kpiCard}>
          <h3>{t("orders_today")}</h3>
          <p>{Number(kpi?.ordersToday || 0)}</p>
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

      {/* AI Smart Insights Area */}
      <div className={styles.chartsGrid} style={{ marginTop: '1.5rem' }}>
        <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
          <h3>AI Smart Insights & Alerts</h3>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {insights.length > 0 ? insights.map((insight, idx) => {
               // Dynamic subtle left-border coloring based on strings
               let borderColor = '#3b82f6';
               if (insight.includes('⚠️')) borderColor = '#ef4444';
               else if (insight.includes('💡')) borderColor = '#f59e0b';
               else if (insight.includes('📈')) borderColor = '#10b981';
               
               return (
                <div key={idx} style={{ 
                  padding: '1rem 1.2rem', 
                  background: '#f8fafc', 
                  borderLeft: `5px solid ${borderColor}`, 
                  borderRadius: '6px', 
                  fontSize: '1.05rem', 
                  color: '#1e293b',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                  {insight}
                </div>
              );
            }) : (
              <p style={{ color: '#64748b' }}>Calculating diagnostics...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
