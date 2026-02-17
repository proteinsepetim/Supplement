import { trpc } from "@/lib/trpc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { useRoute, Link } from "wouter";
import { useState } from "react";

export default function BrandDetail() {
  const [, params] = useRoute("/brand/:slug");
  const slug = params?.slug || "";
  const [sortBy, setSortBy] = useState<string>("newest");

  const brandsQ = trpc.brands.list.useQuery();
  const brand = brandsQ.data?.find((b: any) => b.slug === slug);

  const productsQ = trpc.products.list.useQuery(
    { brandId: brand?.id, sortBy: sortBy as any, limit: 48 },
    { enabled: !!brand?.id }
  );

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">
        <div className="container py-6 sm:py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/"><span className="hover:text-foreground">Ana Sayfa</span></Link>
            <span>/</span>
            <Link href="/brands"><span className="hover:text-foreground">Markalar</span></Link>
            <span>/</span>
            <span className="text-foreground">{brand?.name || slug}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {brand?.logoUrl && <img src={brand.logoUrl} alt={brand.name} className="h-12 object-contain" />}
              <div>
                <h1 className="text-2xl font-bold">{brand?.name || "Marka"}</h1>
                {brand?.description && <p className="text-sm text-muted-foreground mt-1">{brand.description}</p>}
              </div>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">En Yeni</SelectItem>
                <SelectItem value="price_asc">Fiyat: Düşükten Yükseğe</SelectItem>
                <SelectItem value="price_desc">Fiyat: Yüksekten Düşüğe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {productsQ.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : productsQ.data?.products && productsQ.data.products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {productsQ.data.products.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-16">Bu markada henüz ürün yok.</p>
          )}
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
