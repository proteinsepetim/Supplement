/*
 * NotificationContext - Kapsamlı Bildirim Sistemi
 * Bildirim Türleri: stok_uyarisi, fiyat_dususu, kampanya, siparis_durumu, genel_duyuru, sistem
 * Özellikler:
 *   - Site içi çan bildirimi (dropdown + tam sayfa)
 *   - Push notification (tarayıcı izni, service worker)
 *   - Bildirim tercihleri (kullanıcı bazlı açma/kapama)
 *   - Admin panelden bildirim gönderme
 *   - Favori, stok alert, son görüntülenen
 *   - Promo banner
 *   - localStorage persist
 */
import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { toast } from 'sonner';

// ===== TYPES =====
export type NotificationType =
  | 'stok_uyarisi'
  | 'fiyat_dususu'
  | 'kampanya'
  | 'siparis_durumu'
  | 'genel_duyuru'
  | 'sistem';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  image?: string;
  // Ek meta veriler
  meta?: {
    productId?: string;
    productName?: string;
    orderId?: string;
    oldPrice?: number;
    newPrice?: number;
    discount?: number;
    campaignCode?: string;
    orderStatus?: string;
    expiresAt?: Date;
  };
  // Push olarak da gönderildi mi?
  pushSent?: boolean;
  // Admin tarafından mı oluşturuldu?
  adminCreated?: boolean;
}

export interface StockAlert {
  productId: string;
  productName: string;
  email: string;
  createdAt: Date;
  notified: boolean;
}

export interface PriceAlert {
  productId: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  email: string;
  createdAt: Date;
  notified: boolean;
}

export interface NotificationPreferences {
  stok_uyarisi: boolean;
  fiyat_dususu: boolean;
  kampanya: boolean;
  siparis_durumu: boolean;
  genel_duyuru: boolean;
  sistem: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  soundEnabled: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  lastWeek: number;
  pushPermission: NotificationPermission | 'unsupported';
}

interface NotificationContextType {
  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // Stock Alerts
  stockAlerts: StockAlert[];
  addStockAlert: (productId: string, productName: string, email: string) => void;
  removeStockAlert: (productId: string) => void;
  hasStockAlert: (productId: string) => boolean;

  // Price Alerts
  priceAlerts: PriceAlert[];
  addPriceAlert: (productId: string, productName: string, targetPrice: number, currentPrice: number, email: string) => void;
  removePriceAlert: (productId: string) => void;
  hasPriceAlert: (productId: string) => boolean;

  // Recently Viewed
  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read' | 'pushSent'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  deleteNotification: (id: string) => void;
  getNotificationsByType: (type: NotificationType) => Notification[];

  // Preferences
  preferences: NotificationPreferences;
  updatePreference: (key: keyof NotificationPreferences, value: boolean) => void;

  // Push Notifications
  pushPermission: NotificationPermission | 'unsupported';
  requestPushPermission: () => Promise<boolean>;
  sendPushNotification: (title: string, options?: NotificationOptions) => void;

  // Stats
  getStats: () => NotificationStats;

  // Admin: Toplu bildirim gönderme
  sendBulkNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'pushSent'>) => void;

  // Promo Banner
  promoBanner: { show: boolean; message: string; code?: string };
  dismissPromoBanner: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ===== HELPERS =====
function generateId() {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  stok_uyarisi: true,
  fiyat_dususu: true,
  kampanya: true,
  siparis_durumu: true,
  genel_duyuru: true,
  sistem: true,
  pushEnabled: false,
  emailEnabled: true,
  soundEnabled: true,
};

// Bildirim sesi
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Ses çalamazsa sessizce devam et
  }
}

