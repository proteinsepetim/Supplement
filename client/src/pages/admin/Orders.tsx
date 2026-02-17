import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, getOrderStatusLabel, getOrderStatusColor, getPaymentMethodLabel } from "@shared/utils";
import { Search, Eye, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ORDER_STATUSES = ["pending", "paid", "confirmed", "preparing", "shipped", "delivered", "cancelled", "refunded"];

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({ orderId: 0, status: "", trackingNumber: "", trackingUrl: "" });
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.orders.list.useQuery({
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const detailQ = trpc.admin.orders.getDetail.useQuery(
    { orderId: selectedOrderId! },
    { enabled: !!selectedOrderId }
  );

  const updateStatusMutation = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.admin.orders.list.invalidate();
      setUpdateOpen(false);
      toast.success("Sipariş durumu güncellendi");
    },
    onError: (e) => toast.error(e.message),
  });

  const openDetail = (orderId: number) => {
    setSelectedOrderId(orderId);
    setDetailOpen(true);
  };

  const openUpdate = (order: any) => {
    setUpdateForm({ orderId: order.id, status: order.status, trackingNumber: order.trackingNumber || "", trackingUrl: order.trackingUrl || "" });
    setUpdateOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sipariş Yönetimi</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Sipariş no veya müşteri ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tüm Durumlar" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{getOrderStatusLabel(s)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sipariş No</TableHead>
                  <TableHead className="hidden md:table-cell">Müşteri</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="hidden sm:table-cell">Ödeme</TableHead>
                  <TableHead className="hidden md:table-cell">Tutar</TableHead>
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.orders && data.orders.length > 0 ? data.orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div>
                        <p className="text-sm">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{getPaymentMethodLabel(order.paymentMethod)}</TableCell>
                    <TableCell className="hidden md:table-cell font-medium text-sm">{formatPrice(order.total)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openDetail(order.id)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openUpdate(order)}><Truck className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Henüz sipariş yok.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Sipariş Detayı</DialogTitle></DialogHeader>
          {detailQ.data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Sipariş No:</span><p className="font-mono font-medium">{detailQ.data.orderNumber}</p></div>
                <div><span className="text-muted-foreground">Durum:</span><p><Badge variant="secondary" className={getOrderStatusColor(detailQ.data.status)}>{getOrderStatusLabel(detailQ.data.status)}</Badge></p></div>
                <div><span className="text-muted-foreground">Müşteri:</span><p className="font-medium">{detailQ.data.customerName}</p></div>
                <div><span className="text-muted-foreground">Telefon:</span><p>{detailQ.data.customerPhone}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Adres:</span><p>{detailQ.data.address}, {detailQ.data.district} / {detailQ.data.city}</p></div>
              </div>
              <div className="border-t pt-3">
                <p className="font-medium text-sm mb-2">Ürünler</p>
                {detailQ.data.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between py-2 border-b last:border-0 text-sm">
                    <div>
                      <p>{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{item.variantName} x{item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.lineTotal)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>Ara Toplam</span><span>{formatPrice(detailQ.data.subtotal)}</span></div>
                <div className="flex justify-between"><span>Kargo</span><span>{formatPrice(detailQ.data.shippingCost)}</span></div>
                {detailQ.data.codFee > 0 && <div className="flex justify-between"><span>Kapıda Ödeme</span><span>{formatPrice(detailQ.data.codFee)}</span></div>}
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>Toplam</span><span>{formatPrice(detailQ.data.total)}</span></div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sipariş Durumu Güncelle</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Durum</Label>
              <Select value={updateForm.status} onValueChange={(v) => setUpdateForm({ ...updateForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{getOrderStatusLabel(s)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kargo Takip No</Label>
              <Input value={updateForm.trackingNumber} onChange={(e) => setUpdateForm({ ...updateForm, trackingNumber: e.target.value })} placeholder="Takip numarası" />
            </div>
            <div className="space-y-2">
              <Label>Kargo Takip URL</Label>
              <Input value={updateForm.trackingUrl} onChange={(e) => setUpdateForm({ ...updateForm, trackingUrl: e.target.value })} placeholder="https://..." />
            </div>
            <Button onClick={() => updateStatusMutation.mutate(updateForm as any)} disabled={updateStatusMutation.isPending} className="w-full">
              {updateStatusMutation.isPending ? "Güncelleniyor..." : "Durumu Güncelle"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
