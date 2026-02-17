import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Save, Plus, Trash2, Building2, Palette, FileText, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type SettingMap = Record<string, string>;

function useSettingsMap() {
  const { data, isLoading } = trpc.admin.settings.list.useQuery();
  const map: SettingMap = {};
  data?.forEach((s: any) => { map[s.settingKey] = s.settingValue || ""; });
  return { map, isLoading };
}

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Site Ayarları</h1>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="gap-2"><Building2 className="h-4 w-4" /> Genel</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2"><Palette className="h-4 w-4" /> Görünüm</TabsTrigger>
          <TabsTrigger value="legal" className="gap-2"><FileText className="h-4 w-4" /> Yasal Sayfalar</TabsTrigger>
          <TabsTrigger value="ibans" className="gap-2"><CreditCard className="h-4 w-4" /> IBAN</TabsTrigger>
        </TabsList>
        <TabsContent value="general"><GeneralSettings /></TabsContent>
        <TabsContent value="appearance"><AppearanceSettings /></TabsContent>
        <TabsContent value="legal"><LegalSettings /></TabsContent>
        <TabsContent value="ibans"><IbanSettings /></TabsContent>
      </Tabs>
    </div>
  );
}

function GeneralSettings() {
  const { map, isLoading } = useSettingsMap();
  const upsertMutation = trpc.admin.settings.upsert.useMutation({ onSuccess: () => toast.success("Kaydedildi") });
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    site_name: "", site_description: "", site_logo: "", site_favicon: "",
    contact_email: "", contact_phone: "", contact_address: "",
    social_instagram: "", social_twitter: "", social_facebook: "", social_youtube: "",
    footer_text: "", whatsapp_number: "",
  });

  useEffect(() => {
    if (!isLoading) {
      setForm({
        site_name: map.site_name || "ProteinMarket",
        site_description: map.site_description || "",
        site_logo: map.site_logo || "",
        site_favicon: map.site_favicon || "",
        contact_email: map.contact_email || "",
        contact_phone: map.contact_phone || "",
        contact_address: map.contact_address || "",
        social_instagram: map.social_instagram || "",
        social_twitter: map.social_twitter || "",
        social_facebook: map.social_facebook || "",
        social_youtube: map.social_youtube || "",
        footer_text: map.footer_text || "",
        whatsapp_number: map.whatsapp_number || "",
      });
    }
  }, [isLoading, map.site_name]);

  const save = async () => {
    for (const [key, value] of Object.entries(form)) {
      await upsertMutation.mutateAsync({ key, value, type: key.includes("logo") || key.includes("favicon") ? "image" : "text" });
    }
    utils.admin.settings.list.invalidate();
    utils.settings.list.invalidate();
  };

  if (isLoading) return <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>;

  return (
    <Card>
      <CardHeader><CardTitle>Genel Bilgiler</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Site Adı</Label><Input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Site Açıklaması</Label><Input value={form.site_description} onChange={(e) => setForm({ ...form, site_description: e.target.value })} /></div>
          <div className="space-y-2"><Label>Logo URL</Label><Input value={form.site_logo} onChange={(e) => setForm({ ...form, site_logo: e.target.value })} placeholder="https://..." /></div>
          <div className="space-y-2"><Label>Favicon URL</Label><Input value={form.site_favicon} onChange={(e) => setForm({ ...form, site_favicon: e.target.value })} placeholder="https://..." /></div>
        </div>
        <div className="border-t pt-4">
          <p className="font-medium text-sm mb-3">İletişim Bilgileri</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>E-posta</Label><Input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Telefon</Label><Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>WhatsApp</Label><Input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="+905..." /></div>
          </div>
          <div className="space-y-2 mt-4"><Label>Adres</Label><Textarea value={form.contact_address} onChange={(e) => setForm({ ...form, contact_address: e.target.value })} rows={2} /></div>
        </div>
        <div className="border-t pt-4">
          <p className="font-medium text-sm mb-3">Sosyal Medya</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Instagram</Label><Input value={form.social_instagram} onChange={(e) => setForm({ ...form, social_instagram: e.target.value })} /></div>
            <div className="space-y-2"><Label>Twitter</Label><Input value={form.social_twitter} onChange={(e) => setForm({ ...form, social_twitter: e.target.value })} /></div>
            <div className="space-y-2"><Label>Facebook</Label><Input value={form.social_facebook} onChange={(e) => setForm({ ...form, social_facebook: e.target.value })} /></div>
            <div className="space-y-2"><Label>YouTube</Label><Input value={form.social_youtube} onChange={(e) => setForm({ ...form, social_youtube: e.target.value })} /></div>
          </div>
        </div>
        <div className="border-t pt-4">
          <div className="space-y-2"><Label>Footer Metni</Label><Input value={form.footer_text} onChange={(e) => setForm({ ...form, footer_text: e.target.value })} placeholder="© 2025 ProteinMarket" /></div>
        </div>
        <Button onClick={save} disabled={upsertMutation.isPending} className="w-full sm:w-auto"><Save className="h-4 w-4 mr-2" /> Kaydet</Button>
      </CardContent>
    </Card>
  );
}

