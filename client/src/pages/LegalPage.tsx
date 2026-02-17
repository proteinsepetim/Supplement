import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { useRoute, Link } from "wouter";

export default function LegalPage() {
  const [, params] = useRoute("/legal/:slug");
  const slug = params?.slug || "";
  const { data, isLoading } = trpc.legal.bySlug.useQuery({ slug }, { enabled: !!slug });

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">
        <div className="container py-6 sm:py-8 max-w-3xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/"><span className="hover:text-foreground">Ana Sayfa</span></Link>
            <span>/</span>
            <span className="text-foreground">{data?.title || "Yasal"}</span>
          </div>
          {isLoading ? (
            <div className="space-y-3"><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
          ) : data ? (
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h1 className="text-2xl font-bold mb-6">{data.title}</h1>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
                  {data.content || "Bu sayfa henüz düzenlenmemiş."}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">Sayfa bulunamadı.</p>
            </div>
          )}
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
