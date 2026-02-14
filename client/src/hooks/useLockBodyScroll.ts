import { useEffect } from 'react';

/**
 * useLockBodyScroll - Modal/drawer açıkken body scroll'u kilitler.
 * Mobil tarayıcılarda scroll-through sorununu önler.
 */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Scrollbar genişliğini hesapla (layout shift önleme)
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [locked]);
}
