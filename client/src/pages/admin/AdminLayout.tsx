import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getLoginUrl } from "@/const";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard, Package, ShoppingCart, FolderTree, Award,
  Settings, Users, LogOut, Menu, ChevronLeft, Mail, Bell,
  Sparkles, Gift, BarChart3
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useState, type ReactNode } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Package, label: "Ürünler", path: "/admin/products" },
  { icon: FolderTree, label: "Kategoriler", path: "/admin/categories" },
  { icon: Award, label: "Markalar", path: "/admin/brands" },
  { icon: ShoppingCart, label: "Siparişler", path: "/admin/orders" },
  { icon: Sparkles, label: "Sihirbaz", path: "/admin/quiz" },
  { icon: Gift, label: "Kampanyalar", path: "/admin/campaigns" },
  { icon: Users, label: "Müşteriler", path: "/admin/customers" },
  { icon: Mail, label: "Mesajlar", path: "/admin/messages" },
  { icon: Bell, label: "Newsletter", path: "/admin/newsletter" },
  { icon: Settings, label: "Ayarlar", path: "/admin/settings" },
];

function NavItem({ item, isActive, onClick }: { item: typeof menuItems[0]; isActive: boolean; onClick?: () => void }) {
  return (
    <Link href={item.path} onClick={onClick}>
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors min-h-[44px] ${
        isActive ? "bg-primary text-primary-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent"
      }`}>
        <item.icon className="h-4 w-4 shrink-0" />
        <span>{item.label}</span>
      </div>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 w-full max-w-sm p-8">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6 p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold">Yetki Gerekli</h1>
          <p className="text-muted-foreground">Bu sayfaya erişmek için admin yetkisine sahip olmanız gerekiyor.</p>
          <div className="flex gap-3">
            <Button onClick={() => window.location.href = getLoginUrl()} variant="outline">Giriş Yap</Button>
            <Link href="/"><Button>Ana Sayfaya Dön</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/admin">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PM</span>
            </div>
            <div>
              <p className="font-bold text-sm text-sidebar-foreground">ProteinMarket</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavItem key={item.path} item={item} isActive={location === item.path} onClick={onItemClick} />
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <Link href="/">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors min-h-[44px]">
            <ChevronLeft className="h-4 w-4" />
            <span>Mağazaya Dön</span>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border flex-col shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-sidebar">
                <SidebarContent onItemClick={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <h2 className="font-semibold text-sm">
              {menuItems.find((i) => i.path === location)?.label || "Admin"}
            </h2>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-accent rounded-lg px-2 py-1 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm hidden sm:inline">{user.name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
