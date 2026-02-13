import type { ReactNode } from 'react';
import { useLocation } from 'wouter';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import CartDrawer from './CartDrawer';
import SearchOverlay from './SearchOverlay';
import ExitIntentPopup from './ExitIntentPopup';
import PromoBanner from './PromoBanner';
import RecentlyViewed from './RecentlyViewed';

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isAdmin = location.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdmin && <PromoBanner />}
      <Header />
      <main className="flex-1">{children}</main>
      {!isAdmin && <RecentlyViewed />}
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppButton />}
      <CartDrawer />
      <SearchOverlay />
      <ExitIntentPopup />
    </div>
  );
}
