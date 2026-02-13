import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

export default function WhatsAppButton() {
  const [location] = useLocation();

  const getWhatsAppUrl = () => {
    const baseUrl = 'https://wa.me/905001234567';
    const currentUrl = window.location.href;

    if (location.startsWith('/urun/')) {
      return `${baseUrl}?text=${encodeURIComponent(`Merhaba, şu ürün hakkında sorum var: ${currentUrl}`)}`;
    }
    return `${baseUrl}?text=${encodeURIComponent('Merhaba, ürünleriniz hakkında bilgi almak istiyorum.')}`;
  };

  return (
    <motion.a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: 'spring' }}
      title="WhatsApp ile iletişime geçin"
    >
      <MessageCircle className="w-7 h-7" />
    </motion.a>
  );
}
