import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@shared/utils";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { Check, CreditCard, Truck, ClipboardList, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STEPS = [
  { id: 1, label: "Teslimat", icon: Truck },
  { id: 2, label: "Ödeme", icon: CreditCard },
  { id: 3, label: "Özet", icon: ClipboardList },
];

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const ibansQ = trpc.iban.list.useQuery();

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    city: "",
    district: "",
    neighborhood: "",
    addressLine: "",
    postalCode: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");

  const shippingCost = subtotal >= 50000 ? 0 : 2999;
  const codFee = paymentMethod === "cod" ? 999 : 0;
  const total = subtotal + shippingCost + codFee;

  const createOrderMutation = trpc.order.create.useMutation({
    onSuccess: (data: any) => {
      clearCart();
      toast.success("Siparişiniz alındı!");
      setLocation(`/order-success/${data.orderNumber}`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Giriş Yapmanız Gerekiyor</h1>
          <p className="text-muted-foreground mb-6">Sipariş vermek için lütfen giriş yapın.</p>
          <Button onClick={() => window.location.href = getLoginUrl()}>Giriş Yap</Button>
        </main>
        <StoreFooter />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Sepetiniz Boş</h1>
          <Link href="/products"><Button>Alışverişe Başla</Button></Link>
        </main>
        <StoreFooter />
      </div>
    );
  }

  const handleSubmitOrder = () => {
    if (!address.fullName || !address.phone || !address.city || !address.addressLine) {
      toast.error("Lütfen teslimat bilgilerini eksiksiz doldurun");
      setStep(1);
      return;
    }
    createOrderMutation.mutate({
      items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, productName: i.productName, variantName: i.variantName, quantity: i.quantity, unitPrice: i.unitPrice })),
      customerName: address.fullName,
      customerEmail: address.email,
      customerPhone: address.phone,
      city: address.city,
      district: address.district,
      address: `${address.neighborhood ? address.neighborhood + ', ' : ''}${address.addressLine}`,
      zipCode: address.postalCode,
      notes: address.notes,
      paymentMethod: paymentMethod as any,
      shippingMethod: 'standard' as const,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">
        <div className="container py-6 sm:py-8 max-w-4xl">
          {/* Stepper */}
          <div className="flex items-center justify-center mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    step > s.id ? "bg-primary text-primary-foreground" : step === s.id ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    {step > s.id ? <Check className="h-5 w-5" /> : s.id}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-2 ${step > s.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Step 1: Delivery */}
              {step === 1 && (
                <Card>
                  <CardContent className="p-5 space-y-4">
                    <h2 className="text-lg font-bold">Teslimat Bilgileri</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Ad Soyad *</Label><Input value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} /></div>
                      <div className="space-y-2"><Label>E-posta</Label><Input type="email" value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Telefon *</Label><Input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="05XX XXX XX XX" /></div>
                      <div className="space-y-2"><Label>Posta Kodu</Label><Input value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} /></div>
                      <div className="space-y-2"><Label>İl *</Label><Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></div>
                      <div className="space-y-2"><Label>İlçe</Label><Input value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} /></div>
                    </div>
                    <div className="space-y-2"><Label>Mahalle</Label><Input value={address.neighborhood} onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Adres *</Label><Textarea value={address.addressLine} onChange={(e) => setAddress({ ...address, addressLine: e.target.value })} rows={3} /></div>
                    <div className="space-y-2"><Label>Sipariş Notu</Label><Textarea value={address.notes} onChange={(e) => setAddress({ ...address, notes: e.target.value })} rows={2} placeholder="Varsa özel notunuz..." /></div>
                    <div className="flex justify-end">
                      <Button onClick={() => {
                        if (!address.fullName || !address.phone || !address.city || !address.addressLine) {
                          toast.error("Lütfen zorunlu alanları doldurun");
                          return;
                        }
                        setStep(2);
                      }}>Devam Et <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <Card>
                  <CardContent className="p-5 space-y-4">
                    <h2 className="text-lg font-bold">Ödeme Yöntemi</h2>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                      <div className={`flex items-center gap-3 p-4 rounded-lg border min-h-[56px] ${paymentMethod === "credit_card" ? "border-primary bg-primary/5" : ""}`}>
                        <RadioGroupItem value="credit_card" id="cc" />
                        <Label htmlFor="cc" className="flex items-center gap-2 cursor-pointer flex-1">
                          <CreditCard className="h-5 w-5" /> Kredi Kartı
                        </Label>
                      </div>
                      <div className={`flex items-center gap-3 p-4 rounded-lg border min-h-[56px] ${paymentMethod === "bank_transfer" ? "border-primary bg-primary/5" : ""}`}>
                        <RadioGroupItem value="bank_transfer" id="bt" />
                        <Label htmlFor="bt" className="flex items-center gap-2 cursor-pointer flex-1">
                          Havale / EFT
                        </Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === "bank_transfer" && ibansQ.data && ibansQ.data.length > 0 && (
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <p className="text-sm font-medium">Havale yapabileceğiniz hesaplar:</p>
                        {ibansQ.data.map((iban: any) => (
                          <div key={iban.id} className="text-sm">
                            <p className="font-medium">{iban.bankName}</p>
                            <p className="font-mono text-xs">{iban.iban}</p>
                            <p className="text-xs text-muted-foreground">{iban.accountHolder}</p>
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground">Sipariş numaranızı açıklama kısmına yazınız.</p>
                      </div>
                    )}

                    {paymentMethod === "credit_card" && (
                      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                        Kredi kartı ile ödeme, sipariş onayından sonra güvenli ödeme sayfasına yönlendirileceksiniz.
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Geri</Button>
                      <Button onClick={() => setStep(3)}>Devam Et <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Summary */}
              {step === 3 && (
                <Card>
                  <CardContent className="p-5 space-y-4">
                    <h2 className="text-lg font-bold">Sipariş Özeti</h2>
                    <div className="space-y-3">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm font-medium mb-1">Teslimat Adresi</p>
                        <p className="text-sm">{address.fullName}</p>
                        <p className="text-sm text-muted-foreground">{address.addressLine}, {address.district} / {address.city}</p>
                        <p className="text-sm text-muted-foreground">{address.phone}</p>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-2">Ürünler</p>
                        {items.map((item) => (
                          <div key={item.variantId} className="flex justify-between py-2 text-sm">
                            <div>
                              <p>{item.productName}</p>
                              <p className="text-xs text-muted-foreground">{item.variantName} x{item.quantity}</p>
                            </div>
                            <p className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" /> Geri</Button>
                      <Button size="lg" onClick={handleSubmitOrder} disabled={createOrderMutation.isPending} className="font-semibold min-h-[48px]">
                        {createOrderMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> İşleniyor...</> : "Siparişi Onayla"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Summary */}
            <div>
              <Card className="sticky top-20">
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-bold">Sepet ({items.length} ürün)</h3>
                  <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.variantId} className="flex justify-between">
                        <span className="text-muted-foreground truncate mr-2">{item.productName} x{item.quantity}</span>
                        <span className="shrink-0">{formatPrice(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Ara Toplam</span><span>{formatPrice(subtotal)}</span></div>
                    <div className="flex justify-between"><span>Kargo</span><span>{shippingCost === 0 ? <span className="text-green-600">Ücretsiz</span> : formatPrice(shippingCost)}</span></div>
                    {codFee > 0 && <div className="flex justify-between"><span>Kapıda Ödeme</span><span>{formatPrice(codFee)}</span></div>}
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Toplam</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky bar on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-3 z-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-primary text-lg">{formatPrice(total)}</p>
            <p className="text-xs text-muted-foreground">{items.length} ürün</p>
          </div>
          {step === 3 ? (
            <Button size="lg" onClick={handleSubmitOrder} disabled={createOrderMutation.isPending} className="font-semibold">
              {createOrderMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Siparişi Onayla"}
            </Button>
          ) : (
            <Button size="lg" onClick={() => setStep(step + 1)} className="font-semibold">
              Devam Et <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <StoreFooter />
    </div>
  );
}
