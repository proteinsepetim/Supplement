import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const settingsQ = trpc.settings.list.useQuery();
  const contactMutation = trpc.contact.send.useMutation({
    onSuccess: () => { toast.success("Mesajınız gönderildi!"); setForm({ name: "", email: "", subject: "", message: "" }); },
    onError: (e) => toast.error(e.message),
  });
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const getSetting = (key: string) => settingsQ.data?.find((s: any) => s.settingKey === key)?.settingValue || "";

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">
        <div className="container py-6 sm:py-8 max-w-4xl">
          <h1 className="text-2xl font-bold mb-6">İletişim</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-5 space-y-4">
                <h2 className="font-bold text-lg">Bize Ulaşın</h2>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Ad Soyad</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>E-posta</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Konu</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Mesaj</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} /></div>
                  <Button onClick={() => contactMutation.mutate(form)} disabled={contactMutation.isPending} className="w-full">
                    <Send className="h-4 w-4 mr-2" /> Gönder
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-4">
              {getSetting("contact_email") && (
                <Card><CardContent className="p-4 flex items-center gap-3"><Mail className="h-5 w-5 text-primary shrink-0" /><div><p className="text-sm font-medium">E-posta</p><p className="text-sm text-muted-foreground">{getSetting("contact_email")}</p></div></CardContent></Card>
              )}
              {getSetting("contact_phone") && (
                <Card><CardContent className="p-4 flex items-center gap-3"><Phone className="h-5 w-5 text-primary shrink-0" /><div><p className="text-sm font-medium">Telefon</p><p className="text-sm text-muted-foreground">{getSetting("contact_phone")}</p></div></CardContent></Card>
              )}
              {getSetting("contact_address") && (
                <Card><CardContent className="p-4 flex items-start gap-3"><MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" /><div><p className="text-sm font-medium">Adres</p><p className="text-sm text-muted-foreground">{getSetting("contact_address")}</p></div></CardContent></Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