// ===== DEFAULT NOTIFICATIONS =====
const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'welcome-1',
    type: 'kampanya',
    priority: 'medium',
    title: 'Hoş Geldiniz! 🎉',
    message: 'İlk alışverişinizde %10 indirim fırsatı! Kupon kodunuz: HOSGELDIN10',
    timestamp: new Date(),
    read: false,
    link: '/',
    meta: { campaignCode: 'HOSGELDIN10', discount: 10 },
    adminCreated: true,
  },
  {
    id: 'cargo-free-1',
    type: 'genel_duyuru',
    priority: 'low',
    title: 'Ücretsiz Kargo Fırsatı',
    message: '300 TL ve üzeri siparişlerinizde kargo tamamen ücretsiz! Hemen alışverişe başlayın.',
    timestamp: new Date(Date.now() - 3600000),
    read: false,
    link: '/kategori/protein-tozu',
  },
  {
    id: 'stock-alert-demo-1',
    type: 'stok_uyarisi',
    priority: 'high',
    title: 'Stok Uyarısı: Gold Standard Whey',
    message: 'Takip ettiğiniz Gold Standard Whey Protein 2270gr ürünü tekrar stoklarda! Son 5 adet kaldı.',
    timestamp: new Date(Date.now() - 7200000),
    read: false,
    link: '/urun/gold-standard-whey-2270gr',
    meta: { productId: 'gold-standard-whey', productName: 'Gold Standard Whey 2270gr' },
  },
  {
    id: 'price-drop-demo-1',
    type: 'fiyat_dususu',
    priority: 'high',
    title: 'Fiyat Düştü! Kreatin Monohidrat',
    message: 'Kreatin Monohidrat 500gr ürününün fiyatı 449 TL\'den 379 TL\'ye düştü! %16 indirim.',
    timestamp: new Date(Date.now() - 10800000),
    read: false,
    link: '/urun/kreatin-monohidrat-500gr',
    meta: { productId: 'kreatin-mono', productName: 'Kreatin Monohidrat 500gr', oldPrice: 449, newPrice: 379, discount: 16 },
  },
  {
    id: 'order-demo-1',
    type: 'siparis_durumu',
    priority: 'medium',
    title: 'Siparişiniz Kargoya Verildi',
    message: '#PM10002 numaralı siparişiniz Yurtiçi Kargo ile yola çıktı. Takip No: YK123456789',
    timestamp: new Date(Date.now() - 14400000),
    read: true,
    meta: { orderId: 'PM10002', orderStatus: 'shipped' },
  },
  {
    id: 'campaign-demo-1',
    type: 'kampanya',
    priority: 'medium',
    title: 'Hafta Sonu Kampanyası!',
    message: 'Tüm Hardline ürünlerinde %15 indirim! Kod: HARDLINE15 - Bu Pazar gece yarısına kadar geçerli.',
    timestamp: new Date(Date.now() - 18000000),
    read: true,
    link: '/marka/hardline',
    meta: { campaignCode: 'HARDLINE15', discount: 15, expiresAt: new Date(Date.now() + 86400000) },
    adminCreated: true,
  },
];

