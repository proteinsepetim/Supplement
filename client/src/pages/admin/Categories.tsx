import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { slugify } from "@shared/utils";
import { Plus, Edit, FolderTree } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminCategories() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.categories.list.useQuery();

  const createMutation = trpc.admin.categories.create.useMutation({
    onSuccess: () => { utils.admin.categories.list.invalidate(); setDialogOpen(false); toast.success("Kategori oluşturuldu"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.admin.categories.update.useMutation({
    onSuccess: () => { utils.admin.categories.list.invalidate(); setDialogOpen(false); setEditing(null); toast.success("Kategori güncellendi"); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "", imageUrl: "", sortOrder: 0, metaTitle: "", metaDescription: "", keywords: "" });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", icon: "", imageUrl: "", sortOrder: 0, metaTitle: "", metaDescription: "", keywords: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", icon: cat.icon || "", imageUrl: cat.imageUrl || "", sortOrder: cat.sortOrder, metaTitle: cat.metaTitle || "", metaDescription: cat.metaDescription || "", keywords: cat.keywords || "" });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name) { toast.error("Kategori adı zorunlu"); return; }
    const slug = form.slug || slugify(form.name);
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...form, slug });
    } else {
      createMutation.mutate({ ...form, slug });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kategori Yönetimi</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Yeni Kategori</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="hidden sm:table-cell">Slug</TableHead>
                  <TableHead className="hidden md:table-cell">Sıra</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((cat: any) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{cat.sortOrder}</TableCell>
                    <TableCell><Badge variant={cat.isActive ? "default" : "secondary"}>{cat.isActive ? "Aktif" : "Pasif"}</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => openEdit(cat)}><Edit className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Henüz kategori eklenmemiş.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Kategori Düzenle" : "Yeni Kategori"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Ad *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Açıklama</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>İkon</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Dumbbell" /></div>
              <div className="space-y-2"><Label>Sıra</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
            </div>
            <div className="space-y-2"><Label>Görsel URL</Label><Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></div>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="w-full">
              {editing ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
