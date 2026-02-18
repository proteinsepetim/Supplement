import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, Search, User, LogOut, Settings, ChevronRight, X, Package, Sparkles } from "lucide-react";
import { useState } from "react";

export default function StoreHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const categoriesQ = trpc.categories.list.useQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const parentCategories = categoriesQ.data?.filter((c: any) => !c.parentId) || [];
  const getSubCategories = (parentId: number) => categoriesQ.data?.filter((c: any) => c.parentId === parentId) || [];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      {/* Top bar - free shipping */}
      <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs sm:text-sm font-medium">
        500₺ ve üzeri siparişlerde ücretsiz kargo!
      </div>

      <div className="container">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden shrink-0"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b flex items-center justify-between">
                  <Link href="/" onClick={() => setMobileOpen(false)}>
                    <span className="font-bold text-lg">ProteinMarket</span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => setMobileOpen(false)}><X className="h-4 w-4" /></Button>
                </div>
                <nav className="flex-1 overflow-y-auto p-4">
                  <Accordion type="multiple" className="space-y-1">
                    {parentCategories.map((cat: any) => {
                      const subs = getSubCategories(cat.id);
                      if (subs.length > 0) {
                        return (
                          <AccordionItem key={cat.id} value={`cat-${cat.id}`} className="border-0">
                            <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline min-h-[44px]">
                              {cat.name}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-1 pl-4">
                                <Link href={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)}>
                                  <div className="py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px] flex items-center">
                                    Tümünü Gör
                                  </div>
                                </Link>
                                {subs.map((sub: any) => (
                                  <Link key={sub.id} href={`/category/${sub.slug}`} onClick={() => setMobileOpen(false)}>
                                    <div className="py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px] flex items-center">
                                      {sub.name}
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      }
                      return (
                        <Link key={cat.id} href={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)}>
                          <div className="py-3 text-sm font-medium min-h-[44px] flex items-center">{cat.name}</div>
                        </Link>
                      );
                    })}
                  </Accordion>
                  <div className="border-t mt-4 pt-4 space-y-1">
                    <Link href="/supplement-wizard" onClick={() => setMobileOpen(false)}>
                      <div className="py-3 text-sm min-h-[44px] flex items-center gap-2 text-primary font-medium"><Sparkles className="h-4 w-4" /> Supplement Sihirbazı</div>
                    </Link>
                    <Link href="/brands" onClick={() => setMobileOpen(false)}>
                      <div className="py-3 text-sm min-h-[44px] flex items-center gap-2"><Package className="h-4 w-4" /> Markalar</div>
                    </Link>
                    <Link href="/contact" onClick={() => setMobileOpen(false)}>
                      <div className="py-3 text-sm min-h-[44px] flex items-center">İletişim</div>
                    </Link>
                    <Link href="/about" onClick={() => setMobileOpen(false)}>
                      <div className="py-3 text-sm min-h-[44px] flex items-center">Hakkımızda</div>
                    </Link>
                  </div>
                </nav>
                {isAuthenticated ? (
                  <div className="p-4 border-t">
                    <p className="text-sm font-medium mb-2">{user?.name}</p>
                    <div className="space-y-1">
                      <Link href="/my-orders" onClick={() => setMobileOpen(false)}>
                        <div className="py-2 text-sm min-h-[44px] flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Siparişlerim</div>
                      </Link>
                      {user?.role === "admin" && (
                        <Link href="/admin" onClick={() => setMobileOpen(false)}>
                          <div className="py-2 text-sm min-h-[44px] flex items-center gap-2"><Settings className="h-4 w-4" /> Admin Panel</div>
                        </Link>
                      )}
                      <button onClick={() => { logout(); setMobileOpen(false); }} className="py-2 text-sm text-destructive min-h-[44px] flex items-center gap-2 w-full">
                        <LogOut className="h-4 w-4" /> Çıkış Yap
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-t">
                    <Button onClick={() => { window.location.href = getLoginUrl(); }} className="w-full">Giriş Yap</Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/">
            <span className="font-bold text-lg sm:text-xl tracking-tight text-primary">
              Protein<span className="text-foreground">Market</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {parentCategories.slice(0, 6).map((cat: any) => (
              <Link key={cat.id} href={`/category/${cat.slug}`}>
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{cat.name}</span>
              </Link>
            ))}
            <Link href="/brands">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Markalar</span>
            </Link>
            <Link href="/supplement-wizard">
              <span className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> Sihirbaz</span>
            </Link>
          </nav>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Ürün ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-10" />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="h-5 w-5" />
            </Button>
            {isAuthenticated ? (
              <Link href={user?.role === "admin" ? "/admin" : "/my-orders"}>
                <Button variant="ghost" size="sm"><User className="h-5 w-5" /></Button>
              </Link>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => window.location.href = getLoginUrl()}>
                <User className="h-5 w-5" />
              </Button>
            )}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Ürün ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" autoFocus />
            </div>
          </form>
        )}
      </div>
    </header>
  );
}
