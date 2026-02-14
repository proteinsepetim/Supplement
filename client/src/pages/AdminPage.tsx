/*
 * AdminPage - Athletic Precision Design
 * Sidebar layout, siparişler, ürünler, kampanyalar, stok, kargo takibi, XML/Excel, müşteriler
 * + Bildirim Yönetimi: oluşturma, gönderme, istatistik, geçmiş
 */
import { useState } from 'react';
import { Link } from 'wouter';
import {
  LayoutDashboard, Package, ShoppingCart, Tag, Users, Truck, FileSpreadsheet,
  TrendingUp, Bell, Settings, ChevronRight, Search, Plus, Edit, Eye,
  ArrowUpRight, ArrowDownRight, DollarSign, BarChart3, Send, Megaphone,
  TrendingDown, BellRing, AlertTriangle, CheckCircle, Clock, Filter
} from 'lucide-react';
import { products, campaigns, brands } from '@/lib/data';
import { useNotifications, type NotificationType, type NotificationPriority } from '@/contexts/NotificationContext';
import { toast } from 'sonner';

type Tab = 'dashboard' | 'orders' | 'products' | 'campaigns' | 'stock' | 'shipping' | 'xml' | 'customers' | 'notifications' | 'settings';

const MOCK_ORDERS = [
  { id: 'PM10001', customer: 'Ahmet Yılmaz', total: 2450, status: 'preparing', date: '2025-02-08', items: 3 },
  { id: 'PM10002', customer: 'Elif Demir', total: 890, status: 'shipped', date: '2025-02-08', items: 1 },
  { id: 'PM10003', customer: 'Mehmet Kaya', total: 3200, status: 'delivered', date: '2025-02-07', items: 5 },
  { id: 'PM10004', customer: 'Zeynep Arslan', total: 1750, status: 'pending', date: '2025-02-09', items: 2 },
  { id: 'PM10005', customer: 'Can Öztürk', total: 4100, status: 'preparing', date: '2025-02-09', items: 4 },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700' },
  preparing: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Kargoda', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'İptal', color: 'bg-red-100 text-red-700' },
};

const NOTIF_TYPE_OPTIONS: { value: NotificationType; label: string; icon: typeof Bell }[] = [
  { value: 'stok_uyarisi', label: 'Stok Uyarısı', icon: Package },
  { value: 'fiyat_dususu', label: 'Fiyat Düşüşü', icon: TrendingDown },
  { value: 'kampanya', label: 'Kampanya', icon: Tag },
  { value: 'siparis_durumu', label: 'Sipariş Durumu', icon: Truck },
  { value: 'genel_duyuru', label: 'Genel Duyuru', icon: Megaphone },
  { value: 'sistem', label: 'Sistem', icon: Settings },
];

const PRIORITY_OPTIONS: { value: NotificationPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Düşük', color: 'bg-gray-100 text-gray-600' },
  { value: 'medium', label: 'Normal', color: 'bg-blue-100 text-blue-600' },
  { value: 'high', label: 'Yüksek', color: 'bg-orange-100 text-orange-600' },
  { value: 'urgent', label: 'Acil', color: 'bg-red-100 text-red-600' },
];

