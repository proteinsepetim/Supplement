/*
 * NotificationsPage - Tüm Bildirimleri Görüntüleme Sayfası
 * Filtre, arama, toplu okundu/silme, bildirim detayları
 */
import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import {
  Bell, Package, TrendingDown, Tag, Truck, Megaphone, Settings,
  ChevronRight, Search, Trash2, Check, CheckCheck, X, Filter, ArrowLeft
} from 'lucide-react';
import { useNotifications, type NotificationType, type Notification } from '@/contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Bell; label: string; color: string; bgColor: string }> = {
  stok_uyarisi: { icon: Package, label: 'Stok Uyarısı', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  fiyat_dususu: { icon: TrendingDown, label: 'Fiyat Düşüşü', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  kampanya: { icon: Tag, label: 'Kampanya', color: 'text-[#FF6B35]', bgColor: 'bg-orange-50' },
  siparis_durumu: { icon: Truck, label: 'Sipariş Durumu', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  genel_duyuru: { icon: Megaphone, label: 'Genel Duyuru', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  sistem: { icon: Settings, label: 'Sistem', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

const PRIORITY_BADGE: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Acil', color: 'bg-red-100 text-red-700' },
  high: { label: 'Yüksek', color: 'bg-orange-100 text-orange-700' },
  medium: { label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  low: { label: 'Düşük', color: 'bg-gray-100 text-gray-500' },
};

export default function NotificationsPage() {
  const {
    notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications, deleteNotification
  } = useNotifications();

  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = notifications;
    if (filterType !== 'all') result = result.filter(n => n.type === filterType);
    if (filterRead === 'unread') result = result.filter(n => !n.read);
    if (filterRead === 'read') result = result.filter(n => n.read);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
      );
    }
    return result;
  }, [notifications, filterType, filterRead, searchQuery]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(n => n.id)));
    }
  };

  const bulkMarkRead = () => {
    selectedIds.forEach(id => markAsRead(id));
    setSelectedIds(new Set());
  };

  const bulkDelete = () => {
    selectedIds.forEach(id => deleteNotification(id));
    setSelectedIds(new Set());
  };

  const formatTime = (ts: Date) => {
    const d = new Date(ts);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const relativeTime = (ts: Date) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return 'Az önce';
    if (diffMin < 60) return `${diffMin} dk önce`;
    if (diffHr < 24) return `${diffHr} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  // Bildirimleri tarihe göre grupla
  const grouped = useMemo(() => {
    const groups: { label: string; items: Notification[] }[] = [];
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

    const todayItems: Notification[] = [];
    const yesterdayItems: Notification[] = [];
    const olderItems: Notification[] = [];

    filtered.forEach(n => {
      const d = new Date(n.timestamp);
      if (d.toDateString() === today.toDateString()) todayItems.push(n);
      else if (d.toDateString() === yesterday.toDateString()) yesterdayItems.push(n);
      else olderItems.push(n);
    });

    if (todayItems.length) groups.push({ label: 'Bugün', items: todayItems });
    if (yesterdayItems.length) groups.push({ label: 'Dün', items: yesterdayItems });
    if (olderItems.length) groups.push({ label: 'Daha Eski', items: olderItems });

    return groups;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#FF6B35]">Anasayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1B2A4A] font-medium">Bildirimler</span>
          </nav>
        </div>
      </div>

      <div className="container py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading font-bold text-2xl text-[#1B2A4A] flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#FF6B35]" />
              Bildirimler
              {unreadCount > 0 && (
                <span className="bg-[#FF6B35] text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} okunmamış</span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Stok uyarıları, fiyat düşüşleri, kampanyalar ve sipariş durumlarınız</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#1B2A4A] hover:bg-gray-50">
                <CheckCheck className="w-3.5 h-3.5" /> Tümünü Okundu İşaretle
              </button>
            )}
            <Link href="/bildirim-tercihleri" className="flex items-center gap-1.5 px-3 py-2 bg-[#FF6B35] text-white rounded-lg text-xs font-heading font-semibold hover:bg-orange-600">
              <Settings className="w-3.5 h-3.5" /> Bildirim Ayarları
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Bildirimlerde ara..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] outline-none"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              <button
                onClick={() => setFilterType('all')}
                className={`text-xs px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterType === 'all' ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tümü ({notifications.length})
              </button>
              {(Object.keys(TYPE_CONFIG) as NotificationType[]).map(type => {
                const cfg = TYPE_CONFIG[type];
                const count = notifications.filter(n => n.type === type).length;
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`text-xs px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                      filterType === type ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <cfg.icon className="w-3 h-3" /> {cfg.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Read Filter + Bulk Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-2">
              {['all', 'unread', 'read'].map(v => (
                <button
                  key={v}
                  onClick={() => setFilterRead(v as any)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                    filterRead === v ? 'bg-[#1B2A4A] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {v === 'all' ? 'Tümü' : v === 'unread' ? 'Okunmamış' : 'Okunmuş'}
                </button>
              ))}
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{selectedIds.size} seçili</span>
                <button onClick={bulkMarkRead} className="text-xs text-blue-600 hover:underline font-medium">Okundu İşaretle</button>
                <button onClick={bulkDelete} className="text-xs text-red-500 hover:underline font-medium">Sil</button>
              </div>
            )}
          </div>
        </div>

        {/* Notification List */}
        {grouped.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="font-heading font-bold text-lg text-[#1B2A4A] mb-2">Bildirim Bulunamadı</h2>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Arama kriterlerinize uygun bildirim bulunamadı.' : 'Henüz bildiriminiz yok. Yeni bildirimler burada görünecek.'}
            </p>
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.label} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading font-bold text-xs text-gray-400 uppercase tracking-wider">{group.label}</h3>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {group.items.map(notif => {
                  const cfg = TYPE_CONFIG[notif.type];
                  const Icon = cfg.icon;
                  const priorityBadge = PRIORITY_BADGE[notif.priority];
                  const isSelected = selectedIds.has(notif.id);

                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start gap-3 p-4 transition-colors group ${!notif.read ? 'bg-orange-50/20' : 'hover:bg-gray-50'} ${isSelected ? 'bg-blue-50/30' : ''}`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelect(notif.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-1 transition-colors ${
                          isSelected ? 'bg-[#FF6B35] border-[#FF6B35] text-white' : 'border-gray-300 hover:border-[#FF6B35]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>

                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bgColor}`}>
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-heading font-semibold ${!notif.read ? 'text-[#1B2A4A]' : 'text-gray-600'}`}>
                            {notif.title}
                          </span>
                          {!notif.read && <span className="w-2 h-2 bg-[#FF6B35] rounded-full" />}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityBadge.color}`}>
                            {priorityBadge.label}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cfg.bgColor} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          {notif.adminCreated && (
                            <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full font-medium">Admin</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{notif.message}</p>

                        {/* Meta */}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {notif.meta?.campaignCode && (
                            <span className="text-[11px] font-mono bg-orange-100 text-[#FF6B35] px-2 py-0.5 rounded font-bold">
                              Kod: {notif.meta.campaignCode}
                            </span>
                          )}
                          {notif.meta?.oldPrice && notif.meta?.newPrice && (
                            <span className="text-[11px] font-semibold text-green-600">
                              <span className="line-through text-gray-400">{notif.meta.oldPrice} TL</span> → {notif.meta.newPrice} TL
                              {notif.meta.discount && <span className="ml-1 text-[#FF6B35]">(%{notif.meta.discount})</span>}
                            </span>
                          )}
                          {notif.meta?.orderId && (
                            <span className="text-[11px] font-mono bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                              #{notif.meta.orderId}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400">{relativeTime(notif.timestamp)}</span>
                        </div>

                        {/* Actions */}
                        {notif.link && (
                          <Link href={notif.link} onClick={() => markAsRead(notif.id)}
                            className="inline-flex items-center gap-1 mt-2 text-xs text-[#FF6B35] font-semibold hover:underline">
                            Detayı Gör <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      {/* Right actions */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatTime(notif.timestamp).split(',')[0]}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notif.read && (
                            <button onClick={() => markAsRead(notif.id)} className="p-1 text-gray-400 hover:text-blue-500 rounded" title="Okundu işaretle">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => deleteNotification(notif.id)} className="p-1 text-gray-400 hover:text-red-500 rounded" title="Sil">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
