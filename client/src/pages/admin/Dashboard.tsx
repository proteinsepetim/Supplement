import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, getOrderStatusLabel, getOrderStatusColor } from "@shared/utils";
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, DollarSign, BarChart3, Eye, ShoppingBag, CreditCard, CheckCircle } from "lucide-react";

function SalesFunnel({ data }: { data: { pageViews: number; addToCart: number; checkoutStart: number; orderComplete: number } }) {
  const steps = [
    { label: "Sayfa Görüntüleme", value: data.pageViews, icon: Eye, color: "bg-blue-500" },
    { label: "Sepete Ekleme", value: data.addToCart, icon: ShoppingBag, color: "bg-yellow-500" },
    { label: "Checkout Başlatma", value: data.checkoutStart, icon: CreditCard, color: "bg-orange-500" },
    { label: "Sipariş Tamamlama", value: data.orderComplete, icon: CheckCircle, color: "bg-green-500" },
  ];

  const maxValue = Math.max(data.pageViews, 1);

  return (
    <div className="space-y-4">
      {steps.map((step, idx) => {
        const percentage = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
        const conversionFromPrev = idx > 0 && steps[idx - 1].value > 0
          ? ((step.value / steps[idx - 1].value) * 100).toFixed(1)
          : null;

        return (
          <div key={step.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <step.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{step.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{step.value}</span>
                {conversionFromPrev && (
                  <Badge variant="outline" className="text-xs">%{conversionFromPrev}</Badge>
                )}
              </div>
            </div>
            <div className="h-6 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${step.color} rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                style={{ width: `${Math.max(percentage, 2)}%` }}
              >
                {percentage > 15 && <span className="text-white text-xs font-medium">%{percentage.toFixed(0)}</span>}
              </div>
            </div>
          </div>
        );
      })}

      {data.pageViews > 0 && data.orderComplete > 0 && (
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Genel Dönüşüm Oranı</span>
            <span className="text-lg font-bold text-primary">
              %{((data.orderComplete / data.pageViews) * 100).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = trpc.admin.dashboard.useQuery();
  const { data: funnelData, isLoading: funnelLoading } = trpc.admin.analytics.funnel.useQuery({ days: 30 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Toplam Sipariş", value: data?.orders ?? 0, icon: ShoppingCart, color: "text-blue-600" },
    { label: "Toplam Gelir", value: formatPrice(data?.revenue ?? 0), icon: DollarSign, color: "text-green-600" },
    { label: "Müşteriler", value: data?.customers ?? 0, icon: Users, color: "text-purple-600" },
    { label: "Aktif Ürünler", value: data?.products ?? 0, icon: Package, color: "text-orange-600" },
  ];

  const todayStats = [
    { label: "Bugünkü Sipariş", value: data?.todayOrders ?? 0 },
    { label: "Bugünkü Gelir", value: formatPrice(data?.todayRevenue ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {todayStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-semibold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Satış Hunisi (Son 30 Gün)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {funnelLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : funnelData ? (
            <SalesFunnel data={funnelData} />
          ) : (
            <p className="text-muted-foreground text-sm">Henüz analitik verisi yok.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Son Siparişler</CardTitle></CardHeader>
          <CardContent>
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {data.recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.customerName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-xs ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                      <span className="text-sm font-medium">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Henüz sipariş yok.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" /> Düşük Stok Uyarıları</CardTitle></CardHeader>
          <CardContent>
            {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {data.lowStockProducts.slice(0, 8).map((v: any) => (
                  <div key={v.variantId} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{v.variantName}</p>
                      <p className="text-xs text-muted-foreground">SKU: {v.sku}</p>
                    </div>
                    <Badge variant={v.stock === 0 ? "destructive" : "secondary"} className="text-xs">
                      {v.stock} adet
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Düşük stoklu ürün yok.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