function AppearanceSettings() {
  const { map, isLoading } = useSettingsMap();
  const upsertMutation = trpc.admin.settings.upsert.useMutation({ onSuccess: () => toast.success("Kaydedildi") });
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    primary_color: "#2d8a4e", accent_color: "#d4a843",
    hero_title: "", hero_subtitle: "", hero_image: "",
    free_shipping_threshold: "500",
  });

  useEffect(() => {
    if (!isLoading) {
      setForm({
        primary_color: map.primary_color || "#2d8a4e",
        accent_color: map.accent_color || "#d4a843",
        hero_title: map.hero_title || "",
        hero_subtitle: map.hero_subtitle || "",
        hero_image: map.hero_image || "",
        free_shipping_threshold: map.free_shipping_threshold || "500",
      });
    }
  }, [isLoading, map.primary_color]);

  const save = async () => {
    for (const [key, value] of Object.entries(form)) {
      await upsertMutation.mutateAsync({ key, value, type: key.includes("color") ? "color" : key.includes("image") ? "image" : "text" });
    }
    utils.admin.settings.list.invalidate();
    utils.settings.list.invalidate();
  };

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  return (
    <Card>
      <CardHeader><CardTitle>Görünüm Ayarları</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Ana Renk</Label><div className="flex gap-2"><Input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-16 h-10 p-1" /><Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} /></div></div>
          <div className="space-y-2"><Label>Vurgu Rengi</Label><div className="flex gap-2"><Input type="color" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} className="w-16 h-10 p-1" /><Input value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} /></div></div>
        </div>
        <div className="border-t pt-4">
          <p className="font-medium text-sm mb-3">Hero Bölümü</p>
          <div className="grid gap-4">
            <div className="space-y-2"><Label>Başlık</Label><Input value={form.hero_title} onChange={(e) => setForm({ ...form, hero_title: e.target.value })} placeholder="Performansını Zirveye Taşı" /></div>
            <div className="space-y-2"><Label>Alt Başlık</Label><Input value={form.hero_subtitle} onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })} /></div>
            <div className="space-y-2"><Label>Hero Görsel URL</Label><Input value={form.hero_image} onChange={(e) => setForm({ ...form, hero_image: e.target.value })} /></div>
          </div>
        </div>
        <div className="border-t pt-4">
          <div className="space-y-2"><Label>Ücretsiz Kargo Limiti (₺)</Label><Input type="number" value={form.free_shipping_threshold} onChange={(e) => setForm({ ...form, free_shipping_threshold: e.target.value })} /></div>
        </div>
        <Button onClick={save} disabled={upsertMutation.isPending}><Save className="h-4 w-4 mr-2" /> Kaydet</Button>
      </CardContent>
    </Card>
  );
}

