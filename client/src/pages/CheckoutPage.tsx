/*
 * CheckoutPage - Athletic Precision Design
 * Tek sayfa ödeme (One Page Checkout), üyeliksiz alışveriş
 * Kargo seçimi, ödeme yöntemi, inline form validasyonları
 * Yasal sözleşme checkbox'ları (Mesafeli Satış + Ön Bilgilendirme)
 * P0: Ödeme demo modda, gerçek ödeme entegrasyonu yok - açıkça belirtildi
 * Güvenlik: Kart bilgileri loglanmaz, input sanitizasyon uygulanır
 */
import { useState } from 'react';
import { Link } from 'wouter';
import { ChevronRight, CreditCard, Truck, Shield, Check, User, MapPin, Phone, Mail, Building, AlertCircle, Info, FileText, ExternalLink } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { getBrandById } from '@/lib/data';
import { toast } from 'sonner';

type Step = 'info' | 'shipping' | 'payment';

interface FormErrors {
  [key: string]: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return /^(\+90|0)?[5][0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

// Input sanitization - strip potential XSS vectors
function sanitize(input: string): string {
  return input.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '');
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<Step>('info');
  const [guestCheckout, setGuestCheckout] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingCost = totalPrice >= 300 ? 0 : 29.90;
  const expressShippingCost = 49.90;
  const codFee = 15;

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', district: '', zipCode: '',
    shippingMethod: 'standard', paymentMethod: 'credit-card',
    cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '',
    notes: '',
    acceptedTerms: false,
    acceptedPrivacy: false,
  });

  const updateForm = (field: string, value: string | boolean) => {
    if (typeof value === 'string') {
      if (field === 'cardNumber') value = formatCardNumber(value);
      if (field === 'cardExpiry') value = formatExpiry(value);
      if (field === 'cardCvv') value = value.replace(/\D/g, '').slice(0, 4);
      // Sanitize text inputs (not card fields which are already formatted)
      if (!['cardNumber', 'cardExpiry', 'cardCvv'].includes(field)) {
        value = sanitize(value);
      }
    }
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const validateInfoStep = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Ad zorunludur';
    else if (form.firstName.trim().length < 2) newErrors.firstName = 'Ad en az 2 karakter olmalıdır';
    if (!form.lastName.trim()) newErrors.lastName = 'Soyad zorunludur';
    else if (form.lastName.trim().length < 2) newErrors.lastName = 'Soyad en az 2 karakter olmalıdır';
    if (!form.email.trim()) newErrors.email = 'E-posta zorunludur';
    else if (!validateEmail(form.email)) newErrors.email = 'Geçerli bir e-posta girin';
    if (!form.phone.trim()) newErrors.phone = 'Telefon zorunludur';
    else if (!validatePhone(form.phone)) newErrors.phone = 'Geçerli bir telefon numarası girin (05XX XXX XX XX)';
    if (!form.address.trim()) newErrors.address = 'Adres zorunludur';
    else if (form.address.trim().length < 10) newErrors.address = 'Adres en az 10 karakter olmalıdır';
    if (!form.city.trim()) newErrors.city = 'İl zorunludur';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentStep = (): boolean => {
    const newErrors: FormErrors = {};
    if (form.paymentMethod === 'credit-card') {
      if (form.cardNumber.replace(/\s/g, '').length < 16) newErrors.cardNumber = 'Geçerli bir kart numarası girin';
      if (!form.cardName.trim()) newErrors.cardName = 'Kart üzerindeki isim zorunludur';
      if (form.cardExpiry.length < 5) newErrors.cardExpiry = 'Geçerli bir tarih girin (AA/YY)';
      if (form.cardCvv.length < 3) newErrors.cardCvv = 'Geçerli bir CVV girin';
    }
    // Legal checkbox validations
    if (!form.acceptedTerms) newErrors.acceptedTerms = 'Mesafeli Satış Sözleşmesi\'ni kabul etmeniz gerekmektedir';
    if (!form.acceptedPrivacy) newErrors.acceptedPrivacy = 'Ön Bilgilendirme Formu\'nu kabul etmeniz gerekmektedir';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (nextStep: Step) => {
    if (step === 'info' && !validateInfoStep()) {
      toast.error('Lütfen tüm zorunlu alanları doğru doldurun');
      return;
    }
    setStep(nextStep);
  };

  const getShippingTotal = () => {
    if (form.shippingMethod === 'express') return expressShippingCost;
    return shippingCost;
  };

  const getCodFee = () => form.paymentMethod === 'cash-on-delivery' ? codFee : 0;
  const finalTotal = totalPrice + getShippingTotal() + getCodFee();

  const handlePlaceOrder = async () => {
    if (!validatePaymentStep()) {
      toast.error('Lütfen ödeme bilgilerini ve yasal sözleşmeleri kontrol edin');
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate order number
      const newOrderNumber = `PM${Date.now().toString().slice(-8)}`;
      setOrderNumber(newOrderNumber);

      // SECURITY: Card details are NOT logged or sent to backend in demo mode
      // In production, card details would go directly to payment gateway (e.g., Stripe)
      console.log('[Order] Demo order placed:', {
        orderNumber: newOrderNumber,
        itemCount: items.length,
        shippingMethod: form.shippingMethod,
        paymentMethod: form.paymentMethod,
        city: form.city,
        // NEVER log: cardNumber, cardCvv, cardExpiry
      });

      setOrderPlaced(true);
      clearCart();
      toast.success('Demo sipariş oluşturuldu!');
    } catch {
      toast.error('Sipariş oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const FieldError = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    // Show error if field is touched OR if it's a checkbox (always show)
    if (!touched[field] && !['acceptedTerms', 'acceptedPrivacy'].includes(field)) return null;
    return (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> {errors[field]}
      </p>
    );
  };

  if (orderPlaced) {
    return (
      <div className="container py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-heading font-bold text-3xl text-[#1B2A4A] mb-3">Siparişiniz Alındı!</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-md mx-auto mb-4">
          <div className="flex items-center gap-2 text-amber-700 text-sm">
            <Info className="w-4 h-4 shrink-0" />
            <span>Bu bir <strong>demo sipariştir</strong>. Gerçek ödeme işlemi yapılmamıştır.</span>
          </div>
        </div>
        <p className="text-gray-500 mb-2">Sipariş numaranız: <span className="font-bold text-[#FF6B35]">#{orderNumber}</span></p>
        <p className="text-gray-400 text-sm mb-8">Gerçek ödeme entegrasyonu aktif olduğunda siparişleriniz işleme alınacaktır.</p>
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
        {/* Demo Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-sm text-amber-700">Bu sayfa <strong>demo modundadır</strong>. Gerçek ödeme işlemi yapılmaz. Ödeme altyapısı entegre edildiğinde aktif olacaktır.</span>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <button onClick={() => {
                if (s.id === 'info') setStep('info');
                else if (s.id === 'shipping' && step !== 'info') setStep('shipping');
                else if (s.id === 'payment' && step === 'payment') setStep('payment');
              }}
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0" />
                      Üyelik sistemi yakında aktif olacak. Şimdilik üyeliksiz alışveriş yapabilirsiniz.
                    </div>
                    <button onClick={() => setGuestCheckout(true)} className="w-full bg-[#1B2A4A] text-white py-2.5 rounded-lg text-sm font-heading font-semibold hover:bg-[#2a3d5c]">
                      Üyeliksiz Devam Et
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Ad *</label>
                      <input type="text" value={form.firstName} onChange={e => updateForm('firstName', e.target.value)} onBlur={() => markTouched('firstName')}
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm ${errors.firstName && touched.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
                      <FieldError field="firstName" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Soyad *</label>
                      <input type="text" value={form.lastName} onChange={e => updateForm('lastName', e.target.value)} onBlur={() => markTouched('lastName')}
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm ${errors.lastName && touched.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
                      <FieldError field="lastName" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> E-posta *</label>
                      <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} onBlur={() => markTouched('email')}
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm ${errors.email && touched.email ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
                      <FieldError field="email" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Telefon *</label>
                      <input type="tel" value={form.phone} onChange={e => updateForm('phone', e.target.value)} onBlur={() => markTouched('phone')} placeholder="05XX XXX XX XX"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm ${errors.phone && touched.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
                      <FieldError field="phone" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Adres *</label>
                      <textarea value={form.address} onChange={e => updateForm('address', e.target.value)} onBlur={() => markTouched('address')} rows={2}
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm resize-none ${errors.address && touched.address ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
                      <FieldError field="address" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><Building className="w-3 h-3" /> İl *</label>
                      <input type="text" value={form.city} onChange={e => updateForm('city', e.target.value)} onBlur={() => markTouched('city')}
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm ${errors.city && touched.city ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
                      <FieldError field="city" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">İlçe</label>
                      <input type="text" value={form.district} onChange={e => updateForm('district', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                  </div>
                )}

                {guestCheckout && (
                  <button onClick={() => handleNextStep('shipping')} className="w-full mt-4 bg-[#FF6B35] text-white py-3 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors">
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
                    { id: 'standard', name: 'Standart Kargo', time: '2-3 İş Günü', price: totalPrice >= 300 ? 'Ücretsiz' : '29,90 TL' },
                    { id: 'express', name: 'Hızlı Kargo', time: '1-2 İş Günü', price: '49,90 TL' },
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
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none" maxLength={500} />
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

                <div className="space-y-3 mb-4">
                  {[
                    { id: 'credit-card', name: 'Kredi / Banka Kartı', desc: 'Güvenli ödeme (demo)' },
                    { id: 'bank-transfer', name: 'Havale / EFT', desc: 'Banka havalesi ile ödeme' },
                    { id: 'cash-on-delivery', name: 'Kapıda Ödeme', desc: `+${codFee} TL kapıda ödeme ücreti` },
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
                      <input type="text" value={form.cardNumber} onChange={e => updateForm('cardNumber', e.target.value)} onBlur={() => markTouched('cardNumber')} placeholder="0000 0000 0000 0000"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm font-mono ${errors.cardNumber && touched.cardNumber ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} maxLength={19} autoComplete="cc-number" />
                      <FieldError field="cardNumber" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Kart Üzerindeki İsim</label>
                      <input type="text" value={form.cardName} onChange={e => updateForm('cardName', e.target.value)} onBlur={() => markTouched('cardName')}
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm ${errors.cardName && touched.cardName ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} autoComplete="cc-name" />
                      <FieldError field="cardName" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Son Kullanma</label>
                        <input type="text" value={form.cardExpiry} onChange={e => updateForm('cardExpiry', e.target.value)} onBlur={() => markTouched('cardExpiry')} placeholder="AA/YY"
                          className={`w-full px-3 py-2.5 border rounded-lg text-sm ${errors.cardExpiry && touched.cardExpiry ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} maxLength={5} autoComplete="cc-exp" />
                        <FieldError field="cardExpiry" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">CVV</label>
                        <input type="password" value={form.cardCvv} onChange={e => updateForm('cardCvv', e.target.value)} onBlur={() => markTouched('cardCvv')} placeholder="***"
                          className={`w-full px-3 py-2.5 border rounded-lg text-sm ${errors.cardCvv && touched.cardCvv ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} maxLength={4} autoComplete="cc-csc" />
                        <FieldError field="cardCvv" />
                      </div>
                    </div>
                  </div>
                )}

                {form.paymentMethod === 'bank-transfer' && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                      <p className="font-semibold mb-2">Havale / EFT Bilgileri</p>
                      <p>Banka: Ziraat Bankası</p>
                      <p>IBAN: TR00 0000 0000 0000 0000 0000 00</p>
                      <p>Hesap Sahibi: ProteinMarket Ltd. Şti.</p>
                      <p className="text-xs text-blue-600 mt-2">Sipariş numaranızı açıklama kısmına yazınız.</p>
                    </div>
                  </div>
                )}

                {/* Legal Agreements - Required Checkboxes */}
                <div className="border-t border-gray-100 mt-5 pt-5 space-y-3">
                  <h3 className="font-heading font-semibold text-sm text-[#1B2A4A] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#FF6B35]" />
                    Yasal Sözleşmeler
                  </h3>

                  <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    form.acceptedTerms ? 'border-green-200 bg-green-50' : errors.acceptedTerms ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={form.acceptedTerms}
                      onChange={e => updateForm('acceptedTerms', e.target.checked)}
                      className="w-5 h-5 min-w-[20px] mt-0.5 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35]"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-700">
                        <Link href="/sayfa/mesafeli-satis" className="text-[#FF6B35] font-semibold hover:underline inline-flex items-center gap-1" target="_blank">
                          Mesafeli Satış Sözleşmesi <ExternalLink className="w-3 h-3" />
                        </Link>
                        {' '}okudum ve kabul ediyorum. <span className="text-red-500">*</span>
                      </span>
                    </div>
                  </label>
                  <FieldError field="acceptedTerms" />

                  <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    form.acceptedPrivacy ? 'border-green-200 bg-green-50' : errors.acceptedPrivacy ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={form.acceptedPrivacy}
                      onChange={e => updateForm('acceptedPrivacy', e.target.checked)}
                      className="w-5 h-5 min-w-[20px] mt-0.5 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35]"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-700">
                        <Link href="/sayfa/gizlilik-politikasi" className="text-[#FF6B35] font-semibold hover:underline inline-flex items-center gap-1" target="_blank">
                          Ön Bilgilendirme Formu <ExternalLink className="w-3 h-3" />
                        </Link>
                        {' '}ve{' '}
                        <Link href="/sayfa/kvkk" className="text-[#FF6B35] font-semibold hover:underline inline-flex items-center gap-1" target="_blank">
                          KVKK Aydınlatma Metni <ExternalLink className="w-3 h-3" />
                        </Link>
                        {' '}okudum ve kabul ediyorum. <span className="text-red-500">*</span>
                      </span>
                    </div>
                  </label>
                  <FieldError field="acceptedPrivacy" />
                </div>

                <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>256-bit SSL şifreleme ile güvenli bağlantı</span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-[#FF6B35] text-white py-3.5 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'İşleniyor...' : `Demo Sipariş Oluştur - ${finalTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`}
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
                    <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded object-cover" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-gray-400">{item.variant.flavor} x {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-[#1B2A4A] whitespace-nowrap">{(item.variant.price * item.quantity).toLocaleString('tr-TR')} TL</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-3 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Ara Toplam</span><span>{totalPrice.toLocaleString('tr-TR')} TL</span></div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Kargo</span>
                  <span className={getShippingTotal() === 0 ? 'text-green-600' : ''}>{getShippingTotal() === 0 ? 'Ücretsiz' : `${getShippingTotal().toLocaleString('tr-TR')} TL`}</span>
                </div>
                {getCodFee() > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Kapıda Ödeme</span><span>{codFee} TL</span></div>}
              </div>
              <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                <span className="font-heading font-bold text-[#1B2A4A]">Toplam</span>
                <span className="font-heading font-bold text-xl text-[#FF6B35]">{finalTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
