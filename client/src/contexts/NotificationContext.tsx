/*
 * NotificationContext - Gelişmiş Bildirim Sistemi
 * - Stok alarmı (e-posta kayıt)
 * - Kampanya bildirimleri (pop-up banner)
 * - Sepete ekleme bildirimi
 * - Favori ekleme/çıkarma
 * - Son görüntülenen ürünler
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Product } from '@/lib/data';
import { toast } from 'sonner';

export interface StockAlert {
  productId: string;
  email: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'promo';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // Stock Alerts
  stockAlerts: StockAlert[];
  addStockAlert: (productId: string, email: string) => void;
  hasStockAlert: (productId: string) => boolean;

  // Recently Viewed
  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;

  // Promo Banner
  promoBanner: { show: boolean; message: string; code?: string };
  dismissPromoBanner: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  // Favorites - localStorage persist
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('pm_favorites') || '[]'); } catch { return []; }
  });

  // Stock Alerts - localStorage persist
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>(() => {
    try { return JSON.parse(localStorage.getItem('pm_stock_alerts') || '[]'); } catch { return []; }
  });

  // Recently Viewed - localStorage persist
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('pm_recently_viewed') || '[]'); } catch { return []; }
  });

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'welcome',
      type: 'promo',
      title: 'Hoş Geldiniz!',
      message: 'İlk alışverişinizde %10 indirim! Kod: HOSGELDIN10',
      timestamp: new Date(),
      read: false,
      link: '/'
    },
    {
      id: 'cargo',
      type: 'info',
      title: 'Ücretsiz Kargo',
      message: '300 TL üzeri siparişlerde ücretsiz kargo fırsatını kaçırmayın!',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
    }
  ]);

  // Promo Banner
  const [promoBanner, setPromoBanner] = useState(() => {
    const dismissed = sessionStorage.getItem('pm_promo_dismissed');
    return {
      show: !dismissed,
      message: 'Bugüne özel: Tüm Hardline ürünlerinde %15 indirim!',
      code: 'HARDLINE15'
    };
  });

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('pm_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('pm_stock_alerts', JSON.stringify(stockAlerts)); }, [stockAlerts]);
  useEffect(() => { localStorage.setItem('pm_recently_viewed', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        toast('Favorilerden çıkarıldı', { icon: '💔' });
        return prev.filter(id => id !== productId);
      } else {
        toast.success('Favorilere eklendi!', { icon: '❤️' });
        return [...prev, productId];
      }
    });
  }, []);

  const isFavorite = useCallback((productId: string) => favorites.includes(productId), [favorites]);

  const addStockAlert = useCallback((productId: string, email: string) => {
    setStockAlerts(prev => {
      if (prev.some(a => a.productId === productId)) {
        toast.info('Bu ürün için zaten bildirim kaydınız var.');
        return prev;
      }
      toast.success('Stok bildirimi kaydedildi! Ürün stoğa girince e-posta ile bilgilendireceğiz.');
      return [...prev, { productId, email, createdAt: new Date() }];
    });
  }, []);

  const hasStockAlert = useCallback((productId: string) => stockAlerts.some(a => a.productId === productId), [stockAlerts]);

  const addRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== productId);
      return [productId, ...filtered].slice(0, 12);
    });
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...n,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const dismissPromoBanner = useCallback(() => {
    setPromoBanner(prev => ({ ...prev, show: false }));
    sessionStorage.setItem('pm_promo_dismissed', 'true');
  }, []);

  return (
    <NotificationContext.Provider value={{
      favorites, toggleFavorite, isFavorite,
      stockAlerts, addStockAlert, hasStockAlert,
      recentlyViewed, addRecentlyViewed,
      notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotifications,
      promoBanner, dismissPromoBanner,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
