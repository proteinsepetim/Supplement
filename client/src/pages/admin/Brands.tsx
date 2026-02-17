import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { slugify } from "@shared/utils";
import { Plus, Edit, Award } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminBrands() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.brands.list.useQuery();

  const createMutation = trpc.admin.brands.create.useMutation({
    onSuccess: () => { utils.admin.brands.list.invalidate(); setDialogOpen(false); toast.success("Marka oluşturuldu"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.admin.brands.update.useMutation({
    onSuccess: () => { utils.admin.brands.list.invalidate(); setDialogOpen(false); setEditing(null); toast.success("Marka güncellendi"); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ name: "", slug: "", description: "", logoUrl: "", sortOrder: 0 });

  const openCreate = () => { setEditing(null); setForm({ name: "", slug: "", description: "", logoUrl: "", sortOrder: 0 }); setDialogOpen(true); };
  const openEdit = (b: any) => { setEditing(b); setForm({ name: b.name, slug: b.slug, description: b.description || "", logoUrl: b.logoUrl || "", sortOrder: b.sortOrder }); setDialogOpen(true); };

  const handleSubmit = () => {
    if (!form.name) { toast.error("Marka adı zorunlu"); return; }
    const slug = form.slug || slugify(form.name);
    if (editing) updateMutation.mutate({ id: editing.id, ...form, slug });
    else createMutation.mutate({ ...form, slug });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Marka Yönetimi</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Yeni Marka</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marka</TableHead>
                  <TableHead className="hidden sm:table-cell">Slug</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {b.logoUrl ? <img src={b.logoUrl} alt={b.name} className="h-8 w-8 rounded object-contain" /> : <Award className="h-5 w-5 text-muted-foreground" />}
                        <span className="font-medium text-sm">{b.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{b.slug}</TableCell>
                    <TableCell><Badge variant={b.isActive ? "default" : "secondary"}>{b.isActive ? "Aktif" : "Pasif"}</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => openEdit(b)}><Edit className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Henüz marka eklenmemiş.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Marka Düzenle" : "Yeni Marka"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Ad *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Açıklama</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Logo URL</Label><Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} /></div>
              <div className="space-y-2"><Label>Sıra</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
            </div>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="w-full">
              {editing ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
