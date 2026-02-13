/*
 * CheckoutPage - Athletic Precision Design
 * Tek sayfa ödeme (One Page Checkout), üyeliksiz alışveriş seçeneği,
 * Muscle Points harcama, kargo seçimi, ödeme yöntemi
 */
import { useState } from 'react';
import { Link } from 'wouter';
import { ChevronRight, CreditCard, Truck, Shield, Check, User, MapPin, Phone, Mail, Building } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { getBrandById } from '@/lib/data';
import { toast } from 'sonner';

type Step = 'info' | 'shipping' | 'payment';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<Step>('info');
  const [guestCheckout, setGuestCheckout] = useState(true);
  const [usePoints, setUsePoints] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const musclePoints = 350;
  const pointsValue = Math.min(musclePoints, Math.floor(totalPrice * 0.1));
  const shippingCost = totalPrice >= 300 ? 0 : 29.90;
  const pointsDiscount = usePoints ? pointsValue : 0;
  const finalTotal = totalPrice + shippingCost - pointsDiscount;

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', district: '', zipCode: '',
    shippingMethod: 'standard', paymentMethod: 'credit-card',
    cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '',
    notes: '',
  });

  const updateForm = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handlePlaceOrder = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.address || !form.city) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <div className="container py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-heading font-bold text-3xl text-[#1B2A4A] mb-3">Siparişiniz Alındı!</h1>
        <p className="text-gray-500 mb-2">Sipariş numaranız: <span className="font-bold text-[#FF6B35]">#PM{Date.now().toString().slice(-8)}</span></p>
        <p className="text-gray-400 text-sm mb-8">Siparişiniz en kısa sürede hazırlanıp kargoya verilecektir.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors">
          Alışverişe Devam Et
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading font-bold text-2xl text-[#1B2A4A] mb-4">Sepetiniz boş</h1>
        <Link href="/" className="text-[#FF6B35] font-semibold hover:underline">Alışverişe Başla</Link>
      </div>
    );
  }

  const steps: { id: Step; label: string; icon: typeof User }[] = [
    { id: 'info', label: 'Bilgiler', icon: User },
    { id: 'shipping', label: 'Kargo', icon: Truck },
    { id: 'payment', label: 'Ödeme', icon: CreditCard },
  ];

  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#FF6B35]">Anasayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/sepet" className="hover:text-[#FF6B35]">Sepetim</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1B2A4A] font-medium">Ödeme</span>
          </nav>
        </div>
      </div>

      <div className="container py-6">
        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <button onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-colors ${
                  step === s.id ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                <s.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
              {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* Guest / Login Toggle */}
            {step === 'info' && (
              <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
                <div className="flex gap-3 mb-4">
                  <button onClick={() => setGuestCheckout(true)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-heading font-semibold border-2 transition-colors ${guestCheckout ? 'border-[#FF6B35] text-[#FF6B35] bg-orange-50' : 'border-gray-200 text-gray-500'}`}>
                    Üyeliksiz Alışveriş
                  </button>
                  <button onClick={() => setGuestCheckout(false)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-heading font-semibold border-2 transition-colors ${!guestCheckout ? 'border-[#FF6B35] text-[#FF6B35] bg-orange-50' : 'border-gray-200 text-gray-500'}`}>
                    Giriş Yap
                  </button>
                </div>

                {!guestCheckout ? (
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      onClick={() => toast('Google ile giriş yakında aktif olacak!')}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Google ile Giriş Yap
                    </button>
                    <p className="text-center text-xs text-gray-400">veya</p>
                    <input type="email" placeholder="E-posta adresiniz" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    <input type="password" placeholder="Şifreniz" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    <button className="w-full bg-[#1B2A4A] text-white py-2.5 rounded-lg text-sm font-heading font-semibold hover:bg-[#2a3d5c]" onClick={() => toast('Giriş sistemi yakında aktif olacak!')}>Giriş Yap</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block flex items-center gap-1"><User className="w-3 h-3" /> Ad *</label>
                      <input type="text" value={form.firstName} onChange={e => updateForm('firstName', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Soyad *</label>
                      <input type="text" value={form.lastName} onChange={e => updateForm('lastName', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block flex items-center gap-1"><Mail className="w-3 h-3" /> E-posta *</label>
                      <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block flex items-center gap-1"><Phone className="w-3 h-3" /> Telefon *</label>
                      <input type="tel" value={form.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-gray-500 mb-1 block flex items-center gap-1"><MapPin className="w-3 h-3" /> Adres *</label>
                      <textarea value={form.address} onChange={e => updateForm('address', e.target.value)} rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block flex items-center gap-1"><Building className="w-3 h-3" /> İl *</label>
                      <input type="text" value={form.city} onChange={e => updateForm('city', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">İlçe</label>
                      <input type="text" value={form.district} onChange={e => updateForm('district', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                  </div>
                )}

                {guestCheckout && (
                  <button onClick={() => setStep('shipping')} className="w-full mt-4 bg-[#FF6B35] text-white py-3 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors">
                    Devam Et: Kargo Seçimi
                  </button>
                )}
              </div>
            )}

            {/* Shipping */}
            {step === 'shipping' && (
              <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
                <h2 className="font-heading font-bold text-lg text-[#1B2A4A] mb-4">Kargo Seçimi</h2>
                <div className="space-y-3">
                  {[
                    { id: 'standard', name: 'Standart Kargo (Yurtiçi Kargo)', time: '2-3 İş Günü', price: totalPrice >= 300 ? 'Ücretsiz' : '29,90 TL' },
                    { id: 'express', name: 'Hızlı Kargo (Aras Kargo)', time: '1-2 İş Günü', price: '49,90 TL' },
                  ].map(method => (
                    <label key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        form.shippingMethod === method.id ? 'border-[#FF6B35] bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <input type="radio" name="shipping" value={method.id} checked={form.shippingMethod === method.id}
                        onChange={e => updateForm('shippingMethod', e.target.value)} className="text-[#FF6B35] focus:ring-[#FF6B35]" />
                      <div className="flex-1">
                        <p className="font-heading font-semibold text-sm text-[#1B2A4A]">{method.name}</p>
                        <p className="text-xs text-gray-400">{method.time}</p>
                      </div>
                      <span className={`font-heading font-bold text-sm ${method.price === 'Ücretsiz' ? 'text-green-600' : 'text-[#1B2A4A]'}`}>{method.price}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Sipariş Notu</label>
                  <textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)} rows={2} placeholder="Varsa eklemek istediğiniz not..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none" />
                </div>
                <button onClick={() => setStep('payment')} className="w-full mt-4 bg-[#FF6B35] text-white py-3 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors">
                  Devam Et: Ödeme
                </button>
              </div>
            )}

            {/* Payment */}
            {step === 'payment' && (
              <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
                <h2 className="font-heading font-bold text-lg text-[#1B2A4A] mb-4">Ödeme Yöntemi</h2>

                {/* Muscle Points */}
                {musclePoints > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={usePoints} onChange={e => setUsePoints(e.target.checked)}
                        className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500" />
                      <div>
                        <span className="font-heading font-semibold text-sm text-purple-800">Muscle Points Kullan</span>
                        <span className="text-xs text-purple-600 block">{musclePoints} Puan = {pointsValue} TL indirim</span>
                      </div>
                    </label>
                  </div>
                )}

                <div className="space-y-3 mb-4">
                  {[
                    { id: 'credit-card', name: 'Kredi / Banka Kartı', desc: 'Iyzico güvenli ödeme' },
                    { id: 'bank-transfer', name: 'Havale / EFT', desc: 'Banka havalesi ile ödeme' },
                    { id: 'cash-on-delivery', name: 'Kapıda Ödeme', desc: '+15 TL kapıda ödeme ücreti' },
                  ].map(method => (
                    <label key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        form.paymentMethod === method.id ? 'border-[#FF6B35] bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <input type="radio" name="payment" value={method.id} checked={form.paymentMethod === method.id}
                        onChange={e => updateForm('paymentMethod', e.target.value)} className="text-[#FF6B35] focus:ring-[#FF6B35]" />
                      <div>
                        <p className="font-heading font-semibold text-sm text-[#1B2A4A]">{method.name}</p>
                        <p className="text-xs text-gray-400">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {form.paymentMethod === 'credit-card' && (
                  <div className="space-y-3 border-t border-gray-100 pt-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Kart Numarası</label>
                      <input type="text" value={form.cardNumber} onChange={e => updateForm('cardNumber', e.target.value)} placeholder="0000 0000 0000 0000"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono" maxLength={19} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Kart Üzerindeki İsim</label>
                      <input type="text" value={form.cardName} onChange={e => updateForm('cardName', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Son Kullanma</label>
                        <input type="text" value={form.cardExpiry} onChange={e => updateForm('cardExpiry', e.target.value)} placeholder="AA/YY"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" maxLength={5} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">CVV</label>
                        <input type="text" value={form.cardCvv} onChange={e => updateForm('cardCvv', e.target.value)} placeholder="***"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" maxLength={4} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>256-bit SSL şifreleme ile güvenli ödeme</span>
                </div>

                <button onClick={handlePlaceOrder}
                  className="w-full mt-4 bg-[#FF6B35] text-white py-3.5 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors">
                  Siparişi Tamamla - {finalTotal.toLocaleString('tr-TR')} TL
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-36">
              <h2 className="font-heading font-bold text-lg text-[#1B2A4A] mb-4">Sipariş Özeti</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={item.variant.id} className="flex gap-3">
                    <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-gray-400">{item.variant.flavor} × {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-[#1B2A4A] whitespace-nowrap">{(item.variant.price * item.quantity).toLocaleString('tr-TR')} TL</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-3 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Ara Toplam</span><span>{totalPrice.toLocaleString('tr-TR')} TL</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Kargo</span><span className={shippingCost === 0 ? 'text-green-600' : ''}>{shippingCost === 0 ? 'Ücretsiz' : `${shippingCost} TL`}</span></div>
                {pointsDiscount > 0 && <div className="flex justify-between text-sm text-purple-600"><span>Muscle Points</span><span>-{pointsDiscount} TL</span></div>}
              </div>
              <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                <span className="font-heading font-bold text-[#1B2A4A]">Toplam</span>
                <span className="font-heading font-bold text-xl text-[#FF6B35]">{finalTotal.toLocaleString('tr-TR')} TL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
