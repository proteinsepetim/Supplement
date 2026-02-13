/*
 * ExitIntentPopup - Sepet Terk Etme Engelleyici
 * Mouse yukarı kaydığında veya mobilde geri tuşuna basıldığında
 * "Dur! Gitmeden önce %5 İndirim Kodun Burada: DUR5"
 */
import { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Desktop: mouse leave detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !dismissed) {
        setShow(true);
      }
    };

    // Show after 30 seconds if not dismissed
    const timeout = setTimeout(() => {
      if (!dismissed) setShow(true);
    }, 60000);

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timeout);
    };
  }, [dismissed]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('DUR5').then(() => {
      toast.success('İndirim kodu kopyalandı!');
    }).catch(() => {
      toast.success('İndirim kodunuz: DUR5');
    });
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[70]" onClick={handleDismiss} />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md mx-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2a3d5c] p-6 text-center relative">
                <button onClick={handleDismiss} className="absolute top-3 right-3 text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 bg-[#FF6B35]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-8 h-8 text-[#FF6B35]" />
                </div>
                <h2 className="font-heading font-black text-2xl text-white">Dur! Gitmeden Önce...</h2>
                <p className="text-gray-300 text-sm mt-2">Sana özel bir indirim kodumuz var!</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-gray-600 text-sm mb-4">İlk alışverişinde geçerli <span className="font-bold text-[#FF6B35]">%5 indirim</span> kodun:</p>
                <div className="bg-gray-50 border-2 border-dashed border-[#FF6B35] rounded-xl p-4 mb-4">
                  <span className="font-mono font-black text-3xl text-[#FF6B35] tracking-widest">DUR5</span>
                </div>
                <button onClick={handleCopy}
                  className="w-full bg-[#FF6B35] text-white py-3 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors mb-2">
                  Kodu Kopyala & Alışverişe Devam Et
                </button>
                <button onClick={handleDismiss} className="text-xs text-gray-400 hover:text-gray-600">
                  Hayır, teşekkürler
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
