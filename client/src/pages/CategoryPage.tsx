import { trpc } from "@/lib/trpc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { useRoute, Link } from "wouter";
import { useState } from "react";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug || "";
  const [sortBy, setSortBy] = useState<string>("newest");

  const categoriesQ = trpc.categories.list.useQuery();
  const category = categoriesQ.data?.find((c: any) => c.slug === slug);

  const productsQ = trpc.products.list.useQuery(
    { categoryId: category?.id, sortBy: sortBy as any, limit: 48 },
    { enabled: !!category?.id }
  );

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">
        <div className="container py-6 sm:py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/"><span className="hover:text-foreground">Ana Sayfa</span></Link>
            <span>/</span>
            <span className="text-foreground">{category?.name || slug}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">{category?.name || "Kategori"}</h1>
              {category?.description && <p className="text-sm text-muted-foreground mt-1">{category.description}</p>}
              {productsQ.data && <p className="text-sm text-muted-foreground mt-1">{productsQ.data.total} ürün</p>}
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">En Yeni</SelectItem>
                <SelectItem value="price_asc">Fiyat: Düşükten Yükseğe</SelectItem>
                <SelectItem value="price_desc">Fiyat: Yüksekten Düşüğe</SelectItem>
                <SelectItem value="popular">En Popüler</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {productsQ.isLoading || categoriesQ.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : productsQ.data?.products && productsQ.data.products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {productsQ.data.products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">Bu kategoride henüz ürün yok.</p>
            </div>
          )}
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
