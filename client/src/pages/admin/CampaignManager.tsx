import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatPrice } from "@shared/utils";
import { Plus, Trash2, Gift, Percent, Truck, ShoppingBag, Tag } from "lucide-react";

const RULE_TYPES = [
  { value: "min_cart_gift", label: "Minimum Sepet Hediye", icon: Gift, description: "Sepet tutarı X TL üzerinde hediye ürün" },
  { value: "buy_x_get_y", label: "X Al Y Bedava", icon: ShoppingBag, description: "Belirli kategoriden X ürün al, 1 bedava" },
  { value: "cart_discount_percent", label: "Yüzde İndirim", icon: Percent, description: "Sepet toplamından yüzde indirim" },
  { value: "cart_discount_amount", label: "Tutar İndirim", icon: Tag, description: "Sepet toplamından sabit tutar indirim" },
  { value: "free_shipping", label: "Ücretsiz Kargo", icon: Truck, description: "Belirli tutar üzeri ücretsiz kargo" },
];

const defaultForm = {
  name: "", description: "", ruleType: "min_cart_gift" as string,
  minCartAmount: "", requiredCategoryId: "", requiredProductCount: "",
  discountPercent: "", discountAmount: "",
  giftProductName: "", giftProductImage: "",
  priority: "0", startsAt: "", endsAt: "",
};

