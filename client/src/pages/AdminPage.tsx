/*
 * AdminPage - 2026 Modern Admin Panel
 * RBAC korumalı, veritabanından gerçek veri, sipariş/ürün/stok/müşteri yönetimi
 * shadcn/ui + Tailwind v4 + tRPC
 */
import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  LayoutDashboard, Package, ShoppingCart, Tag, Users, Truck,
  TrendingUp, Bell, Settings, ChevronRight, Search, Plus, Edit, Eye,
  ArrowUpRight, ArrowDownRight, DollarSign, BarChart3, Send, Megaphone,
  TrendingDown, BellRing, AlertTriangle, CheckCircle, Clock, Filter,
  LogOut, Menu, X, RefreshCw, Trash2, Save, ChevronDown, Home,
  Mail, Shield, Activity, FileText, Box
} from 'lucide-react';
import { useNotifications, type NotificationType, type NotificationPriority } from '@/contexts/NotificationContext';

type Tab = 'dashboard' | 'orders' | 'products' | 'stock' | 'customers' | 'notifications' | 'newsletter' | 'settings';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Onaylandı', color: 'bg-blue-100 text-blue-700' },
  preparing: { label: 'Hazırlanıyor', color: 'bg-indigo-100 text-indigo-700' },
  shipped: { label: 'Kargoda', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'İptal', color: 'bg-red-100 text-red-700' },
};

const NOTIF_TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: 'stok_uyarisi', label: 'Stok Uyarısı' },
  { value: 'fiyat_dususu', label: 'Fiyat Düşüşü' },
  { value: 'kampanya', label: 'Kampanya' },
  { value: 'siparis_durumu', label: 'Sipariş Durumu' },
  { value: 'genel_duyuru', label: 'Genel Duyuru' },
  { value: 'sistem', label: 'Sistem' },
];

// ===== Stat Card =====
function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: typeof TrendingUp; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="font-heading font-bold text-2xl text-[#1B2A4A]">{value}</p>
    </div>
  );
}