function StatCard({ title, value, change, icon: Icon, positive }: { title: string; value: string; change: string; icon: typeof TrendingUp; positive: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{title}</span>
        <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#FF6B35]" />
        </div>
      </div>
      <p className="font-heading font-bold text-2xl text-[#1B2A4A]">{value}</p>
      <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
        {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change} geçen aya göre
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { notifications, sendBulkNotification, getStats, stockAlerts, priceAlerts } = useNotifications();

  // Bildirim oluşturma formu
  const [notifForm, setNotifForm] = useState({
    type: 'genel_duyuru' as NotificationType,
    priority: 'medium' as NotificationPriority,
    title: '',
    message: '',
    link: '',
    campaignCode: '',
    productId: '',
    orderId: '',
  });

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
      meta: {
        campaignCode: notifForm.campaignCode || undefined,
        productId: notifForm.productId || undefined,
        orderId: notifForm.orderId || undefined,
      },
    });

    setNotifForm({
      type: 'genel_duyuru',
      priority: 'medium',
      title: '',
      message: '',
      link: '',
      campaignCode: '',
      productId: '',
      orderId: '',
    });
  };

  const stats = getStats();

  const menuItems: { id: Tab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: 'dashboard', label: 'Gösterge Paneli', icon: LayoutDashboard },
    { id: 'orders', label: 'Siparişler', icon: ShoppingCart },
    { id: 'products', label: 'Ürünler', icon: Package },
    { id: 'campaigns', label: 'Kampanyalar', icon: Tag },
    { id: 'notifications', label: 'Bildirimler', icon: Bell, badge: stats.unread },
    { id: 'stock', label: 'Stok Yönetimi', icon: BarChart3 },
    { id: 'shipping', label: 'Kargo Takibi', icon: Truck },
    { id: 'xml', label: 'XML / Excel', icon: FileSpreadsheet },
    { id: 'customers', label: 'Müşteriler', icon: Users },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-[#1B2A4A] text-white ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 shrink-0 hidden md:block`}>
        <div className="p-4">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-[#FF6B35] font-heading font-black text-sm">P</span>
            </div>
            {sidebarOpen && <span className="font-heading font-bold text-sm">Admin Panel</span>}
          </Link>
          <nav className="space-y-1">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === item.id ? 'bg-white/10 text-[#FF6B35]' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}>
                <item.icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
                {sidebarOpen && item.badge && item.badge > 0 ? (
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
        <div className="flex overflow-x-auto">
          {menuItems.slice(0, 5).map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] relative ${activeTab === item.id ? 'text-[#FF6B35]' : 'text-gray-400'}`}>
              <item.icon className="w-4 h-4" />
              {item.label.split(' ')[0]}
              {item.badge && item.badge > 0 && (
                <span className="absolute top-0.5 right-1/4 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{item.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="font-heading font-bold text-2xl text-[#1B2A4A]">Gösterge Paneli</h1>
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveTab('notifications')} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 relative">
                  <Bell className="w-4 h-4 text-gray-500" />
                  {stats.unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{stats.unread}</span>
                  )}
                </button>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hidden md:block">
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Bugünkü Satış" value="12.450 TL" change="%23" icon={DollarSign} positive />
              <StatCard title="Sipariş Sayısı" value="28" change="%12" icon={ShoppingCart} positive />
              <StatCard title="Aktif Müşteri" value="1.245" change="%8" icon={Users} positive />
              <StatCard title="Dönüşüm Oranı" value="%3.2" change="%0.5" icon={TrendingUp} positive />
            </div>

            {/* Quick Notification Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#FF6B35]" />
                </div>
                <div>
                  <p className="font-heading font-bold text-lg text-[#1B2A4A]">{stats.total}</p>
                  <p className="text-xs text-gray-500">Toplam Bildirim</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-heading font-bold text-lg text-[#1B2A4A]">{stockAlerts.length}</p>
                  <p className="text-xs text-gray-500">Stok Uyarı Kaydı</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-heading font-bold text-lg text-[#1B2A4A]">{priceAlerts.length}</p>
                  <p className="text-xs text-gray-500">Fiyat Uyarı Kaydı</p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-heading font-bold text-sm text-[#1B2A4A]">Son Siparişler</h2>
                <button onClick={() => setActiveTab('orders')} className="text-xs text-[#FF6B35] font-semibold hover:underline">Tümünü Gör</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50">
                    <th className="text-left px-4 py-2 font-semibold text-gray-500">Sipariş</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-500">Müşteri</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-500">Tutar</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-500">Durum</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-500">Tarih</th>
                  </tr></thead>
                  <tbody>
                    {MOCK_ORDERS.map(order => (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-semibold text-[#1B2A4A]">#{order.id}</td>
                        <td className="px-4 py-3 text-gray-600">{order.customer}</td>
                        <td className="px-4 py-3 font-semibold">{order.total.toLocaleString('tr-TR')} TL</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_MAP[order.status]?.color}`}>{STATUS_MAP[order.status]?.label}</span></td>
                        <td className="px-4 py-3 text-gray-400">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="font-heading font-bold text-2xl text-[#1B2A4A]">Siparişler</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Sipariş ara..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white w-48" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Sipariş No</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Müşteri</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Ürün</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Tutar</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Durum</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Tarih</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">İşlem</th>
                  </tr></thead>
                  <tbody>
                    {MOCK_ORDERS.map(order => (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-semibold text-[#1B2A4A]">#{order.id}</td>
                        <td className="px-4 py-3 text-gray-600">{order.customer}</td>
                        <td className="px-4 py-3 text-gray-500">{order.items} ürün</td>
                        <td className="px-4 py-3 font-semibold">{order.total.toLocaleString('tr-TR')} TL</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_MAP[order.status]?.color}`}>{STATUS_MAP[order.status]?.label}</span></td>
                        <td className="px-4 py-3 text-gray-400">{order.date}</td>
                        <td className="px-4 py-3"><div className="flex gap-1"><button className="p-1.5 hover:bg-gray-100 rounded"><Eye className="w-3.5 h-3.5 text-gray-500" /></button><button className="p-1.5 hover:bg-gray-100 rounded"><Edit className="w-3.5 h-3.5 text-gray-500" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="font-heading font-bold text-2xl text-[#1B2A4A]">Ürünler ({products.length})</h1>
              <button className="flex items-center gap-1.5 bg-[#FF6B35] text-white px-4 py-2 rounded-lg text-sm font-heading font-semibold hover:bg-orange-600"><Plus className="w-4 h-4" /> Yeni Ürün</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Ürün</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Marka</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Fiyat</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Stok</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Durum</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">İşlem</th>
                  </tr></thead>
                  <tbody>
                    {products.map(product => {
                      const brand = brands.find(b => b.id === product.brandId);
                      const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
                      return (
                        <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" /><span className="font-medium text-[#1B2A4A] truncate max-w-[200px]">{product.name}</span></div></td>
                          <td className="px-4 py-3 text-gray-500">{brand?.name}</td>
                          <td className="px-4 py-3 font-semibold">{product.variants[0].price.toLocaleString('tr-TR')} TL</td>
                          <td className="px-4 py-3"><span className={`text-xs font-medium ${totalStock > 10 ? 'text-green-600' : totalStock > 0 ? 'text-yellow-600' : 'text-red-500'}`}>{totalStock} adet</span></td>
                          <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${totalStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{totalStock > 0 ? 'Aktif' : 'Stok Yok'}</span></td>
                          <td className="px-4 py-3"><div className="flex gap-1"><button className="p-1.5 hover:bg-gray-100 rounded"><Edit className="w-3.5 h-3.5 text-gray-500" /></button><Link href={`/urun/${product.slug}`} className="p-1.5 hover:bg-gray-100 rounded"><Eye className="w-3.5 h-3.5 text-gray-500" /></Link></div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="font-heading font-bold text-2xl text-[#1B2A4A]">Kampanyalar</h1>
              <button className="flex items-center gap-1.5 bg-[#FF6B35] text-white px-4 py-2 rounded-lg text-sm font-heading font-semibold hover:bg-orange-600"><Plus className="w-4 h-4" /> Yeni Kampanya</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading font-bold text-sm text-[#1B2A4A]">{campaign.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${campaign.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{campaign.active ? 'Aktif' : 'Pasif'}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{campaign.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Tip: {campaign.type}</span>
                    {campaign.code && <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{campaign.code}</span>}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50">Düzenle</button>
                    <button className="flex-1 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50">{campaign.active ? 'Durdur' : 'Aktifleştir'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== NOTIFICATIONS MANAGEMENT ===== */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="font-heading font-bold text-2xl text-[#1B2A4A] flex items-center gap-2">
                <Bell className="w-6 h-6 text-[#FF6B35]" />
                Bildirim Yönetimi
              </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="font-heading font-bold text-2xl text-[#1B2A4A]">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">Toplam</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="font-heading font-bold text-2xl text-[#FF6B35]">{stats.unread}</p>
                <p className="text-xs text-gray-500 mt-1">Okunmamış</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="font-heading font-bold text-2xl text-emerald-600">{stockAlerts.length}</p>
                <p className="text-xs text-gray-500 mt-1">Stok Uyarı</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="font-heading font-bold text-2xl text-blue-600">{priceAlerts.length}</p>
                <p className="text-xs text-gray-500 mt-1">Fiyat Uyarı</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bildirim Oluşturma Formu */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#FF6B35]/5 to-orange-50">
                  <h2 className="font-heading font-bold text-sm text-[#1B2A4A] flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#FF6B35]" />
                    Yeni Bildirim Gönder
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Tüm kullanıcılara bildirim gönderin</p>
                </div>
                <div className="p-4 space-y-4">
                  {/* Bildirim Türü */}
                  <div>
                    <label className="text-xs font-heading font-semibold text-[#1B2A4A] block mb-1.5">Bildirim Türü</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {NOTIF_TYPE_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setNotifForm(prev => ({ ...prev, type: opt.value }))}
                          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                            notifForm.type === opt.value
                              ? 'bg-[#FF6B35] text-white'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <opt.icon className="w-3 h-3" /> {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Öncelik */}
                  <div>
                    <label className="text-xs font-heading font-semibold text-[#1B2A4A] block mb-1.5">Öncelik</label>
                    <div className="flex gap-1.5">
                      {PRIORITY_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setNotifForm(prev => ({ ...prev, priority: opt.value }))}
                          className={`flex-1 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                            notifForm.priority === opt.value
                              ? 'bg-[#1B2A4A] text-white'
                              : `${opt.color} hover:opacity-80`
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Başlık */}
                  <div>
                    <label className="text-xs font-heading font-semibold text-[#1B2A4A] block mb-1.5">Başlık *</label>
                    <input
                      type="text"
                      value={notifForm.title}
                      onChange={e => setNotifForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Bildirim başlığı..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                    />
                  </div>

                  {/* Mesaj */}
                  <div>
                    <label className="text-xs font-heading font-semibold text-[#1B2A4A] block mb-1.5">Mesaj *</label>
                    <textarea
                      value={notifForm.message}
                      onChange={e => setNotifForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Bildirim mesajı..."
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none resize-none"
                    />
                  </div>

                  {/* Link */}
                  <div>
                    <label className="text-xs font-heading font-semibold text-[#1B2A4A] block mb-1.5">Bağlantı (Opsiyonel)</label>
                    <input
                      type="text"
                      value={notifForm.link}
                      onChange={e => setNotifForm(prev => ({ ...prev, link: e.target.value }))}
                      placeholder="/urun/whey-protein-2000gr"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                    />
                  </div>

                  {/* Kampanya Kodu (kampanya türü seçiliyse) */}
                  {notifForm.type === 'kampanya' && (
                    <div>
                      <label className="text-xs font-heading font-semibold text-[#1B2A4A] block mb-1.5">Kampanya Kodu</label>
                      <input
                        type="text"
                        value={notifForm.campaignCode}
                        onChange={e => setNotifForm(prev => ({ ...prev, campaignCode: e.target.value.toUpperCase() }))}
                        placeholder="INDIRIM20"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
                      />
                    </div>
                  )}

                  {/* Gönder */}
                  <button
                    onClick={handleSendNotification}
                    disabled={!notifForm.title.trim() || !notifForm.message.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-[#FF6B35] text-white py-3 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Bildirim Gönder
                  </button>
                </div>
              </div>

              {/* Bildirim Geçmişi */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <h2 className="font-heading font-bold text-sm text-[#1B2A4A] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Son Bildirimler
                  </h2>
                  <span className="text-xs text-gray-400">{notifications.length} bildirim</span>
                </div>
                <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Henüz bildirim yok</p>
                    </div>
                  ) : (
                    notifications.slice(0, 15).map(notif => (
                      <div key={notif.id} className={`p-3 hover:bg-gray-50 ${!notif.read ? 'bg-orange-50/20' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            notif.type === 'kampanya' ? 'bg-orange-100 text-[#FF6B35]' :
                            notif.type === 'stok_uyarisi' ? 'bg-emerald-100 text-emerald-600' :
                            notif.type === 'fiyat_dususu' ? 'bg-blue-100 text-blue-600' :
                            notif.type === 'siparis_durumu' ? 'bg-purple-100 text-purple-600' :
                            notif.type === 'genel_duyuru' ? 'bg-amber-100 text-amber-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {NOTIF_TYPE_OPTIONS.find(o => o.value === notif.type)?.label}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            notif.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                            notif.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {PRIORITY_OPTIONS.find(o => o.value === notif.priority)?.label}
                          </span>
                          {notif.adminCreated && <span className="text-[9px] bg-blue-50 text-blue-500 px-1 py-0.5 rounded font-medium">Admin</span>}
                          {!notif.read && <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full" />}
                        </div>
                        <p className="text-sm font-medium text-[#1B2A4A]">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(notif.timestamp).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Stok & Fiyat Uyarı Kayıtları */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stok Uyarı Kayıtları */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="font-heading font-bold text-sm text-[#1B2A4A] flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    Stok Uyarı Kayıtları ({stockAlerts.length})
                  </h2>
                </div>
                {stockAlerts.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">Henüz stok uyarı kaydı yok</div>
                ) : (
                  <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                    {stockAlerts.map(alert => (
                      <div key={alert.productId} className="flex items-center justify-between p-3 hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-[#1B2A4A]">{alert.productName}</p>
                          <p className="text-xs text-gray-400">{alert.email} • {new Date(alert.createdAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${alert.notified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {alert.notified ? 'Bildirildi' : 'Bekliyor'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fiyat Uyarı Kayıtları */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="font-heading font-bold text-sm text-[#1B2A4A] flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-blue-600" />
                    Fiyat Uyarı Kayıtları ({priceAlerts.length})
                  </h2>
                </div>
                {priceAlerts.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">Henüz fiyat uyarı kaydı yok</div>
                ) : (
                  <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                    {priceAlerts.map(alert => (
                      <div key={alert.productId} className="flex items-center justify-between p-3 hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-[#1B2A4A]">{alert.productName}</p>
                          <p className="text-xs text-gray-500">Mevcut: {alert.currentPrice} TL → Hedef: {alert.targetPrice} TL</p>
                          <p className="text-xs text-gray-400">{alert.email}</p>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${alert.notified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {alert.notified ? 'Bildirildi' : 'Bekliyor'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tür Dağılımı */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-heading font-bold text-sm text-[#1B2A4A]">Bildirim Türü Dağılımı</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {NOTIF_TYPE_OPTIONS.map(opt => (
                    <div key={opt.value} className="text-center p-3 bg-gray-50 rounded-lg">
                      <opt.icon className="w-5 h-5 text-[#FF6B35] mx-auto mb-1" />
                      <p className="font-heading font-bold text-lg text-[#1B2A4A]">{stats.byType[opt.value]}</p>
                      <p className="text-[10px] text-gray-500">{opt.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock */}
        {activeTab === 'stock' && (
          <div className="space-y-4">
            <h1 className="font-heading font-bold text-2xl text-[#1B2A4A]">Stok Yönetimi</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5"><p className="text-sm text-gray-500">Toplam Ürün</p><p className="font-heading font-bold text-3xl text-[#1B2A4A] mt-1">{products.length}</p></div>
              <div className="bg-white rounded-xl border border-gray-100 p-5"><p className="text-sm text-gray-500">Stokta Olan</p><p className="font-heading font-bold text-3xl text-green-600 mt-1">{products.filter(p => p.variants.some(v => v.stock > 0)).length}</p></div>
              <div className="bg-white rounded-xl border border-gray-100 p-5"><p className="text-sm text-gray-500">Stok Alarmı</p><p className="font-heading font-bold text-3xl text-red-500 mt-1">{products.filter(p => p.variants.every(v => v.stock <= 5)).length}</p></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-heading font-bold text-sm text-[#1B2A4A] mb-3">Düşük Stoklu Ürünler</h2>
              <div className="space-y-2">
                {products.filter(p => p.variants.some(v => v.stock <= 10 && v.stock > 0)).slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div className="flex items-center gap-3"><img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" /><span className="text-sm font-medium text-gray-700">{p.name}</span></div>
                    <span className="text-xs font-bold text-yellow-600">{Math.min(...p.variants.map(v => v.stock))} adet</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Shipping */}
        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <h1 className="font-heading font-bold text-2xl text-[#1B2A4A]">Kargo Takibi</h1>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50"><th className="text-left px-4 py-3 font-semibold text-gray-500">Sipariş</th><th className="text-left px-4 py-3 font-semibold text-gray-500">Kargo Firması</th><th className="text-left px-4 py-3 font-semibold text-gray-500">Takip No</th><th className="text-left px-4 py-3 font-semibold text-gray-500">Durum</th></tr></thead>
                <tbody>
                  {[{ order: 'PM10002', carrier: 'Yurtiçi Kargo', tracking: 'YK123456789', status: 'Yolda' },{ order: 'PM10003', carrier: 'Aras Kargo', tracking: 'AR987654321', status: 'Teslim Edildi' }].map((item, i) => (
                    <tr key={i} className="border-b border-gray-50"><td className="px-4 py-3 font-mono font-semibold">#{item.order}</td><td className="px-4 py-3 text-gray-600">{item.carrier}</td><td className="px-4 py-3 font-mono text-gray-500">{item.tracking}</td><td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.status === 'Teslim Edildi' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{item.status}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* XML/Excel */}
        {activeTab === 'xml' && (
          <div className="space-y-4">
            <h1 className="font-heading font-bold text-2xl text-[#1B2A4A]">XML / Excel Entegrasyonu</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-heading font-bold text-sm text-[#1B2A4A] mb-3">Toplu Ürün Yükleme</h3>
                <p className="text-sm text-gray-500 mb-4">Excel veya XML dosyası ile toplu ürün ekleyin veya güncelleyin.</p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#FF6B35] transition-colors cursor-pointer">
                  <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-300 mb-2" /><p className="text-sm text-gray-500">Dosyayı sürükleyin veya tıklayın</p><p className="text-xs text-gray-400 mt-1">.xlsx, .csv, .xml formatları desteklenir</p>
                </div>
                <button className="w-full mt-3 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm font-heading font-semibold hover:bg-[#2a3d5c]">Örnek Şablon İndir</button>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-heading font-bold text-sm text-[#1B2A4A] mb-3">Ürün Dışa Aktarma</h3>
                <p className="text-sm text-gray-500 mb-4">Mevcut ürünlerinizi Excel veya XML formatında dışa aktarın.</p>
                <div className="space-y-2">
                  <button className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"><FileSpreadsheet className="w-4 h-4 text-green-600" /> Excel (.xlsx)</button>
                  <button className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"><FileSpreadsheet className="w-4 h-4 text-blue-600" /> XML (.xml)</button>
                  <button className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"><FileSpreadsheet className="w-4 h-4 text-orange-600" /> CSV (.csv)</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customers */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <h1 className="font-heading font-bold text-2xl text-[#1B2A4A]">Müşteriler</h1>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50"><th className="text-left px-4 py-3 font-semibold text-gray-500">Müşteri</th><th className="text-left px-4 py-3 font-semibold text-gray-500">E-posta</th><th className="text-left px-4 py-3 font-semibold text-gray-500">Sipariş</th><th className="text-left px-4 py-3 font-semibold text-gray-500">Toplam</th><th className="text-left px-4 py-3 font-semibold text-gray-500">Puan</th></tr></thead>
                <tbody>
                  {[{ name: 'Ahmet Yılmaz', email: 'ahmet@mail.com', orders: 12, total: 15400, points: 1250 },{ name: 'Elif Demir', email: 'elif@mail.com', orders: 8, total: 9800, points: 850 },{ name: 'Mehmet Kaya', email: 'mehmet@mail.com', orders: 5, total: 6200, points: 520 }].map((customer, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50"><td className="px-4 py-3 font-medium text-[#1B2A4A]">{customer.name}</td><td className="px-4 py-3 text-gray-500">{customer.email}</td><td className="px-4 py-3">{customer.orders}</td><td className="px-4 py-3 font-semibold">{customer.total.toLocaleString('tr-TR')} TL</td><td className="px-4 py-3"><span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{customer.points} MP</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h1 className="font-heading font-bold text-2xl text-[#1B2A4A]">Ayarlar</h1>
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <div><label className="text-sm font-heading font-semibold text-[#1B2A4A] block mb-1">Mağaza Adı</label><input type="text" defaultValue="ProteinMarket" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="text-sm font-heading font-semibold text-[#1B2A4A] block mb-1">WhatsApp Numarası</label><input type="text" defaultValue="+905001234567" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="text-sm font-heading font-semibold text-[#1B2A4A] block mb-1">Ücretsiz Kargo Limiti (TL)</label><input type="number" defaultValue={300} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="text-sm font-heading font-semibold text-[#1B2A4A] block mb-1">Kargo Sayacı Saat (Kesim Saati)</label><input type="time" defaultValue="16:00" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" /></div>
              <button className="bg-[#FF6B35] text-white px-6 py-2.5 rounded-lg text-sm font-heading font-semibold hover:bg-orange-600">Kaydet</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
