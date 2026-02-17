import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { useLocation, useSearch } from "wouter";
import { useState, useMemo } from "react";

export default function ProductList() {
  const searchParams = useSearch();
  const params = useMemo(() => new URLSearchParams(searchParams), [searchParams]);
  const searchQuery = params.get("q") || "";
  const featuredOnly = params.get("featured") === "true";
  const [sortBy, setSortBy] = useState<string>(params.get("sort") || "newest");

  const { data, isLoading } = trpc.products.list.useQuery({
    search: searchQuery || undefined,
    featured: featuredOnly || undefined,
    sortBy: sortBy as any,
    limit: 48,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">
        <div className="container py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {searchQuery ? `"${searchQuery}" için sonuçlar` : featuredOnly ? "Öne Çıkan Ürünler" : "Tüm Ürünler"}
              </h1>
              {data && <p className="text-sm text-muted-foreground mt-1">{data.total} ürün bulundu</p>}
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sıralama" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">En Yeni</SelectItem>
                <SelectItem value="price_asc">Fiyat: Düşükten Yükseğe</SelectItem>
                <SelectItem value="price_desc">Fiyat: Yüksekten Düşüğe</SelectItem>
                <SelectItem value="popular">En Popüler</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : data?.products && data.products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">Ürün bulunamadı.</p>
              <p className="text-sm text-muted-foreground mt-2">Farklı bir arama terimi deneyin veya filtreleri değiştirin.</p>
            </div>
          )}
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
