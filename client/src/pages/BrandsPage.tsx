import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { Link } from "wouter";
import { Award } from "lucide-react";

export default function BrandsPage() {
  const { data, isLoading } = trpc.brands.list.useQuery();

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">
        <div className="container py-6 sm:py-8">
          <h1 className="text-2xl font-bold mb-6">Markalar</h1>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : data && data.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.map((brand: any) => (
                <Link key={brand.id} href={`/brand/${brand.slug}`}>
                  <Card className="group hover:shadow-md hover:border-primary/30 transition-all h-full">
                    <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[120px]">
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} className="h-12 object-contain mb-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <Award className="h-10 w-10 text-muted-foreground mb-2" />
                      )}
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">{brand.name}</p>
                      {brand.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{brand.description}</p>}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-16">Henüz marka eklenmemiş.</p>
          )}
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
