/*
 * NotificationDropdown - Header'daki bildirim zili ve dropdown
 * Okunmamış sayısı badge, tıklayınca dropdown açılır
 */
import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Info, Gift, AlertTriangle, Tag } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const typeIcons = {
  info: Info,
  success: Check,
  warning: AlertTriangle,
  promo: Tag,
};

const typeColors = {
  info: 'bg-blue-100 text-blue-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-amber-100 text-amber-600',
  promo: 'bg-orange-100 text-[#FF6B35]',
};

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 hover:text-[#FF6B35] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]"
          >
            {unreadCount}
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
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#FF6B35]" />
                <h3 className="font-heading font-bold text-sm text-[#1B2A4A]">Bildirimler</h3>
                {unreadCount > 0 && (
                  <span className="bg-[#FF6B35] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] text-[#FF6B35] hover:underline font-medium px-2 py-1">
                    Tümünü Oku
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Bildirim yok</p>
                  <p className="text-xs mt-1">Yeni bildirimler burada görünecek</p>
                </div>
              ) : (
                notifications.slice(0, 10).map(notif => {
                  const Icon = typeIcons[notif.type];
                  const colorClass = typeColors[notif.type];
                  return (
                    <button
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!notif.read ? 'bg-orange-50/30' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${!notif.read ? 'text-[#1B2A4A]' : 'text-gray-600'}`}>{notif.title}</p>
                          {!notif.read && <span className="w-2 h-2 bg-[#FF6B35] rounded-full shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(notif.timestamp).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
