import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { Link } from "wouter";
import { ArrowRight, Truck, Shield, Headphones, Award, ChevronRight } from "lucide-react";

export default function Home() {
  const categoriesQ = trpc.categories.list.useQuery();
  const featuredQ = trpc.products.list.useQuery({ featured: true, limit: 8 });
  const newestQ = trpc.products.list.useQuery({ limit: 8, sortBy: "newest" });
  const brandsQ = trpc.brands.list.useQuery();

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary via-secondary to-primary/20 overflow-hidden">
        <div className="container py-12 sm:py-20 lg:py-28">
          <div className="max-w-2xl relative z-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-secondary-foreground leading-tight mb-4">
              Performansını<br />
              <span className="text-primary">Zirveye Taşı</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 max-w-lg">
              Türkiye'nin en geniş sporcu gıdaları mağazası. Orijinal ürünler, hızlı teslimat, uygun fiyatlar.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products">
                <Button size="lg" className="font-semibold">
                  Ürünleri Keşfet <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/brands">
                <Button size="lg" variant="outline" className="font-semibold bg-white/10 text-white border-white/30 hover:bg-white/20">
                  Markalar
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent hidden lg:block" />
      </section>

      {/* Trust Badges */}
      <section className="border-b bg-background">
        <div className="container py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: "Ücretsiz Kargo", desc: "500₺ üzeri siparişlerde" },
              { icon: Shield, title: "Güvenli Ödeme", desc: "256-bit SSL şifreleme" },
              { icon: Award, title: "Orijinal Ürün", desc: "%100 orijinal garantisi" },
              { icon: Headphones, title: "7/24 Destek", desc: "Her zaman yanınızdayız" },
            ].map((badge) => (
              <div key={badge.title} className="flex items-center gap-3 p-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <badge.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{badge.title}</p>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 sm:py-14">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Kategoriler</h2>
            <Link href="/products">
              <Button variant="ghost" size="sm">Tümü <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          </div>
          {categoriesQ.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categoriesQ.data?.filter((c: any) => !c.parentId).slice(0, 6).map((cat: any) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}>
                  <Card className="group hover:shadow-md hover:border-primary/30 transition-all h-full">
                    <CardContent className="p-4 text-center">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} className="h-12 w-12 mx-auto mb-2 object-contain" />
                      ) : (
                        <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-lg">{cat.name.charAt(0)}</span>
                        </div>
                      )}
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">{cat.name}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-10 sm:py-14 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Öne Çıkan Ürünler</h2>
            <Link href="/products?featured=true">
              <Button variant="ghost" size="sm">Tümü <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          </div>
          {featuredQ.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredQ.data?.products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {(!featuredQ.data?.products || featuredQ.data.products.length === 0) && (
                <p className="col-span-full text-center text-muted-foreground py-8">Henüz öne çıkan ürün eklenmemiş.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Newest Products */}
      <section className="py-10 sm:py-14">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Yeni Ürünler</h2>
            <Link href="/products?sort=newest">
              <Button variant="ghost" size="sm">Tümü <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          </div>
          {newestQ.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {newestQ.data?.products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {(!newestQ.data?.products || newestQ.data.products.length === 0) && (
                <p className="col-span-full text-center text-muted-foreground py-8">Henüz ürün eklenmemiş.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Brands */}
      {brandsQ.data && brandsQ.data.length > 0 && (
        <section className="py-10 sm:py-14 bg-muted/30">
          <div className="container">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">Markalarımız</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {brandsQ.data.map((brand: any) => (
                <Link key={brand.id} href={`/brand/${brand.slug}`}>
                  <Card className="group hover:shadow-md transition-all">
                    <CardContent className="p-4 text-center">
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} className="h-10 mx-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <p className="font-bold text-sm text-muted-foreground group-hover:text-foreground transition-colors">{brand.name}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <StoreFooter />
    </div>
  );
}
