import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@shared/utils";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import ProductCard from "@/components/ProductCard";
import { useRoute, Link } from "wouter";
import { ShoppingCart, Minus, Plus, Package, Truck, Shield, ArrowLeft } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:slug");
  const slug = params?.slug || "";
  const { data, isLoading } = trpc.products.bySlug.useQuery({ slug }, { enabled: !!slug });
  const relatedQ = trpc.products.list.useQuery(
    { categoryId: data?.categoryId, limit: 4 },
    { enabled: !!data?.categoryId }
  );

  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const product = data;
  const variants = data?.variants || [];

  const selectedVariant = useMemo(() => {
    if (selectedVariantId) return variants.find((v: any) => v.id === selectedVariantId);
    return variants.length > 0 ? variants[0] : null;
  }, [selectedVariantId, variants]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    if (selectedVariant.stock <= 0) { toast.error("Bu varyant stokta yok"); return; }
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      variantName: selectedVariant.name,
      productSlug: product.slug,
      imageUrl: product.imageUrl,
      unitPrice: selectedVariant.price,
      stock: selectedVariant.stock,
      quantity,
    });
    toast.success("Sepete eklendi!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Ürün Bulunamadı</h1>
          <Link href="/products"><Button>Ürünlere Dön</Button></Link>
        </main>
        <StoreFooter />
      </div>
    );
  }

  const hasDiscount = selectedVariant?.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price;
  const discountPercent = hasDiscount ? Math.round((1 - selectedVariant!.price / selectedVariant!.compareAtPrice!) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">
        <div className="container py-4 sm:py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/"><span className="hover:text-foreground">Ana Sayfa</span></Link>
            <span>/</span>
            <Link href="/products"><span className="hover:text-foreground">Ürünler</span></Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            {/* Image */}
            <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-20 w-20 text-muted-foreground/30" />
                </div>
              )}
              {hasDiscount && (
                <Badge variant="destructive" className="absolute top-4 left-4 text-sm">%{discountPercent} İndirim</Badge>
              )}
            </div>

            {/* Info */}
            <div className="space-y-5">
              <div>
                {(product as any).brandName && <p className="text-sm text-muted-foreground font-medium mb-1">{(product as any).brandName}</p>}
                <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
              </div>

              {/* Price */}
              <div className="flex items-end gap-3">
                <span className="text-3xl font-black text-primary">{formatPrice(selectedVariant?.price ?? product.basePrice)}</span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(selectedVariant!.compareAtPrice!)}</span>
                )}
              </div>

              {/* Variants */}
              {variants.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Seçenekler</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => { setSelectedVariantId(v.id); setQuantity(1); }}
                        disabled={v.stock <= 0}
                        className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all min-h-[44px] ${
                          (selectedVariant?.id === v.id)
                            ? "border-primary bg-primary/10 text-primary"
                            : v.stock <= 0
                              ? "border-muted bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                              : "border-border hover:border-primary/50"
                        }`}
                      >
                        {v.name}
                        {v.stock <= 0 && " (Tükendi)"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              {selectedVariant && selectedVariant.stock > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Adet</p>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                    <Button variant="outline" size="sm" className="h-10 w-10" onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))} disabled={quantity >= selectedVariant.stock}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Stok: {selectedVariant.stock}</span>
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <Button size="lg" className="w-full font-semibold text-base min-h-[52px]" onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant.stock <= 0}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {selectedVariant && selectedVariant.stock <= 0 ? "Stokta Yok" : "Sepete Ekle"}
              </Button>

              {/* Trust */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4 text-primary" /> Hızlı Kargo
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" /> Orijinal Ürün
                </div>
              </div>

              <Separator />

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="font-semibold mb-2">Ürün Açıklaması</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedQ.data?.products && relatedQ.data.products.filter((p: any) => p.id !== product.id).length > 0 && (
            <section className="mt-12 sm:mt-16">
              <h2 className="text-xl font-bold mb-6">Benzer Ürünler</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedQ.data.products.filter((p: any) => p.id !== product.id).slice(0, 4).map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Sticky Add to Cart Bar (Mobile) */}
      {selectedVariant && selectedVariant.stock > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-3 z-50 safe-area-bottom">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-primary text-lg">{formatPrice(selectedVariant.price * quantity)}</p>
              <p className="text-xs text-muted-foreground">{quantity} adet</p>
            </div>
            <Button size="lg" className="font-semibold min-h-[48px]" onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5 mr-2" /> Sepete Ekle
            </Button>
          </div>
        </div>
      )}

      <StoreFooter />
    </div>
  );
}
