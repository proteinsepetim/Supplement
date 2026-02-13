/*
 * PromoBanner - Üst kısımda kayar kampanya bildirimi
 * Kapatılabilir, session boyunca hatırlanır
 */
import { X, Sparkles } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromoBanner() {
  const { promoBanner, dismissPromoBanner } = useNotifications();

  if (!promoBanner.show) return null;

  const handleCopyCode = () => {
    if (promoBanner.code) {
      navigator.clipboard.writeText(promoBanner.code).then(() => {
        toast.success(`Kod kopyalandı: ${promoBanner.code}`);
      }).catch(() => {
        toast.success(`İndirim kodunuz: ${promoBanner.code}`);
      });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-[#FF6B35] via-orange-500 to-[#FF6B35] text-white overflow-hidden"
      >
        <div className="container flex items-center justify-center gap-3 py-2 relative">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="text-xs sm:text-sm font-medium">{promoBanner.message}</span>
          {promoBanner.code && (
            <button
              onClick={handleCopyCode}
              className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full hover:bg-white/30 transition-colors border border-white/30"
            >
              {promoBanner.code}
            </button>
          )}
          <button
            onClick={dismissPromoBanner}
            className="absolute right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
