"use client";

import React, { useState } from 'react';
import styles from './Onboarding.module.css';

const CATEGORIES = [
  { id: 'Bakery', icon: '🎂', label: 'Bakery' },
  { id: 'Restaurant', icon: '🍽️', label: 'Restaurant' },
  { id: 'Book Shop', icon: '📚', label: 'Book Shop' },
  { id: 'Salon', icon: '💇', label: 'Salon / Beauty' },
  { id: 'General Store', icon: '🛒', label: 'General Store / Kirana' },
  { id: 'Medical', icon: '🏥', label: 'Medical / Pharmacy' },
  { id: 'Other', icon: '⚙️', label: 'Other MSME' },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (businessName.trim()) setStep(2);
  };

  const handleFinish = async () => {
    if (!category) return;
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, category })
      });
      if (res.ok) {
        window.location.href = '/onboarding/products'; 
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.progress}>Step {step} of 2</div>
        
        {step === 1 && (
          <div className={styles.step}>
            <h2>Welcome to UdyogSetu</h2>
            <p>Let's set up your business bridge.</p>
            <div className={styles.inputGroup}>
              <label>What's your business name?</label>
              <input 
                type="text" 
                value={businessName} 
                onChange={e => setBusinessName(e.target.value)} 
                placeholder="e.g. Sharma Sweets"
                autoFocus
              />
            </div>
            <button 
              className={styles.primaryBtn} 
              onClick={handleNext}
              disabled={!businessName.trim()}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className={styles.step}>
            <h2>Select your Category</h2>
            <p>We'll personalize UdyogSetu for {businessName}.</p>
            
            <div className={styles.grid}>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  className={`${styles.categoryCard} ${category === cat.id ? styles.active : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  <span className={styles.icon}>{cat.icon}</span>
                  <span className={styles.label}>{cat.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.actions}>
              <button 
                className={styles.secondaryBtn} 
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button 
                className={styles.primaryBtn} 
                onClick={handleFinish}
                disabled={!category || loading}
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
