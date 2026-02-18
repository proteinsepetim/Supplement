import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@shared/utils";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { Link } from "wouter";
import { Minus, Plus, Trash2, ShoppingBag, Package } from "lucide-react";
import CampaignBanner from "@/components/CampaignBanner";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart();
  const shippingCost = subtotal >= 50000 ? 0 : 2999; // 500TL üzeri ücretsiz
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">
        <div className="container py-6 sm:py-8">
          <h1 className="text-2xl font-bold mb-6">Sepetim ({itemCount} ürün)</h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-lg text-muted-foreground mb-4">Sepetiniz boş</p>
              <Link href="/products"><Button>Alışverişe Başla</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3">
                {items.map((item) => (
                  <Card key={item.variantId}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Link href={`/product/${item.productSlug}`}>
                          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg bg-muted overflow-hidden shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-muted-foreground/30" /></div>
                            )}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link href={`/product/${item.productSlug}`}>
                                <h3 className="font-medium text-sm sm:text-base hover:text-primary transition-colors">{item.productName}</h3>
                              </Link>
                              <p className="text-xs sm:text-sm text-muted-foreground">{item.variantName}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeItem(item.variantId)} className="shrink-0 text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} disabled={item.quantity >= item.stock}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="font-bold text-primary">{formatPrice(item.unitPrice * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Campaign Banners */}
              <div className="lg:col-span-2">
                <CampaignBanner />
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-20">
                  <CardContent className="p-5 space-y-4">
                    <h3 className="font-bold text-lg">Sipariş Özeti</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Ara Toplam</span><span>{formatPrice(subtotal)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Kargo</span><span>{shippingCost === 0 ? <span className="text-green-600 font-medium">Ücretsiz</span> : formatPrice(shippingCost)}</span></div>
                      {shippingCost > 0 && subtotal < 50000 && (
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(50000 - subtotal)} daha ekleyin, kargo ücretsiz!
                        </p>
                      )}
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-lg">
                      <span>Toplam</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                    <Link href="/checkout">
                      <Button size="lg" className="w-full font-semibold min-h-[48px]">Siparişi Tamamla</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
