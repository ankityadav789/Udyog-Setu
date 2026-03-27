"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type StoreProfile = {
  id?: string;
  businessName: string;
  category: string;
  isOnboarded: boolean;
};

type StoreContextType = {
  profile: StoreProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.isOnboarded ? data : null);
      } else {
        setProfile(null);
      }
    } catch (e) {
      console.error(e);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <StoreContext.Provider value={{ profile, loading, refreshProfile: fetchProfile }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
