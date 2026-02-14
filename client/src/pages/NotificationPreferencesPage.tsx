/*
 * NotificationPreferencesPage - Bildirim Tercihleri
 * Kullanıcı bazlı bildirim türlerini açma/kapama, push notification, ses, e-posta
 * Stok ve fiyat alert listesi yönetimi
 */
import { useState } from 'react';
import { Link } from 'wouter';
import {
  Bell, Package, TrendingDown, Tag, Truck, Megaphone, Settings,
  ChevronRight, Volume2, VolumeX, Mail, Smartphone, Trash2, X,
  Shield, BellRing, BellOff, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useNotifications, type NotificationType } from '@/contexts/NotificationContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const NOTIFICATION_TYPES: { type: NotificationType; icon: typeof Bell; label: string; description: string }[] = [
  { type: 'stok_uyarisi', icon: Package, label: 'Stok Uyarıları', description: 'Takip ettiğiniz ürünler stoğa girdiğinde bildirim alın' },
  { type: 'fiyat_dususu', icon: TrendingDown, label: 'Fiyat Düşüşleri', description: 'İzlediğiniz ürünlerin fiyatı düştüğünde haberdar olun' },
  { type: 'kampanya', icon: Tag, label: 'Kampanyalar & İndirimler', description: 'Yeni kampanyalar, kupon kodları ve özel teklifler' },
  { type: 'siparis_durumu', icon: Truck, label: 'Sipariş Durumu', description: 'Siparişlerinizin hazırlanma, kargo ve teslimat bildirimleri' },
  { type: 'genel_duyuru', icon: Megaphone, label: 'Genel Duyurular', description: 'Mağaza duyuruları, yeni ürünler ve güncellemeler' },
  { type: 'sistem', icon: Settings, label: 'Sistem Bildirimleri', description: 'Hesap güvenliği, şifre değişikliği ve teknik bildirimler' },
];