// ===== Main Admin Page =====
export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Notification context
  const { notifications, sendBulkNotification, getStats } = useNotifications();
  const notifStats = getStats();

  const [notifForm, setNotifForm] = useState({
    type: 'genel_duyuru' as NotificationType,
    priority: 'medium' as NotificationPriority,
    title: '',
    message: '',
    link: '',
  });

  // tRPC queries (admin protected)
  const dashboardQuery = trpc.admin.dashboard.useQuery(undefined, {
    enabled: user?.role === 'admin',
    retry: false,
  });

  const ordersQuery = trpc.admin.orders.list.useQuery(
    { search: orderSearch || undefined, status: orderStatusFilter || undefined, limit: 50 },
    { enabled: user?.role === 'admin', retry: false }
  );

  const productsQuery = trpc.admin.products.list.useQuery(
    { search: productSearch || undefined, limit: 50 },
    { enabled: user?.role === 'admin', retry: false }
  );

  const customersQuery = trpc.admin.customers.list.useQuery(
    { search: customerSearch || undefined, limit: 50 },
    { enabled: user?.role === 'admin', retry: false }
  );

  const newsletterQuery = trpc.admin.newsletterList.useQuery(undefined, {
    enabled: user?.role === 'admin' && activeTab === 'newsletter',
    retry: false,
  });

  const stockAlertsQuery = trpc.admin.stockAlertsList.useQuery(undefined, {
    enabled: user?.role === 'admin' && activeTab === 'stock',
    retry: false,
  });

  // Mutations
  const updateOrderStatus = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Sipariş durumu güncellendi');
      ordersQuery.refetch();
      dashboardQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteProduct = trpc.admin.products.delete.useMutation({
    onSuccess: () => {
      toast.success('Ürün pasife alındı');
      productsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStock = trpc.admin.stock.updateVariant.useMutation({
    onSuccess: () => {
      toast.success('Stok güncellendi');
      dashboardQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[#FF6B35] animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center shadow-sm">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="font-heading font-bold text-2xl text-[#1B2A4A] mb-2">Erişim Engellendi</h1>
          <p className="text-gray-500 mb-6">Bu sayfaya erişmek için giriş yapmanız gerekiyor.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-xl font-heading font-semibold hover:bg-orange-600 transition-colors">
            <Home className="w-4 h-4" /> Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center shadow-sm">
          <Shield className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="font-heading font-bold text-2xl text-[#1B2A4A] mb-2">Yetkisiz Erişim</h1>
          <p className="text-gray-500 mb-2">Bu sayfa yalnızca yöneticiler içindir.</p>
          <p className="text-xs text-gray-400 mb-6">Hesap: {user.email || user.name || 'Bilinmiyor'} ({user.role})</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-[#1B2A4A] text-white px-6 py-3 rounded-xl font-heading font-semibold hover:bg-[#2a3d5c] transition-colors">
            <Home className="w-4 h-4" /> Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const menuItems: { id: Tab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: 'dashboard', label: 'Gösterge Paneli', icon: LayoutDashboard },
    { id: 'orders', label: 'Siparişler', icon: ShoppingCart, badge: dashboardQuery.data?.orders },
    { id: 'products', label: 'Ürünler', icon: Package },
    { id: 'stock', label: 'Stok Yönetimi', icon: BarChart3 },
    { id: 'customers', label: 'Müşteriler', icon: Users },
    { id: 'notifications', label: 'Bildirimler', icon: Bell, badge: notifStats.unread },
    { id: 'newsletter', label: 'E-Bülten', icon: Mail },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  const handleSendNotification = () => {
    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      toast.error('Başlık ve mesaj alanları zorunludur.');
      return;
    }
    sendBulkNotification({
      type: notifForm.type,
      priority: notifForm.priority,
      title: notifForm.title,
      message: notifForm.message,
      link: notifForm.link || undefined,
      adminCreated: true,
    });
    setNotifForm({ type: 'genel_duyuru', priority: 'medium', title: '', message: '', link: '' });
    toast.success('Bildirim gönderildi');
  };

  const dashboard = dashboardQuery.data;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen bg-[#1B2A4A] text-white w-64 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} shrink-0`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-orange-600 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-heading font-black text-sm">P</span>
              </div>
              <div>
                <span className="font-heading font-bold text-sm block leading-tight">ProteinMarket</span>
                <span className="text-[10px] text-gray-400">Yönetim Paneli</span>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 hover:bg-white/10 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="bg-white/5 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold text-xs">
                {user.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name || 'Admin'}</p>
                <p className="text-[10px] text-gray-400 truncate">{user.email || ''}</p>
              </div>
              <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-medium">Admin</span>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-[#FF6B35] to-orange-600 text-white shadow-lg shadow-orange-500/20'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}>
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>

          <Link href="/" className="flex items-center gap-2 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl text-sm transition-colors mt-2">
            <Home className="w-4 h-4" /> Siteye Dön
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-xl">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="font-heading font-bold text-lg text-[#1B2A4A]">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { dashboardQuery.refetch(); ordersQuery.refetch(); productsQuery.refetch(); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors" title="Yenile">
                <RefreshCw className={`w-4 h-4 text-gray-500 ${dashboardQuery.isFetching ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-xs text-gray-400 hidden sm:block">
                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 pb-24 md:pb-6">
          {/* ===== DASHBOARD ===== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Toplam Sipariş" value={dashboard?.orders ?? 0} icon={ShoppingCart} color="bg-blue-500" />
                <StatCard title="Toplam Gelir" value={`${((dashboard?.revenue ?? 0) / 100).toLocaleString('tr-TR')} ₺`} icon={DollarSign} color="bg-green-500" />
                <StatCard title="Müşteriler" value={dashboard?.customers ?? 0} icon={Users} color="bg-purple-500" />
                <StatCard title="Aktif Ürünler" value={dashboard?.products ?? 0} icon={Package} color="bg-orange-500" />
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-heading font-bold text-sm text-[#1B2A4A] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" /> Son Siparişler
                  </h2>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-[#FF6B35] hover:underline font-medium">Tümünü Gör</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50/50"><th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Sipariş No</th><th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Müşteri</th><th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Tutar</th><th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Durum</th><th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Tarih</th></tr></thead>
                    <tbody>
                      {(dashboard?.recentOrders ?? []).length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Henüz sipariş yok</td></tr>
                      ) : (
                        (dashboard?.recentOrders ?? []).slice(0, 5).map((order: any) => (
                          <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-mono font-semibold text-[#1B2A4A]">#{order.orderNumber}</td>
                            <td className="px-4 py-3 text-gray-600">{order.customerName}</td>
                            <td className="px-4 py-3 font-semibold">{(order.total / 100).toLocaleString('tr-TR')} ₺</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_MAP[order.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                                {STATUS_MAP[order.status]?.label || order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Low Stock */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-heading font-bold text-sm text-[#1B2A4A] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" /> Düşük Stoklu Ürünler
                  </h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {(dashboard?.lowStockProducts ?? []).length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">Düşük stoklu ürün yok</div>
                  ) : (
                    (dashboard?.lowStockProducts ?? []).map((v: any) => (
                      <div key={v.variantId} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50">
                        <div>
                          <p className="text-sm font-medium text-[#1B2A4A]">{v.variantName}</p>
                          <p className="text-xs text-gray-400">SKU: {v.sku}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {v.stock} adet
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== ORDERS ===== */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                    placeholder="Sipariş no, müşteri adı veya e-posta ara..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none" />
                </div>
                <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FF6B35] outline-none bg-white">
                  <option value="">Tüm Durumlar</option>
                  {Object.entries(STATUS_MAP).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Sipariş No</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Müşteri</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">E-posta</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Tutar</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Durum</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Tarih</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">İşlem</th>
                    </tr></thead>
                    <tbody>
                      {ordersQuery.isLoading ? (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400"><RefreshCw className="w-5 h-5 animate-spin mx-auto" /></td></tr>
                      ) : (ordersQuery.data?.orders ?? []).length === 0 ? (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">Sipariş bulunamadı</td></tr>
                      ) : (
                        (ordersQuery.data?.orders ?? []).map((order: any) => (
                          <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-mono font-semibold text-[#1B2A4A]">#{order.orderNumber}</td>
                            <td className="px-4 py-3 text-gray-700 font-medium">{order.customerName}</td>
                            <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{order.customerEmail}</td>
                            <td className="px-4 py-3 font-semibold">{(order.total / 100).toLocaleString('tr-TR')} ₺</td>
                            <td className="px-4 py-3">
                              <select
                                value={order.status}
                                onChange={e => updateOrderStatus.mutate({ orderId: order.id, status: e.target.value as any })}
                                className={`text-xs px-2 py-1 rounded-lg font-medium border-0 cursor-pointer ${STATUS_MAP[order.status]?.color || 'bg-gray-100'}`}>
                                {Object.entries(STATUS_MAP).map(([key, val]) => (
                                  <option key={key} value={key}>{val.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                            <td className="px-4 py-3">
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg" title="Detay">
                                <Eye className="w-4 h-4 text-gray-400" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {ordersQuery.data && (
                  <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                    Toplam {ordersQuery.data.total} sipariş
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== PRODUCTS ===== */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                    placeholder="Ürün adı ara..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none" />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Ürün</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Kategori</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Fiyat</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Durum</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">İşlem</th>
                    </tr></thead>
                    <tbody>
                      {productsQuery.isLoading ? (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400"><RefreshCw className="w-5 h-5 animate-spin mx-auto" /></td></tr>
                      ) : (productsQuery.data?.products ?? []).length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Ürün bulunamadı</td></tr>
                      ) : (
                        (productsQuery.data?.products ?? []).map((product: any) => (
                          <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />}
                                <div>
                                  <p className="font-medium text-[#1B2A4A]">{product.name}</p>
                                  <p className="text-xs text-gray-400">{product.slug}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{product.categoryId}</td>
                            <td className="px-4 py-3 font-semibold">{(product.basePrice / 100).toLocaleString('tr-TR')} ₺</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.isActive === 'true' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {product.isActive === 'true' ? 'Aktif' : 'Pasif'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button className="p-1.5 hover:bg-gray-100 rounded-lg" title="Düzenle">
                                  <Edit className="w-4 h-4 text-gray-400" />
                                </button>
                                <button onClick={() => { if (confirm('Bu ürünü pasife almak istediğinize emin misiniz?')) deleteProduct.mutate({ id: product.id }); }}
                                  className="p-1.5 hover:bg-red-50 rounded-lg" title="Sil">
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {productsQuery.data && (
                  <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                    Toplam {productsQuery.data.total} ürün
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== STOCK ===== */}
          {activeTab === 'stock' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Toplam Ürün" value={dashboard?.products ?? 0} icon={Package} color="bg-blue-500" />
                <StatCard title="Düşük Stok" value={dashboard?.lowStockProducts?.length ?? 0} icon={AlertTriangle} color="bg-yellow-500" />
                <StatCard title="Stok Uyarıları" value={stockAlertsQuery.data?.length ?? 0} icon={BellRing} color="bg-red-500" />
              </div>

              {/* Low Stock Products */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-heading font-bold text-sm text-[#1B2A4A]">Düşük Stoklu Varyantlar</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {(dashboard?.lowStockProducts ?? []).length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">Düşük stoklu ürün yok</div>
                  ) : (
                    (dashboard?.lowStockProducts ?? []).map((v: any) => (
                      <div key={v.variantId} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50">
                        <div>
                          <p className="text-sm font-medium text-[#1B2A4A]">{v.variantName}</p>
                          <p className="text-xs text-gray-400">SKU: {v.sku}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            {v.stock} adet
                          </span>
                          <input type="number" defaultValue={v.stock} min={0}
                            className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm text-center"
                            onBlur={e => {
                              const newStock = parseInt(e.target.value);
                              if (!isNaN(newStock) && newStock !== v.stock) {
                                updateStock.mutate({ variantId: v.variantId, stock: newStock });
                              }
                            }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Stock Alert Subscriptions */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-heading font-bold text-sm text-[#1B2A4A]">Stok Uyarı Abonelikleri</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {stockAlertsQuery.isLoading ? (
                    <div className="p-6 text-center"><RefreshCw className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
                  ) : (stockAlertsQuery.data ?? []).length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">Henüz stok uyarı kaydı yok</div>
                  ) : (
                    (stockAlertsQuery.data ?? []).map((alert: any) => (
                      <div key={alert.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50">
                        <div>
                          <p className="text-sm font-medium text-[#1B2A4A]">{alert.email}</p>
                          <p className="text-xs text-gray-400">Ürün: {alert.productId} • {new Date(alert.createdAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${alert.isNotified === 'true' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {alert.isNotified === 'true' ? 'Bildirildi' : 'Bekliyor'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== CUSTOMERS ===== */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)}
                  placeholder="Müşteri adı veya e-posta ara..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none" />
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Müşteri</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">E-posta</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Rol</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Kayıt</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Son Giriş</th>
                    </tr></thead>
                    <tbody>
                      {customersQuery.isLoading ? (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400"><RefreshCw className="w-5 h-5 animate-spin mx-auto" /></td></tr>
                      ) : (customersQuery.data?.customers ?? []).length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Müşteri bulunamadı</td></tr>
                      ) : (
                        (customersQuery.data?.customers ?? []).map((customer: any) => (
                          <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-medium text-[#1B2A4A]">{customer.name || 'İsimsiz'}</td>
                            <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{customer.email || '-'}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${customer.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                {customer.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">{new Date(customer.createdAt).toLocaleDateString('tr-TR')}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">{new Date(customer.lastSignedIn).toLocaleDateString('tr-TR')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {customersQuery.data && (
                  <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                    Toplam {customersQuery.data.total} müşteri
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== NOTIFICATIONS ===== */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Toplam" value={notifStats.total} icon={Bell} color="bg-blue-500" />
                <StatCard title="Okunmamış" value={notifStats.unread} icon={BellRing} color="bg-red-500" />
                <StatCard title="Kampanya" value={notifStats.byType.kampanya} icon={Tag} color="bg-orange-500" />
                <StatCard title="Stok Uyarı" value={notifStats.byType.stok_uyarisi} icon={Package} color="bg-green-500" />
              </div>

              {/* Send Notification Form */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="font-heading font-bold text-sm text-[#1B2A4A] mb-4 flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#FF6B35]" /> Bildirim Gönder
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Tür</label>
                    <select value={notifForm.type} onChange={e => setNotifForm(p => ({ ...p, type: e.target.value as NotificationType }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FF6B35] outline-none">
                      {NOTIF_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Öncelik</label>
                    <select value={notifForm.priority} onChange={e => setNotifForm(p => ({ ...p, priority: e.target.value as NotificationPriority }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FF6B35] outline-none">
                      <option value="low">Düşük</option>
                      <option value="medium">Normal</option>
                      <option value="high">Yüksek</option>
                      <option value="urgent">Acil</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Başlık</label>
                    <input type="text" value={notifForm.title} onChange={e => setNotifForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="Bildirim başlığı..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FF6B35] outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Mesaj</label>
                    <textarea value={notifForm.message} onChange={e => setNotifForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Bildirim mesajı..." rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FF6B35] outline-none resize-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Link (opsiyonel)</label>
                    <input type="text" value={notifForm.link} onChange={e => setNotifForm(p => ({ ...p, link: e.target.value }))}
                      placeholder="/kategori/protein-tozu" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FF6B35] outline-none" />
                  </div>
                </div>
                <button onClick={handleSendNotification}
                  disabled={!notifForm.title.trim() || !notifForm.message.trim()}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-[#FF6B35] text-white py-3 rounded-xl font-heading font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send className="w-4 h-4" /> Bildirim Gönder
                </button>
              </div>

              {/* Recent Notifications */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-heading font-bold text-sm text-[#1B2A4A]">Son Bildirimler ({notifications.length})</h2>
                </div>
                <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400"><Bell className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">Henüz bildirim yok</p></div>
                  ) : (
                    notifications.slice(0, 20).map(notif => (
                      <div key={notif.id} className={`p-3 hover:bg-gray-50 ${!notif.read ? 'bg-orange-50/30' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-gray-100 text-gray-600">
                            {NOTIF_TYPE_OPTIONS.find(o => o.value === notif.type)?.label}
                          </span>
                          {notif.adminCreated && <span className="text-[9px] bg-blue-50 text-blue-500 px-1 py-0.5 rounded font-medium">Admin</span>}
                          {!notif.read && <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full" />}
                        </div>
                        <p className="text-sm font-medium text-[#1B2A4A]">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.timestamp).toLocaleString('tr-TR')}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== NEWSLETTER ===== */}
          {activeTab === 'newsletter' && (
            <div className="space-y-4">
              <StatCard title="E-Bülten Aboneleri" value={newsletterQuery.data?.length ?? 0} icon={Mail} color="bg-blue-500" />
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">E-posta</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Durum</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Kayıt Tarihi</th>
                    </tr></thead>
                    <tbody>
                      {newsletterQuery.isLoading ? (
                        <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400"><RefreshCw className="w-5 h-5 animate-spin mx-auto" /></td></tr>
                      ) : (newsletterQuery.data ?? []).length === 0 ? (
                        <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">Henüz abone yok</td></tr>
                      ) : (
                        (newsletterQuery.data ?? []).map((sub: any) => (
                          <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-medium text-[#1B2A4A]">{sub.email}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">Aktif</span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{new Date(sub.createdAt).toLocaleDateString('tr-TR')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== SETTINGS ===== */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                <h2 className="font-heading font-bold text-sm text-[#1B2A4A] mb-2">Mağaza Ayarları</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Mağaza Adı</label>
                    <input type="text" defaultValue="ProteinMarket" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FF6B35] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">WhatsApp Numarası</label>
                    <input type="text" defaultValue="+905001234567" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FF6B35] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Ücretsiz Kargo Limiti (₺)</label>
                    <input type="number" defaultValue={300} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FF6B35] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Kargo Kesim Saati</label>
                    <input type="time" defaultValue="16:00" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FF6B35] outline-none" />
                  </div>
                </div>
                <button className="bg-[#FF6B35] text-white px-6 py-2.5 rounded-xl text-sm font-heading font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" /> Kaydet
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="font-heading font-bold text-sm text-[#1B2A4A] mb-2">Sistem Bilgisi</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Versiyon</p><p className="font-medium text-[#1B2A4A]">2.0.0</p></div>
                  <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Framework</p><p className="font-medium text-[#1B2A4A]">React 19 + tRPC</p></div>
                  <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Veritabanı</p><p className="font-medium text-[#1B2A4A]">MySQL (TiDB)</p></div>
                  <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Auth</p><p className="font-medium text-[#1B2A4A]">Manus OAuth</p></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
