import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useState } from "react";

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = trpc.admin.customers.list.useQuery({ search: search || undefined });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Müşteriler</h1>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Müşteri ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead className="hidden sm:table-cell">E-posta</TableHead>
                  <TableHead className="hidden md:table-cell">Rol</TableHead>
                  <TableHead className="hidden md:table-cell">Kayıt Tarihi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.customers && data.customers.length > 0 ? data.customers.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-sm">{c.name || "İsimsiz"}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{c.email || "-"}</TableCell>
                    <TableCell className="hidden md:table-cell"><Badge variant={c.role === "admin" ? "default" : "secondary"}>{c.role}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("tr-TR")}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Henüz müşteri yok.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
