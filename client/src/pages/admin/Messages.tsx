import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, MailOpen } from "lucide-react";
import { toast } from "sonner";

export default function AdminMessages() {
  const { data, isLoading } = trpc.admin.contactMessages.list.useQuery();
  const markReadMutation = trpc.admin.contactMessages.markRead.useMutation({
    onSuccess: () => { utils.admin.contactMessages.list.invalidate(); toast.success("Okundu olarak işaretlendi"); },
  });
  const utils = trpc.useUtils();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">İletişim Mesajları</h1>
      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((msg: any) => (
            <Card key={msg.id} className={msg.isRead ? "opacity-70" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {msg.isRead ? <MailOpen className="h-4 w-4 text-muted-foreground" /> : <Mail className="h-4 w-4 text-primary" />}
                      <span className="font-medium text-sm">{msg.subject}</span>
                      {!msg.isRead && <Badge variant="default" className="text-xs">Yeni</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{msg.name} ({msg.email})</p>
                    <p className="text-sm mt-2">{msg.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(msg.createdAt).toLocaleString("tr-TR")}</p>
                  </div>
                  {!msg.isRead && (
                    <Button variant="outline" size="sm" onClick={() => markReadMutation.mutate({ id: msg.id })}>Okundu</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Henüz mesaj yok.</CardContent></Card>
      )}
    </div>
  );
}
