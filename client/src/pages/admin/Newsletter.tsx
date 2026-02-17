import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminNewsletter() {
  const { data, isLoading } = trpc.admin.newsletterList.useQuery();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Newsletter Aboneleri</h1>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((sub: any) => (
                  <TableRow key={sub.id}>
                    <TableCell className="text-sm">{sub.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString("tr-TR")}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={2} className="text-center py-8 text-muted-foreground">Henüz abone yok.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
