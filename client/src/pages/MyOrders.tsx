import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, getOrderStatusLabel, getOrderStatusColor } from "@shared/utils";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ShoppingBag } from "lucide-react";

export default function MyOrders() {
  const { isAuthenticated, loading } = useAuth();
  const { data, isLoading } = trpc.order.myOrders.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Giriş Yapmanız Gerekiyor</h1>
          <Button onClick={() => window.location.href = getLoginUrl()}>Giriş Yap</Button>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">
        <div className="container py-6 sm:py-8">
          <h1 className="text-2xl font-bold mb-6">Siparişlerim</h1>
          {isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
          ) : data && data.length > 0 ? (
            <div className="space-y-3">
              {data.map((order: any) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-medium text-sm">{order.orderNumber}</span>
                          <Badge variant="secondary" className={`text-xs ${getOrderStatusColor(order.status)}`}>
                            {getOrderStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("tr-TR")} - {order.city}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-sm mt-1">
                            Kargo Takip: <span className="font-mono">{order.trackingNumber}</span>
                            {order.trackingUrl && (
                              <a href={order.trackingUrl} target="_blank" rel="noopener" className="text-primary ml-2 hover:underline">Takip Et</a>
                            )}
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-primary text-lg">{formatPrice(order.totalAmount)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-lg text-muted-foreground mb-4">Henüz siparişiniz yok.</p>
              <Link href="/products"><Button>Alışverişe Başla</Button></Link>
            </div>
          )}
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
