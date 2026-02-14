/*
 * NotificationDropdown - Gelişmiş bildirim çanı dropdown
 * Tüm bildirim türleri, filtre, okundu/okunmadı, silme, link navigasyonu
 */
import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Bell, Check, Trash2, Package, TrendingDown, Tag, Truck, Megaphone, Settings,
  ChevronRight, X, Filter, Volume2, VolumeX
} from 'lucide-react';
import { useNotifications, type NotificationType } from '@/contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Bell; label: string; color: string; bgColor: string }> = {
  stok_uyarisi: { icon: Package, label: 'Stok Uyarısı', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  fiyat_dususu: { icon: TrendingDown, label: 'Fiyat Düşüşü', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  kampanya: { icon: Tag, label: 'Kampanya', color: 'text-[#FF6B35]', bgColor: 'bg-orange-50' },
  siparis_durumu: { icon: Truck, label: 'Sipariş', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  genel_duyuru: { icon: Megaphone, label: 'Duyuru', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  sistem: { icon: Settings, label: 'Sistem', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

const PRIORITY_INDICATOR: Record<string, string> = {
  urgent: 'border-l-4 border-l-red-500',
  high: 'border-l-4 border-l-orange-400',
  medium: 'border-l-4 border-l-blue-300',
  low: '',
};

export default function NotificationDropdown() {
  const {
    notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications,
    deleteNotification, preferences, updatePreference
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = filterType === 'all'
    ? notifications
    : notifications.filter(n => n.type === filterType);

  const formatTime = (ts: Date) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Az önce';
    if (diffMin < 60) return `${diffMin} dk önce`;
    if (diffHr < 24) return `${diffHr} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); setShowSettings(false); }}
        className="relative p-2 text-gray-600 hover:text-[#FF6B35] transition-colors rounded-lg hover:bg-gray-50"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
            style={{ minWidth: 18, minHeight: 18 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[360px] sm:w-[420px] bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#FF6B35]" />
                <h3 className="font-heading font-bold text-sm text-[#1B2A4A]">Bildirimler</h3>
                {unreadCount > 0 && (
                  <span className="bg-[#FF6B35] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 text-gray-400 hover:text-[#1B2A4A] transition-colors rounded"
                  title="Bildirim Ayarları"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] text-[#FF6B35] hover:underline font-medium px-2 py-1">
                    Tümünü Oku
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded" title="Tümünü Temizle">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-gray-100 overflow-hidden"
                >
                  <div className="p-3 bg-gray-50/80 space-y-2">
                    <p className="text-[10px] font-heading font-bold text-gray-500 uppercase tracking-wider">Hızlı Ayarlar</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Bildirim Sesi</span>
                      <button
                        onClick={() => updatePreference('soundEnabled', !preferences.soundEnabled)}
                        className={`p-1 rounded ${preferences.soundEnabled ? 'text-[#FF6B35]' : 'text-gray-300'}`}
                      >
                        {preferences.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </button>
                    </div>
                    <Link
                      href="/bildirim-tercihleri"
                      onClick={() => { setOpen(false); setShowSettings(false); }}
                      className="flex items-center justify-between text-xs text-[#FF6B35] font-medium hover:underline"
                    >
                      Tüm Bildirim Ayarları <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-50 overflow-x-auto">
              <button
                onClick={() => setFilterType('all')}
                className={`text-[10px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                  filterType === 'all' ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Tümü
              </button>
              {(Object.keys(TYPE_CONFIG) as NotificationType[]).map(type => {
                const cfg = TYPE_CONFIG[type];
                const count = notifications.filter(n => n.type === type).length;
                if (count === 0) return null;
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`text-[10px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                      filterType === type ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {cfg.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Bildirim yok</p>
                  <p className="text-xs mt-1">Yeni bildirimler burada görünecek</p>
                </div>
              ) : (
                filtered.slice(0, 20).map(notif => {
                  const cfg = TYPE_CONFIG[notif.type];
                  const Icon = cfg.icon;
                  const priorityClass = PRIORITY_INDICATOR[notif.priority] || '';

                  const content = (
                    <div className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-orange-50/20' : ''} ${priorityClass}`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cfg.bgColor}`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium leading-tight ${!notif.read ? 'text-[#1B2A4A]' : 'text-gray-600'}`}>{notif.title}</p>
                          {!notif.read && <span className="w-2 h-2 bg-[#FF6B35] rounded-full shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>

                        {/* Meta bilgiler */}
                        {notif.meta?.campaignCode && (
                          <span className="inline-block mt-1 text-[10px] font-mono bg-orange-100 text-[#FF6B35] px-1.5 py-0.5 rounded font-bold">
                            {notif.meta.campaignCode}
                          </span>
                        )}
                        {notif.meta?.oldPrice && notif.meta?.newPrice && (
                          <span className="inline-block mt-1 text-[10px] text-green-600 font-semibold">
                            {notif.meta.oldPrice} TL → {notif.meta.newPrice} TL
                          </span>
                        )}
                        {notif.meta?.orderStatus && (
                          <span className="inline-block mt-1 text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">
                            {notif.meta.orderStatus === 'shipped' ? 'Kargoda' : notif.meta.orderStatus === 'delivered' ? 'Teslim Edildi' : notif.meta.orderStatus}
                          </span>
                        )}

                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-[10px] text-gray-400">{formatTime(notif.timestamp)}</p>
                          <div className="flex items-center gap-1">
                            {notif.adminCreated && (
                              <span className="text-[9px] bg-blue-50 text-blue-500 px-1 py-0.5 rounded font-medium">Admin</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteNotification(notif.id); }}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );

                  if (notif.link) {
                    return (
                      <Link
                        key={notif.id}
                        href={notif.link}
                        onClick={() => { markAsRead(notif.id); setOpen(false); }}
                        className="block group border-b border-gray-50 last:border-0"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className="w-full group border-b border-gray-50 last:border-0"
                    >
                      {content}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/50">
                <Link
                  href="/bildirimler"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1 text-xs text-[#FF6B35] font-heading font-semibold hover:underline"
                >
                  Tüm Bildirimleri Gör <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
