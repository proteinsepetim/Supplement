/*
 * StockAlertModal - Stok Gelince Haber Ver
 * E-posta ile bildirim kaydı
 */
import { useState } from 'react';
import { X, Bell, Mail, CheckCircle } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

interface StockAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export default function StockAlertModal({ isOpen, onClose, productId, productName }: StockAlertModalProps) {
  const { addStockAlert, hasStockAlert } = useNotifications();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const alreadyRegistered = hasStockAlert(productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    addStockAlert(productId, productName, email);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setEmail('');
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[70]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm mx-4"
          >
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2a3d5c] p-5 text-center relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
                <div className="w-14 h-14 bg-[#FF6B35]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-7 h-7 text-[#FF6B35]" />
                </div>
                <h2 className="font-heading font-bold text-lg text-white">Stok Gelince Haber Ver</h2>
                <p className="text-gray-300 text-xs mt-1 line-clamp-1">{productName}</p>
              </div>

              <div className="p-5">
                {alreadyRegistered ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="font-heading font-semibold text-[#1B2A4A]">Zaten kayıtlısınız!</p>
                    <p className="text-sm text-gray-500 mt-1">Bu ürün stoğa girdiğinde size haber vereceğiz.</p>
                  </div>
                ) : submitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="font-heading font-semibold text-[#1B2A4A]">Kaydınız Alındı!</p>
                    <p className="text-sm text-gray-500 mt-1">Ürün stoğa girdiğinde e-posta ile bilgilendireceğiz.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <p className="text-sm text-gray-600 mb-4">Bu ürün şu an stokta yok. E-posta adresinizi bırakın, stoğa girdiğinde ilk siz haberdar olun!</p>
                    <div className="relative mb-4">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="E-posta adresiniz"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#FF6B35] text-white py-3 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      Beni Haberdar Et
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