export default function CampaignManager() {
  const utils = trpc.useUtils();
  const { data: campaignList = [], isLoading } = trpc.admin.campaigns.list.useQuery();
  const { data: categories = [] } = trpc.admin.categories.list.useQuery();
  const [form, setForm] = useState(defaultForm);
  const [showDialog, setShowDialog] = useState(false);

  const createCampaign = trpc.admin.campaigns.create.useMutation({
    onSuccess: () => { utils.admin.campaigns.list.invalidate(); toast.success("Kampanya oluşturuldu"); setShowDialog(false); setForm(defaultForm); },
    onError: (err) => toast.error(err.message),
  });
  const updateCampaign = trpc.admin.campaigns.update.useMutation({
    onSuccess: () => { utils.admin.campaigns.list.invalidate(); toast.success("Kampanya güncellendi"); },
    onError: (err) => toast.error(err.message),
  });
  const deleteCampaign = trpc.admin.campaigns.delete.useMutation({
    onSuccess: () => { utils.admin.campaigns.list.invalidate(); toast.success("Kampanya silindi"); },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    createCampaign.mutate({
      name: form.name,
      description: form.description || undefined,
      ruleType: form.ruleType as any,
      minCartAmount: form.minCartAmount ? Number(form.minCartAmount) * 100 : undefined,
      requiredCategoryId: form.requiredCategoryId ? Number(form.requiredCategoryId) : undefined,
      requiredProductCount: form.requiredProductCount ? Number(form.requiredProductCount) : undefined,
      discountPercent: form.discountPercent ? Number(form.discountPercent) : undefined,
      discountAmount: form.discountAmount ? Number(form.discountAmount) * 100 : undefined,
      giftProductName: form.giftProductName || undefined,
      giftProductImage: form.giftProductImage || undefined,
      priority: Number(form.priority),
      startsAt: form.startsAt || undefined,
      endsAt: form.endsAt || undefined,
    });
  };

  const getRuleIcon = (ruleType: string) => {
    const rule = RULE_TYPES.find(r => r.value === ruleType);
    return rule ? rule.icon : Tag;
  };

  const getRuleLabel = (ruleType: string) => {
    return RULE_TYPES.find(r => r.value === ruleType)?.label || ruleType;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Gift className="h-6 w-6" /> Kampanya Yönetimi</h1>
          <p className="text-muted-foreground">Dinamik kampanya kurallarını yönetin</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Kampanya Ekle</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Yeni Kampanya</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Kampanya Adı</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="500 TL üzeri Shaker Hediye" />
              </div>
              <div>
                <Label>Açıklama</Label>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Kampanya detayları..." rows={2} />
              </div>
              <div>
                <Label>Kural Tipi</Label>
                <Select value={form.ruleType} onValueChange={v => setForm(p => ({ ...p, ruleType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RULE_TYPES.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label} - {r.description}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional fields based on rule type */}
              {(form.ruleType === "min_cart_gift" || form.ruleType === "cart_discount_percent" || form.ruleType === "cart_discount_amount" || form.ruleType === "free_shipping") && (
                <div>
                  <Label>Minimum Sepet Tutarı (TL)</Label>
                  <Input type="number" value={form.minCartAmount} onChange={e => setForm(p => ({ ...p, minCartAmount: e.target.value }))} placeholder="500" />
                </div>
              )}

              {form.ruleType === "min_cart_gift" && (
                <>
                  <div>
                    <Label>Hediye Ürün Adı</Label>
                    <Input value={form.giftProductName} onChange={e => setForm(p => ({ ...p, giftProductName: e.target.value }))} placeholder="Shaker" />
                  </div>
                  <div>
                    <Label>Hediye Ürün Görseli (URL)</Label>
                    <Input value={form.giftProductImage} onChange={e => setForm(p => ({ ...p, giftProductImage: e.target.value }))} placeholder="https://..." />
                  </div>
                </>
              )}

              {form.ruleType === "buy_x_get_y" && (
                <>
                  <div>
                    <Label>Kategori</Label>
                    <Select value={form.requiredCategoryId} onValueChange={v => setForm(p => ({ ...p, requiredCategoryId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Kategori seçin" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Gerekli Ürün Sayısı</Label>
                    <Input type="number" value={form.requiredProductCount} onChange={e => setForm(p => ({ ...p, requiredProductCount: e.target.value }))} placeholder="3" />
                  </div>
                </>
              )}

              {form.ruleType === "cart_discount_percent" && (
                <div>
                  <Label>İndirim Yüzdesi (%)</Label>
                  <Input type="number" value={form.discountPercent} onChange={e => setForm(p => ({ ...p, discountPercent: e.target.value }))} placeholder="20" />
                </div>
              )}

              {form.ruleType === "cart_discount_amount" && (
                <div>
                  <Label>İndirim Tutarı (TL)</Label>
                  <Input type="number" value={form.discountAmount} onChange={e => setForm(p => ({ ...p, discountAmount: e.target.value }))} placeholder="100" />
                </div>
              )}

              <div>
                <Label>Öncelik (yüksek = önce uygulanır)</Label>
                <Input type="number" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Başlangıç Tarihi</Label>
                  <Input type="datetime-local" value={form.startsAt} onChange={e => setForm(p => ({ ...p, startsAt: e.target.value }))} />
                </div>
                <div>
                  <Label>Bitiş Tarihi</Label>
                  <Input type="datetime-local" value={form.endsAt} onChange={e => setForm(p => ({ ...p, endsAt: e.target.value }))} />
                </div>
              </div>

              <Button className="w-full" onClick={handleSubmit} disabled={!form.name || createCampaign.isPending}>
                {createCampaign.isPending ? "Oluşturuluyor..." : "Kampanya Oluştur"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Yükleniyor...</div>
      ) : campaignList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Gift className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Henüz kampanya yok</h3>
            <p className="text-muted-foreground">Dönüşüm oranını artırmak için kampanyalar oluşturun</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaignList.map((campaign: any) => {
            const Icon = getRuleIcon(campaign.ruleType);
            return (
              <Card key={campaign.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{campaign.name}</h3>
                        {campaign.description && <p className="text-sm text-muted-foreground mt-0.5">{campaign.description}</p>}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">{getRuleLabel(campaign.ruleType)}</Badge>
                          {campaign.minCartAmount && <Badge variant="secondary">Min: {formatPrice(campaign.minCartAmount)}</Badge>}
                          {campaign.discountPercent && <Badge variant="secondary">%{campaign.discountPercent} İndirim</Badge>}
                          {campaign.discountAmount && <Badge variant="secondary">{formatPrice(campaign.discountAmount)} İndirim</Badge>}
                          {campaign.giftProductName && <Badge variant="secondary">Hediye: {campaign.giftProductName}</Badge>}
                          <Badge variant="outline" className="text-xs">Öncelik: {campaign.priority}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        checked={campaign.isActive}
                        onCheckedChange={(checked) => updateCampaign.mutate({ id: campaign.id, isActive: checked })}
                      />
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                        if (confirm("Bu kampanyayı silmek istediğinize emin misiniz?")) deleteCampaign.mutate({ id: campaign.id });
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