// ===== PROVIDER =====
export function NotificationProvider({ children }: { children: ReactNode }) {
  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => loadFromStorage('pm_favorites', []));

  // Stock Alerts
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>(() => loadFromStorage('pm_stock_alerts', []));

  // Price Alerts
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => loadFromStorage('pm_price_alerts', []));

  // Recently Viewed
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => loadFromStorage('pm_recently_viewed', []));

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = loadFromStorage<Notification[] | null>('pm_notifications', null);
    return stored || DEFAULT_NOTIFICATIONS;
  });

  // Preferences
  const [preferences, setPreferences] = useState<NotificationPreferences>(() =>
    loadFromStorage('pm_notification_prefs', DEFAULT_PREFERENCES)
  );

  // Push permission
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });

  // Promo Banner
  const [promoBanner, setPromoBanner] = useState(() => {
    const dismissed = sessionStorage.getItem('pm_promo_dismissed');
    return {
      show: !dismissed,
      message: 'Bugüne özel: Tüm Hardline ürünlerinde %15 indirim! Kod: HARDLINE15',
      code: 'HARDLINE15',
    };
  });

  // Sound ref
  const soundEnabledRef = useRef(preferences.soundEnabled);
  useEffect(() => { soundEnabledRef.current = preferences.soundEnabled; }, [preferences.soundEnabled]);

  // Persist
  useEffect(() => { localStorage.setItem('pm_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('pm_stock_alerts', JSON.stringify(stockAlerts)); }, [stockAlerts]);
  useEffect(() => { localStorage.setItem('pm_price_alerts', JSON.stringify(priceAlerts)); }, [priceAlerts]);
  useEffect(() => { localStorage.setItem('pm_recently_viewed', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);
  useEffect(() => { localStorage.setItem('pm_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('pm_notification_prefs', JSON.stringify(preferences)); }, [preferences]);

  // ===== FAVORITES =====
  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        toast('Favorilerden çıkarıldı');
        return prev.filter(id => id !== productId);
      } else {
        toast.success('Favorilere eklendi!');
        return [...prev, productId];
      }
    });
  }, []);

  const isFavorite = useCallback((productId: string) => favorites.includes(productId), [favorites]);

  // ===== STOCK ALERTS =====
  const addStockAlert = useCallback((productId: string, productName: string, email: string) => {
    setStockAlerts(prev => {
      if (prev.some(a => a.productId === productId)) {
        toast.info('Bu ürün için zaten stok bildirimi kaydınız var.');
        return prev;
      }
      toast.success('Stok bildirimi kaydedildi! Ürün stoğa girince bilgilendireceğiz.');
      return [...prev, { productId, productName, email, createdAt: new Date(), notified: false }];
    });
  }, []);

  const removeStockAlert = useCallback((productId: string) => {
    setStockAlerts(prev => prev.filter(a => a.productId !== productId));
    toast('Stok bildirimi iptal edildi.');
  }, []);

  const hasStockAlert = useCallback((productId: string) => stockAlerts.some(a => a.productId === productId), [stockAlerts]);

  // ===== PRICE ALERTS =====
  const addPriceAlert = useCallback((productId: string, productName: string, targetPrice: number, currentPrice: number, email: string) => {
    setPriceAlerts(prev => {
      if (prev.some(a => a.productId === productId)) {
        toast.info('Bu ürün için zaten fiyat bildirimi kaydınız var.');
        return prev;
      }
      toast.success(`Fiyat bildirimi kaydedildi! ${targetPrice} TL altına düşünce bilgilendireceğiz.`);
      return [...prev, { productId, productName, targetPrice, currentPrice, email, createdAt: new Date(), notified: false }];
    });
  }, []);

  const removePriceAlert = useCallback((productId: string) => {
    setPriceAlerts(prev => prev.filter(a => a.productId !== productId));
    toast('Fiyat bildirimi iptal edildi.');
  }, []);

  const hasPriceAlert = useCallback((productId: string) => priceAlerts.some(a => a.productId === productId), [priceAlerts]);

  // ===== RECENTLY VIEWED =====
  const addRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== productId);
      return [productId, ...filtered].slice(0, 20);
    });
  }, []);

  // ===== NOTIFICATIONS =====
  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read' | 'pushSent'>) => {
    // Tercih kontrolü
    if (!preferences[n.type as keyof NotificationPreferences]) return;

    const newNotif: Notification = {
      ...n,
      id: generateId(),
      timestamp: new Date(),
      read: false,
      pushSent: false,
    };

    setNotifications(prev => [newNotif, ...prev].slice(0, 100)); // Max 100 bildirim

    // Ses çal
    if (soundEnabledRef.current) {
      playNotificationSound();
    }

    // Push notification gönder
    if (preferences.pushEnabled && pushPermission === 'granted') {
      try {
        new window.Notification(newNotif.title, {
          body: newNotif.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: newNotif.id,
          data: { link: newNotif.link },
        });
        newNotif.pushSent = true;
      } catch {
        // Push gönderilemezse sessizce devam et
      }
    }

    // Toast göster (urgent ve high priority için)
    if (n.priority === 'urgent' || n.priority === 'high') {
      toast(newNotif.title, { description: newNotif.message });
    }
  }, [preferences, pushPermission]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('pm_notifications');
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const getNotificationsByType = useCallback((type: NotificationType) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ===== PREFERENCES =====
  const updatePreference = useCallback((key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    toast.success('Bildirim tercihi güncellendi.');
  }, []);

  // ===== PUSH NOTIFICATIONS =====
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('Tarayıcınız push bildirimleri desteklemiyor.');
      setPushPermission('unsupported');
      return false;
    }

    try {
      const permission = await window.Notification.requestPermission();
      setPushPermission(permission);

      if (permission === 'granted') {
        setPreferences(prev => ({ ...prev, pushEnabled: true }));
        toast.success('Push bildirimleri etkinleştirildi!');

        // Test bildirimi
        new window.Notification('ProteinMarket Bildirimleri Aktif!', {
          body: 'Artık stok uyarıları, fiyat düşüşleri ve kampanyalardan anında haberdar olacaksınız.',
          icon: '/favicon.ico',
        });
        return true;
      } else {
        toast.error('Push bildirim izni reddedildi.');
        setPreferences(prev => ({ ...prev, pushEnabled: false }));
        return false;
      }
    } catch {
      toast.error('Push bildirim izni alınamadı.');
      return false;
    }
  }, []);

  const sendPushNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (pushPermission === 'granted' && preferences.pushEnabled) {
      try {
        new window.Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });
      } catch {
        // Sessizce devam et
      }
    }
  }, [pushPermission, preferences.pushEnabled]);

  // ===== STATS =====
  const getStats = useCallback((): NotificationStats => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const byType: Record<NotificationType, number> = {
      stok_uyarisi: 0,
      fiyat_dususu: 0,
      kampanya: 0,
      siparis_durumu: 0,
      genel_duyuru: 0,
      sistem: 0,
    };
    notifications.forEach(n => { byType[n.type]++; });

    return {
      total: notifications.length,
      unread: unreadCount,
      byType,
      lastWeek: notifications.filter(n => new Date(n.timestamp) > oneWeekAgo).length,
      pushPermission,
    };
  }, [notifications, unreadCount, pushPermission]);

  // ===== ADMIN BULK =====
  const sendBulkNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'pushSent'>) => {
    const newNotif: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false,
      pushSent: false,
      adminCreated: true,
    };

    setNotifications(prev => [newNotif, ...prev].slice(0, 100));

    if (soundEnabledRef.current) playNotificationSound();

    if (preferences.pushEnabled && pushPermission === 'granted') {
      try {
        new window.Notification(newNotif.title, {
          body: newNotif.message,
          icon: '/favicon.ico',
          tag: newNotif.id,
        });
        newNotif.pushSent = true;
      } catch { /* */ }
    }

    toast.success('Bildirim başarıyla gönderildi!');
  }, [preferences.pushEnabled, pushPermission]);

  // ===== PROMO BANNER =====
  const dismissPromoBanner = useCallback(() => {
    setPromoBanner(prev => ({ ...prev, show: false }));
    sessionStorage.setItem('pm_promo_dismissed', 'true');
  }, []);

  return (
    <NotificationContext.Provider value={{
      favorites, toggleFavorite, isFavorite,
      stockAlerts, addStockAlert, removeStockAlert, hasStockAlert,
      priceAlerts, addPriceAlert, removePriceAlert, hasPriceAlert,
      recentlyViewed, addRecentlyViewed,
      notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotifications, deleteNotification, getNotificationsByType,
      preferences, updatePreference,
      pushPermission, requestPushPermission, sendPushNotification,
      getStats,
      sendBulkNotification,
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
