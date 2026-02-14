/*
 * PushNotificationBanner - Push bildirim izni isteme banner'ı
 * İlk ziyarette veya izin verilmemişse gösterilir
 * Kullanıcı kapatırsa 7 gün boyunca tekrar gösterilmez
 */
import { useState, useEffect } from 'react';
import { Bell, X, BellRing } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function PushNotificationBanner() {
  const { pushPermission, requestPushPermission, preferences } = useNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Push zaten izin verilmişse veya desteklenmiyorsa gösterme
    if (pushPermission === 'granted' || pushPermission === 'denied' || pushPermission === 'unsupported') return;
    if (preferences.pushEnabled) return;

    // Daha önce kapatılmışsa ve 7 gün geçmemişse gösterme
    const dismissed = localStorage.getItem('pm_push_banner_dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    // 3 saniye sonra göster (sayfa yüklenmesini bekleme)
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [pushPermission, preferences.pushEnabled]);

  const handleAllow = async () => {
    await requestPushPermission();
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('pm_push_banner_dismissed', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:w-[380px] z-[60] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Gradient top bar */}
          <div className="h-1 bg-gradient-to-r from-[#FF6B35] via-orange-400 to-amber-400" />

          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                <BellRing className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-sm text-[#1B2A4A]">Bildirimleri Açın!</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Stok uyarıları, fiyat düşüşleri ve kampanyalardan anında haberdar olun. Bildirimleri istediğiniz zaman kapatabilirsiniz.
                </p>
              </div>
              <button onClick={handleDismiss} className="p-1 text-gray-400 hover:text-gray-600 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleAllow}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#FF6B35] text-white py-2.5 rounded-lg text-xs font-heading font-bold hover:bg-orange-600 transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                Bildirimleri Aç
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 text-xs text-gray-500 font-medium hover:text-gray-700 transition-colors"
              >
                Şimdi Değil
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
