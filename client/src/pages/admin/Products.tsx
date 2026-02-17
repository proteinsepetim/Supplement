import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, slugify } from "@shared/utils";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.products.list.useQuery({ search: search || undefined });
  const categoriesQ = trpc.admin.categories.list.useQuery();
  const brandsQ = trpc.admin.brands.list.useQuery();

  const createMutation = trpc.admin.products.create.useMutation({
    onSuccess: () => { utils.admin.products.list.invalidate(); setDialogOpen(false); toast.success("Ürün oluşturuldu"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.admin.products.update.useMutation({
    onSuccess: () => { utils.admin.products.list.invalidate(); setDialogOpen(false); setEditingProduct(null); toast.success("Ürün güncellendi"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.products.delete.useMutation({
    onSuccess: () => { utils.admin.products.list.invalidate(); toast.success("Ürün silindi"); },
  });

  const [form, setForm] = useState({
    name: "", slug: "", description: "", shortDescription: "",
    brandId: 0, categoryId: 0, basePrice: 0, imageUrl: "",
    isFeatured: false, metaTitle: "", metaDescription: "", keywords: "",
  });

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ name: "", slug: "", description: "", shortDescription: "", brandId: 0, categoryId: 0, basePrice: 0, imageUrl: "", isFeatured: false, metaTitle: "", metaDescription: "", keywords: "" });
    setDialogOpen(true);
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product.name, slug: product.slug, description: product.description || "",
      shortDescription: product.shortDescription || "", brandId: product.brandId,
      categoryId: product.categoryId, basePrice: product.basePrice,
      imageUrl: product.imageUrl || "", isFeatured: product.isFeatured,
      metaTitle: product.metaTitle || "", metaDescription: product.metaDescription || "",
      keywords: product.keywords || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.brandId || !form.categoryId) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }
    const slug = form.slug || slugify(form.name);
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...form, slug });
    } else {
      createMutation.mutate({ ...form, slug });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Ürün Yönetimi</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Yeni Ürün</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Ürün ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün</TableHead>
                  <TableHead className="hidden md:table-cell">Kategori</TableHead>
                  <TableHead className="hidden md:table-cell">Fiyat</TableHead>
                  <TableHead className="hidden sm:table-cell">Durum</TableHead>
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.products && data.products.length > 0 ? data.products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground" /></div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          {product.isFeatured && <Badge variant="secondary" className="text-xs mt-1">Öne Çıkan</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {categoriesQ.data?.find((c: any) => c.id === product.categoryId)?.name || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm font-medium">{formatPrice(product.basePrice)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={product.isActive ? "default" : "secondary"}>{product.isActive ? "Aktif" : "Pasif"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(product)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) deleteMutation.mutate({ id: product.id }); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Henüz ürün eklenmemiş.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ürün Adı *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} placeholder="Whey Protein" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="whey-protein" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select value={form.categoryId ? String(form.categoryId) : ""} onValueChange={(v) => setForm({ ...form, categoryId: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="Kategori seçin" /></SelectTrigger>
                  <SelectContent>
                    {categoriesQ.data?.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Marka *</Label>
                <Select value={form.brandId ? String(form.brandId) : ""} onValueChange={(v) => setForm({ ...form, brandId: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="Marka seçin" /></SelectTrigger>
                  <SelectContent>
                    {brandsQ.data?.map((b: any) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Temel Fiyat (kuruş) *</Label>
                <Input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} placeholder="29900" />
                <p className="text-xs text-muted-foreground">{formatPrice(form.basePrice)}</p>
              </div>
              <div className="space-y-2">
                <Label>Görsel URL</Label>
                <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kısa Açıklama</Label>
              <Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="Kısa ürün açıklaması" />
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Detaylı ürün açıklaması..." />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
              <Label>Öne Çıkan Ürün</Label>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">SEO Ayarları</p>
              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label>Meta Başlık</Label>
                  <Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Meta Açıklama</Label>
                  <Textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Anahtar Kelimeler</Label>
                  <Input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="protein, whey, supplement" />
                </div>
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="w-full">
              {(createMutation.isPending || updateMutation.isPending) ? "Kaydediliyor..." : editingProduct ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
