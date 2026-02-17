import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function StoreFooter() {
  const settingsQ = trpc.settings.list.useQuery();
  const legalQ = trpc.legal.list.useQuery();
  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => { toast.success(data.message); setEmail(""); },
    onError: (e) => toast.error(e.message),
  });
  const [email, setEmail] = useState("");

  const getSetting = (key: string) => {
    const s = settingsQ.data?.find((s: any) => s.settingKey === key);
    return s?.settingValue || "";
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) subscribeMutation.mutate({ email: email.trim() });
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Newsletter */}
      <div className="bg-primary/10 py-8">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">Fırsatları Kaçırma!</h3>
              <p className="text-sm text-muted-foreground">İndirimler ve yeni ürünlerden haberdar ol.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full sm:w-auto">
              <Input placeholder="E-posta adresiniz" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background min-w-[200px]" />
              <Button type="submit" disabled={subscribeMutation.isPending}><Send className="h-4 w-4" /></Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h4 className="font-bold text-lg mb-4">ProteinMarket</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {getSetting("site_description") || "Türkiye'nin en güvenilir sporcu gıdaları mağazası. Orijinal ürünler, hızlı teslimat."}
            </p>
            <div className="flex gap-3 mt-4">
              {getSetting("social_instagram") && <a href={getSetting("social_instagram")} target="_blank" rel="noopener" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"><Instagram className="h-4 w-4" /></a>}
              {getSetting("social_twitter") && <a href={getSetting("social_twitter")} target="_blank" rel="noopener" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"><Twitter className="h-4 w-4" /></a>}
              {getSetting("social_facebook") && <a href={getSetting("social_facebook")} target="_blank" rel="noopener" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"><Facebook className="h-4 w-4" /></a>}
              {getSetting("social_youtube") && <a href={getSetting("social_youtube")} target="_blank" rel="noopener" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"><Youtube className="h-4 w-4" /></a>}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Hızlı Bağlantılar</h4>
            <ul className="space-y-2">
              <li><Link href="/about"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors">Hakkımızda</span></Link></li>
              <li><Link href="/contact"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors">İletişim</span></Link></li>
              <li><Link href="/brands"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors">Markalar</span></Link></li>
              <li><Link href="/faq"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors">SSS</span></Link></li>
              <li><Link href="/order-track"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sipariş Takip</span></Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4">Yasal</h4>
            <ul className="space-y-2">
              {legalQ.data?.map((page: any) => (
                <li key={page.slug}><Link href={`/legal/${page.slug}`}><span className="text-sm text-muted-foreground hover:text-foreground transition-colors">{page.title}</span></Link></li>
              ))}
              {(!legalQ.data || legalQ.data.length === 0) && (
                <>
                  <li><Link href="/legal/gizlilik-politikasi"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors">Gizlilik Politikası</span></Link></li>
                  <li><Link href="/legal/mesafeli-satis-sozlesmesi"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors">Mesafeli Satış Sözleşmesi</span></Link></li>
                  <li><Link href="/legal/iptal-iade-kosullari"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors">İptal ve İade Koşulları</span></Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">İletişim</h4>
            <ul className="space-y-3">
              {getSetting("contact_email") && (
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />{getSetting("contact_email")}
                </li>
              )}
              {getSetting("contact_phone") && (
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />{getSetting("contact_phone")}
                </li>
              )}
              {getSetting("contact_address") && (
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />{getSetting("contact_address")}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {getSetting("footer_text") || `© ${new Date().getFullYear()} ProteinMarket. Tüm hakları saklıdır.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
