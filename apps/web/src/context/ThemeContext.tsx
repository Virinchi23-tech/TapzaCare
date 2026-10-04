import React, { createContext, useContext, useState, useEffect } from 'react';
import { LayoutConfig } from '@tapza/shared-types';
import { api } from '../lib/api';

interface ThemeContextType {
  config: LayoutConfig;
  loading: boolean;
  refetchConfig: () => Promise<void>;
  toggleFestivalMode?: (enable: boolean) => Promise<void>;
}

const defaultFallbackConfig: LayoutConfig = {
  version: 'v1.0.0',
  is_festival: false,
  theme_mode: 'light',
  primary_color: '#0d9488',
  accent_color: '#4f46e5',
  surface_color: '#ffffff',
  sections: [
    {
      id: 'sec-1',
      type: 'hero_banner',
      title: 'Your Health Our Priority',
      description: 'Book trusted doctors, get expert care, and stay healthy — all in one place.',
      visible: true,
      background_type: 'gradient',
      background_value: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
    },
    {
      id: 'sec-2',
      type: 'category_chips',
      title: 'Our Departments',
      visible: true,
      background_type: 'solid',
      background_value: '#f8fafc',
    },
    {
      id: 'sec-3',
      type: 'quick_actions',
      title: 'Quick Services',
      visible: true,
      background_type: 'solid',
      background_value: '#ffffff',
    },
  ],
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<LayoutConfig>(defaultFallbackConfig);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/config');
      if (res.data.success && res.data.data) {
        setConfig(res.data.data);
        if (res.data.data.primary_color) {
          document.documentElement.style.setProperty('--primary-color', res.data.data.primary_color);
        }
        if (res.data.data.accent_color) {
          document.documentElement.style.setProperty('--accent-color', res.data.data.accent_color);
        }
      }
    } catch (err) {
      console.error('Failed to fetch home screen layout config, using default fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const toggleFestivalMode = async (enable: boolean) => {
    setConfig((prev) => ({ ...prev, is_festival: enable }));
  };

  return (
    <ThemeContext.Provider value={{ config, loading, refetchConfig: fetchConfig, toggleFestivalMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeConfig = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeConfig must be used within ThemeProvider');
  return context;
};