function ToggleSwitch({ enabled, onChange, label }: { enabled: boolean; onChange: () => void; label?: string }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-[#FF6B35]' : 'bg-gray-300'}`}
      aria-label={label}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
        animate={{ left: enabled ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export default function NotificationPreferencesPage() {
  const {
    preferences, updatePreference,
    pushPermission, requestPushPermission,
    stockAlerts, removeStockAlert,
    priceAlerts, removePriceAlert,
    getStats,
  } = useNotifications();

  const stats = getStats();
  const [activeSection, setActiveSection] = useState<'types' | 'channels' | 'alerts' | 'stats'>('types');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#FF6B35]">Anasayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/bildirimler" className="hover:text-[#FF6B35]">Bildirimler</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1B2A4A] font-medium">Bildirim Tercihleri</span>
          </nav>
        </div>
      </div>

      <div className="container py-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl text-[#1B2A4A] flex items-center gap-2">
              <Settings className="w-6 h-6 text-[#FF6B35]" />
              Bildirim Tercihleri
            </h1>
            <p className="text-sm text-gray-500 mt-1">Hangi bildirimleri almak istediğinizi ve nasıl almak istediğinizi yönetin.</p>
          </div>

          {/* Section Tabs */}
          <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
            {[
              { id: 'types' as const, label: 'Bildirim Türleri', icon: Bell },
              { id: 'channels' as const, label: 'Bildirim Kanalları', icon: Smartphone },
              { id: 'alerts' as const, label: 'Uyarı Listem', icon: BellRing },
              { id: 'stats' as const, label: 'İstatistikler', icon: Shield },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-heading font-semibold whitespace-nowrap transition-colors ${
                  activeSection === tab.id
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Bildirim Türleri */}
          {activeSection === 'types' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-heading font-bold text-sm text-[#1B2A4A]">Bildirim Türleri</h2>
                <p className="text-xs text-gray-500 mt-0.5">Her bildirim türünü ayrı ayrı açıp kapatabilirsiniz.</p>
              </div>
              <div className="divide-y divide-gray-50">
                {NOTIFICATION_TYPES.map(({ type, icon: Icon, label, description }) => (
                  <div key={type} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#FF6B35]" />
                      </div>
                      <div>
                        <p className="text-sm font-heading font-semibold text-[#1B2A4A]">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={preferences[type]}
                      onChange={() => updatePreference(type, !preferences[type])}
                      label={label}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bildirim Kanalları */}
          {activeSection === 'channels' && (
            <div className="space-y-4">
              {/* Push Notification */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="font-heading font-bold text-sm text-[#1B2A4A]">Push Bildirimleri (Tarayıcı)</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Tarayıcınız üzerinden anlık bildirim alın.</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-heading font-semibold text-[#1B2A4A]">Push Bildirimler</p>
                        <p className="text-xs text-gray-500">
                          Durum: {pushPermission === 'granted' ? (
                            <span className="text-green-600 font-medium">Aktif</span>
                          ) : pushPermission === 'denied' ? (
                            <span className="text-red-500 font-medium">Reddedildi</span>
                          ) : pushPermission === 'unsupported' ? (
                            <span className="text-gray-400 font-medium">Desteklenmiyor</span>
                          ) : (
                            <span className="text-amber-500 font-medium">İzin Bekleniyor</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {pushPermission === 'granted' ? (
                      <ToggleSwitch
                        enabled={preferences.pushEnabled}
                        onChange={() => updatePreference('pushEnabled', !preferences.pushEnabled)}
                        label="Push Bildirimler"
                      />
                    ) : pushPermission !== 'denied' && pushPermission !== 'unsupported' ? (
                      <button
                        onClick={requestPushPermission}
                        className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg text-xs font-heading font-semibold hover:bg-orange-600"
                      >
                        İzin Ver
                      </button>
                    ) : null}
                  </div>

                  {pushPermission === 'denied' && (
                    <div className="bg-red-50 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-red-700 font-medium">Push bildirim izni reddedildi</p>
                        <p className="text-xs text-red-600 mt-0.5">Tarayıcı ayarlarınızdan bu site için bildirim iznini yeniden etkinleştirmeniz gerekiyor.</p>
                      </div>
                    </div>
                  )}

                  {pushPermission === 'unsupported' && (
                    <div className="bg-amber-50 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">Tarayıcınız push bildirimleri desteklemiyor. Güncel bir tarayıcı kullanmayı deneyin.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* E-posta */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-heading font-semibold text-[#1B2A4A]">E-posta Bildirimleri</p>
                      <p className="text-xs text-gray-500">Stok uyarıları ve fiyat düşüşleri e-posta ile gönderilir</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={preferences.emailEnabled}
                    onChange={() => updatePreference('emailEnabled', !preferences.emailEnabled)}
                    label="E-posta Bildirimleri"
                  />
                </div>
              </div>

              {/* Ses */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      {preferences.soundEnabled ? <Volume2 className="w-5 h-5 text-purple-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-heading font-semibold text-[#1B2A4A]">Bildirim Sesi</p>
                      <p className="text-xs text-gray-500">Yeni bildirim geldiğinde ses çalsın</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={preferences.soundEnabled}
                    onChange={() => updatePreference('soundEnabled', !preferences.soundEnabled)}
                    label="Bildirim Sesi"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Uyarı Listem */}
          {activeSection === 'alerts' && (
            <div className="space-y-4">
              {/* Stok Uyarıları */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div>
                    <h2 className="font-heading font-bold text-sm text-[#1B2A4A]">Stok Uyarılarım</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Stoğa girdiğinde bildirim alacağınız ürünler</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{stockAlerts.length} ürün</span>
                </div>
                {stockAlerts.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Henüz stok uyarısı eklemediniz</p>
                    <p className="text-xs mt-1">Stokta olmayan ürün sayfalarından "Stok Gelince Haber Ver" butonuna tıklayarak ekleyebilirsiniz.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {stockAlerts.map(alert => (
                      <div key={alert.productId} className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-[#1B2A4A]">{alert.productName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{alert.email} • {new Date(alert.createdAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <button onClick={() => removeStockAlert(alert.productId)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fiyat Uyarıları */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div>
                    <h2 className="font-heading font-bold text-sm text-[#1B2A4A]">Fiyat Uyarılarım</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Hedef fiyata düştüğünde bildirim alacağınız ürünler</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{priceAlerts.length} ürün</span>
                </div>
                {priceAlerts.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <TrendingDown className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Henüz fiyat uyarısı eklemediniz</p>
                    <p className="text-xs mt-1">Ürün sayfalarından "Fiyat Düşünce Haber Ver" butonuna tıklayarak ekleyebilirsiniz.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {priceAlerts.map(alert => (
                      <div key={alert.productId} className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-[#1B2A4A]">{alert.productName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Mevcut: <span className="font-semibold">{alert.currentPrice} TL</span> → Hedef: <span className="font-semibold text-green-600">{alert.targetPrice} TL</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{alert.email} • {new Date(alert.createdAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <button onClick={() => removePriceAlert(alert.productId)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* İstatistikler */}
          {activeSection === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <p className="font-heading font-bold text-2xl text-[#1B2A4A]">{stats.total}</p>
                  <p className="text-xs text-gray-500 mt-1">Toplam Bildirim</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <p className="font-heading font-bold text-2xl text-[#FF6B35]">{stats.unread}</p>
                  <p className="text-xs text-gray-500 mt-1">Okunmamış</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <p className="font-heading font-bold text-2xl text-blue-600">{stats.lastWeek}</p>
                  <p className="text-xs text-gray-500 mt-1">Son 7 Gün</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <p className="font-heading font-bold text-2xl text-emerald-600">
                    {stats.pushPermission === 'granted' ? 'Aktif' : 'Pasif'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Push Durum</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="font-heading font-bold text-sm text-[#1B2A4A]">Türe Göre Dağılım</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {NOTIFICATION_TYPES.map(({ type, icon: Icon, label }) => (
                    <div key={type} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#FF6B35]" />
                        <span className="text-sm text-gray-700">{label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-[#FF6B35] h-2 rounded-full transition-all"
                            style={{ width: `${stats.total > 0 ? (stats.byType[type] / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-[#1B2A4A] w-6 text-right">{stats.byType[type]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