function LegalSettings() {
  const { data, isLoading } = trpc.admin.legalPages.list.useQuery();
  const upsertMutation = trpc.admin.legalPages.upsert.useMutation({ onSuccess: () => { toast.success("Kaydedildi"); utils.admin.legalPages.list.invalidate(); } });
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState<{ slug: string; title: string; content: string } | null>(null);

  const defaultPages = [
    { slug: "gizlilik-politikasi", title: "Gizlilik Politikası" },
    { slug: "mesafeli-satis-sozlesmesi", title: "Mesafeli Satış Sözleşmesi" },
    { slug: "iptal-iade-kosullari", title: "İptal ve İade Koşulları" },
    { slug: "kullanim-kosullari", title: "Kullanım Koşulları" },
  ];

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  const pages = defaultPages.map((dp) => {
    const existing = data?.find((p: any) => p.slug === dp.slug);
    return { ...dp, content: existing?.content || "", isActive: existing?.isActive ?? true };
  });

  return (
    <Card>
      <CardHeader><CardTitle>Yasal Sayfalar</CardTitle></CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{editing.title}</h3>
              <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Geri</Button>
            </div>
            <Textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={15} placeholder="Sayfa içeriğini buraya yazın..." />
            <Button onClick={() => { upsertMutation.mutate({ slug: editing.slug, title: editing.title, content: editing.content }); setEditing(null); }}>
              <Save className="h-4 w-4 mr-2" /> Kaydet
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page) => (
              <div key={page.slug} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{page.title}</p>
                  <p className="text-xs text-muted-foreground">{page.content ? `${page.content.substring(0, 80)}...` : "İçerik henüz eklenmemiş"}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditing({ slug: page.slug, title: page.title, content: page.content })}>Düzenle</Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IbanSettings() {
  const { data, isLoading } = trpc.admin.ibans.list.useQuery();
  const createMutation = trpc.admin.ibans.create.useMutation({ onSuccess: () => { toast.success("IBAN eklendi"); utils.admin.ibans.list.invalidate(); } });
  const toggleMutation = trpc.admin.ibans.toggle.useMutation({ onSuccess: () => utils.admin.ibans.list.invalidate() });
  const deleteMutation = trpc.admin.ibans.delete.useMutation({ onSuccess: () => { toast.success("IBAN silindi"); utils.admin.ibans.list.invalidate(); } });
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ bankName: "", iban: "", accountHolder: "" });
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>IBAN Yönetimi</CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Ekle</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1"><Label>Banka Adı</Label><Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="Ziraat Bankası" /></div>
              <div className="space-y-1"><Label>IBAN</Label><Input value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} placeholder="TR..." /></div>
              <div className="space-y-1"><Label>Hesap Sahibi</Label><Input value={form.accountHolder} onChange={(e) => setForm({ ...form, accountHolder: e.target.value })} /></div>
            </div>
            <Button size="sm" onClick={() => { createMutation.mutate(form); setForm({ bankName: "", iban: "", accountHolder: "" }); setShowForm(false); }}>Kaydet</Button>
          </div>
        )}
        {data && data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banka</TableHead>
                <TableHead>IBAN</TableHead>
                <TableHead className="hidden sm:table-cell">Hesap Sahibi</TableHead>
                <TableHead>Aktif</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((iban: any) => (
                <TableRow key={iban.id}>
                  <TableCell className="text-sm font-medium">{iban.bankName}</TableCell>
                  <TableCell className="text-sm font-mono">{iban.iban}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{iban.accountHolder}</TableCell>
                  <TableCell><Switch checked={iban.isActive} onCheckedChange={(v) => toggleMutation.mutate({ id: iban.id, isActive: v })} /></TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => { if (confirm("Silmek istediğinize emin misiniz?")) deleteMutation.mutate({ id: iban.id }); }}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">Henüz IBAN eklenmemiş.</p>
        )}
      </CardContent>
    </Card>
  );
}
