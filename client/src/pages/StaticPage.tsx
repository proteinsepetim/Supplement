/*
 * StaticPage - Legal ve bilgi sayfaları
 * KVKK, Gizlilik Politikası, Mesafeli Satış Sözleşmesi, İade/Değişim,
 * Kargo/Teslimat, Hakkımızda, İletişim, SSS
 */
import { useParams } from 'wouter';
import { Link } from 'wouter';
import { ChevronRight, Phone, Mail, MapPin, Clock, MessageCircle, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  q: string;
  a: string;
}

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
            <span className="font-heading font-semibold text-sm text-[#1B2A4A] pr-4">{item.q}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const PAGES: Record<string, { title: string; content: React.ReactNode }> = {
  'hakkimizda': {
    title: 'Hakkımızda',
    content: (
      <div className="prose prose-sm max-w-none">
        <p>ProteinMarket, sporcu gıdaları ve takviye ürünleri alanında hizmet veren bir e-ticaret platformudur. Amacımız, sporcuların ve sağlıklı yaşam tutkunlarının ihtiyaç duyduğu ürünlere güvenilir ve uygun fiyatlarla ulaşmasını sağlamaktır.</p>
        <h3>Misyonumuz</h3>
        <p>Müşterilerimize orijinal, kaliteli ve uygun fiyatlı sporcu gıdaları sunarak sağlıklı yaşam hedeflerine ulaşmalarına destek olmak.</p>
        <h3>Vizyonumuz</h3>
        <p>Türkiye'nin sporcu gıdaları alanında referans e-ticaret platformu olmak ve müşteri memnuniyetinde sektör lideri konuma ulaşmak.</p>
        <h3>Değerlerimiz</h3>
        <ul>
          <li><strong>Orijinal Ürün Garantisi:</strong> Tüm ürünlerimiz yetkili distribütörlerden temin edilmektedir.</li>
          <li><strong>Müşteri Odaklılık:</strong> Müşteri memnuniyeti her zaman önceliğimizdir.</li>
          <li><strong>Şeffaflık:</strong> Ürün bilgileri, fiyatlandırma ve kampanyalarda tam şeffaflık ilkesiyle hareket ederiz.</li>
          <li><strong>Hızlı Teslimat:</strong> Siparişlerinizi en kısa sürede hazırlayıp kargoya veriyoruz.</li>
        </ul>
      </div>
    ),
  },
  'iletisim': {
    title: 'İletişim',
    content: (
      <div>
        <p className="text-gray-600 mb-8">Sorularınız, önerileriniz veya şikayetleriniz için aşağıdaki kanallardan bize ulaşabilirsiniz.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Phone, title: 'Telefon', info: '0500 123 45 67', desc: 'Hafta içi 09:00-18:00' },
            { icon: Mail, title: 'E-posta', info: 'info@proteinmarket.com', desc: '24 saat içinde yanıt' },
            { icon: MessageCircle, title: 'WhatsApp', info: '0500 123 45 67', desc: 'Hızlı destek' },
            { icon: MapPin, title: 'Adres', info: 'İstanbul, Türkiye', desc: 'Merkez ofis' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-5 text-center">
              <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <h3 className="font-heading font-bold text-sm text-[#1B2A4A] mb-1">{item.title}</h3>
              <p className="text-sm text-[#1B2A4A] font-medium">{item.info}</p>
              <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-heading font-bold text-lg text-[#1B2A4A] mb-1">Çalışma Saatleri</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <Clock className="w-4 h-4 text-[#FF6B35]" />
            <span>Pazartesi - Cuma: 09:00 - 18:00</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <Clock className="w-4 h-4 text-[#FF6B35]" />
            <span>Cumartesi: 10:00 - 15:00</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
            <Clock className="w-4 h-4 text-gray-300" />
            <span>Pazar: Kapalı</span>
          </div>
        </div>
      </div>
    ),
  },
  'kargo-teslimat': {
    title: 'Kargo ve Teslimat',
    content: (
      <div className="prose prose-sm max-w-none">
        <h3>Kargo Ücretleri</h3>
        <ul>
          <li>300 TL ve üzeri siparişlerde <strong>ücretsiz kargo</strong>.</li>
          <li>300 TL altı siparişlerde standart kargo ücreti 29,90 TL'dir.</li>
          <li>Hızlı kargo seçeneği (1-2 iş günü) 49,90 TL'dir.</li>
        </ul>
        <h3>Teslimat Süreleri</h3>
        <ul>
          <li><strong>Standart Kargo:</strong> 2-3 iş günü</li>
          <li><strong>Hızlı Kargo:</strong> 1-2 iş günü</li>
        </ul>
        <p>Hafta içi saat 16:00'a kadar verilen siparişler aynı gün kargoya verilir. Hafta sonu verilen siparişler Pazartesi günü kargoya verilir.</p>
        <h3>Kargo Takibi</h3>
        <p>Siparişiniz kargoya verildiğinde, kargo takip numarası e-posta ve SMS ile tarafınıza iletilir. Bu numara ile kargo firmasının web sitesinden gönderinizi takip edebilirsiniz.</p>
        <h3>Teslimat Adresi</h3>
        <p>Teslimat, sipariş sırasında belirttiğiniz adrese yapılır. Adres değişikliği talepleri, sipariş kargoya verilmeden önce müşteri hizmetlerimize bildirilerek yapılabilir.</p>
      </div>
    ),
  },
  'iade-degisim': {
    title: 'İade ve Değişim',
    content: (
      <div className="prose prose-sm max-w-none">
        <h3>İade Koşulları</h3>
        <p>Tüketicinin Korunması Hakkında Kanun kapsamında, ürünü teslim aldığınız tarihten itibaren <strong>14 gün</strong> içinde herhangi bir gerekçe göstermeksizin cayma hakkınızı kullanabilirsiniz.</p>
        <h3>İade Edilemeyecek Ürünler</h3>
        <ul>
          <li>Ambalajı açılmış gıda takviyeleri (hijyen ve sağlık nedeniyle)</li>
          <li>Kullanılmış veya hasar görmüş ürünler</li>
          <li>Ambalajı açılmış kişisel bakım ürünleri</li>
        </ul>
        <h3>İade Süreci</h3>
        <ol>
          <li>Müşteri hizmetlerimize (info@proteinmarket.com veya 0500 123 45 67) iade talebinizi bildirin.</li>
          <li>İade onayı aldıktan sonra ürünü orijinal ambalajında kargoya verin.</li>
          <li>Ürün tarafımıza ulaştıktan sonra kontrol edilir.</li>
          <li>Onay sonrası ödeme tutarı 5-10 iş günü içinde iade edilir.</li>
        </ol>
        <h3>Değişim</h3>
        <p>Yanlış veya hasarlı ürün teslim alındığında, ürün ücretsiz olarak değiştirilir. Değişim taleplerinizi müşteri hizmetlerimize bildirmeniz yeterlidir.</p>
        <h3>Kargo Ücreti</h3>
        <p>Cayma hakkı kapsamındaki iadelerde kargo ücreti alıcıya aittir. Hatalı/hasarlı ürün iadelerinde kargo ücreti tarafımızca karşılanır.</p>
      </div>
    ),
  },
  'gizlilik-politikasi': {
    title: 'Gizlilik Politikası',
    content: (
      <div className="prose prose-sm max-w-none">
        <p>ProteinMarket olarak kişisel verilerinizin güvenliği konusunda azami hassasiyet göstermekteyiz. Bu gizlilik politikası, web sitemizi kullanırken toplanan bilgilerin nasıl işlendiğini açıklamaktadır.</p>
        <h3>Toplanan Bilgiler</h3>
        <p>Web sitemizi ziyaret ettiğinizde ve alışveriş yaptığınızda aşağıdaki bilgiler toplanabilir:</p>
        <ul>
          <li>Ad, soyad, e-posta adresi, telefon numarası</li>
          <li>Teslimat ve fatura adresi</li>
          <li>Sipariş geçmişi ve ürün tercihleri</li>
          <li>IP adresi, tarayıcı bilgileri, çerez verileri</li>
        </ul>
        <h3>Bilgilerin Kullanımı</h3>
        <p>Toplanan bilgiler aşağıdaki amaçlarla kullanılır:</p>
        <ul>
          <li>Siparişlerinizin işlenmesi ve teslimatı</li>
          <li>Müşteri hizmetleri desteği sağlanması</li>
          <li>Kampanya ve fırsat bildirimlerinin gönderilmesi (onayınız dahilinde)</li>
          <li>Web sitesi deneyiminin iyileştirilmesi</li>
        </ul>
        <h3>Bilgi Güvenliği</h3>
        <p>Kişisel verileriniz 256-bit SSL şifreleme ile korunmaktadır. Ödeme bilgileriniz tarafımızca saklanmaz; ödeme işlemleri güvenli ödeme altyapıları üzerinden gerçekleştirilir.</p>
        <h3>Üçüncü Taraflarla Paylaşım</h3>
        <p>Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz. Kargo firmaları ile yalnızca teslimat için gerekli bilgiler paylaşılır.</p>
        <h3>Çerezler</h3>
        <p>Web sitemiz, kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanmaktadır. Tarayıcı ayarlarınızdan çerez tercihlerinizi yönetebilirsiniz.</p>
        <h3>İletişim</h3>
        <p>Gizlilik politikamız hakkında sorularınız için info@proteinmarket.com adresinden bize ulaşabilirsiniz.</p>
      </div>
    ),
  },
  'kvkk': {
    title: 'KVKK Aydınlatma Metni',
    content: (
      <div className="prose prose-sm max-w-none">
        <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, ProteinMarket olarak veri sorumlusu sıfatıyla kişisel verilerinizin işlenmesine ilişkin aşağıdaki hususları bilgilerinize sunarız.</p>
        <h3>Veri Sorumlusu</h3>
        <p>ProteinMarket<br />İstanbul, Türkiye<br />info@proteinmarket.com</p>
        <h3>İşlenen Kişisel Veriler</h3>
        <ul>
          <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
          <li><strong>İletişim Bilgileri:</strong> E-posta, telefon, adres</li>
          <li><strong>Müşteri İşlem Bilgileri:</strong> Sipariş geçmişi, ödeme bilgileri</li>
          <li><strong>Dijital İz Bilgileri:</strong> IP adresi, çerez verileri, oturum bilgileri</li>
        </ul>
        <h3>İşleme Amaçları</h3>
        <ul>
          <li>Sözleşmenin kurulması ve ifası (sipariş işleme, teslimat)</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          <li>Müşteri ilişkileri yönetimi</li>
          <li>Pazarlama faaliyetleri (açık rızanız dahilinde)</li>
        </ul>
        <h3>Veri Aktarımı</h3>
        <p>Kişisel verileriniz, kargo firmaları (teslimat amacıyla) ve ödeme kuruluşları (ödeme işleme amacıyla) ile paylaşılabilir.</p>
        <h3>Haklarınız</h3>
        <p>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
        <ul>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
          <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini isteme</li>
        </ul>
        <p>Başvurularınızı info@proteinmarket.com adresine iletebilirsiniz.</p>
      </div>
    ),
  },
  'mesafeli-satis': {
    title: 'Mesafeli Satış Sözleşmesi',
    content: (
      <div className="prose prose-sm max-w-none">
        <h3>Madde 1 - Taraflar</h3>
        <p><strong>Satıcı:</strong> ProteinMarket, İstanbul, Türkiye<br />
        E-posta: info@proteinmarket.com | Telefon: 0500 123 45 67</p>
        <p><strong>Alıcı:</strong> Sipariş formunda bilgileri yer alan kişi.</p>
        <h3>Madde 2 - Konu</h3>
        <p>İşbu sözleşmenin konusu, Alıcı'nın Satıcı'ya ait web sitesinden elektronik ortamda siparişini verdiği ürünlerin satışı ve teslimatına ilişkin 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.</p>
        <h3>Madde 3 - Sözleşme Konusu Ürün</h3>
        <p>Ürünün cinsi, miktarı, marka/modeli, rengi, adedi, satış bedeli, ödeme şekli sipariş sayfasında belirtildiği gibidir.</p>
        <h3>Madde 4 - Genel Hükümler</h3>
        <p>Alıcı, sipariş konusu ürünün temel nitelikleri, satış fiyatı, ödeme şekli ve teslimata ilişkin bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli onayı verdiğini kabul eder.</p>
        <h3>Madde 5 - Teslimat</h3>
        <p>Ürünler, sipariş tarihinden itibaren en geç 30 gün içinde teslim edilir. Ürün, Alıcı'nın sipariş formunda belirttiği adrese teslim edilecektir.</p>
        <h3>Madde 6 - Cayma Hakkı</h3>
        <p>Alıcı, ürünü teslim aldığı tarihten itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkının kullanılması için bu süre içinde Satıcı'ya yazılı bildirimde bulunulması gerekmektedir.</p>
        <h3>Madde 7 - Cayma Hakkı Kullanılamayacak Ürünler</h3>
        <ul>
          <li>Ambalajı açılmış gıda takviyeleri</li>
          <li>Tüketici'nin istekleri doğrultusunda hazırlanan ürünler</li>
          <li>Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler</li>
        </ul>
        <h3>Madde 8 - Yetkili Mahkeme</h3>
        <p>İşbu sözleşmeden doğan uyuşmazlıklarda Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.</p>
      </div>
    ),
  },
  'sss': {
    title: 'Sıkça Sorulan Sorular',
    content: (
      <div>
        <p className="text-gray-600 mb-6">En çok merak edilen sorular ve yanıtları aşağıda yer almaktadır.</p>
        <FAQAccordion items={[
          { q: 'Ürünleriniz orijinal mi?', a: 'Evet, tüm ürünlerimiz yetkili distribütörlerden temin edilmektedir. Orijinal ürün garantisi sunuyoruz.' },
          { q: 'Kargo ücreti ne kadar?', a: '300 TL ve üzeri siparişlerde kargo ücretsizdir. 300 TL altı siparişlerde standart kargo ücreti 29,90 TL\'dir.' },
          { q: 'Siparişim ne zaman kargoya verilir?', a: 'Hafta içi saat 16:00\'a kadar verilen siparişler aynı gün kargoya verilir. Hafta sonu verilen siparişler Pazartesi günü işleme alınır.' },
          { q: 'İade yapabilir miyim?', a: 'Ürünü teslim aldığınız tarihten itibaren 14 gün içinde cayma hakkınızı kullanabilirsiniz. Ambalajı açılmış gıda takviyeleri iade edilemez.' },
          { q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?', a: 'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerimiz mevcuttur.' },
          { q: 'Ürünlerin son kullanma tarihi ne zaman?', a: 'Tüm ürünlerimizin son kullanma tarihi ürün sayfasında belirtilmektedir. Minimum 6 ay SKT garantisi sunuyoruz.' },
          { q: 'Kupon kodu nasıl kullanılır?', a: 'Sepet sayfasında "İndirim Kodu" alanına kupon kodunuzu girerek "Uygula" butonuna tıklayabilirsiniz.' },
          { q: 'Toplu sipariş verebilir miyim?', a: 'Toplu sipariş talepleriniz için info@proteinmarket.com adresinden veya WhatsApp üzerinden bizimle iletişime geçebilirsiniz.' },
          { q: 'Ürünler nasıl saklanmalı?', a: 'Ürünlerin saklama koşulları ambalaj üzerinde belirtilmektedir. Genel olarak serin ve kuru bir yerde, doğrudan güneş ışığından uzak tutulmalıdır.' },
          { q: 'Sipariş takibi nasıl yapılır?', a: 'Siparişiniz kargoya verildiğinde kargo takip numarası e-posta ile tarafınıza iletilir. Bu numara ile kargo firmasının web sitesinden takip yapabilirsiniz.' },
        ]} />
      </div>
    ),
  },
};

export default function StaticPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || '';
  const page = PAGES[slug];

  if (!page) {
    return (
      <div className="container py-20 text-center">
        <HelpCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h1 className="font-heading font-bold text-2xl text-[#1B2A4A] mb-2">Sayfa Bulunamadı</h1>
        <p className="text-gray-500 mb-6">Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.</p>
        <Link href="/" className="text-[#FF6B35] font-semibold hover:underline">Anasayfaya Dön</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#FF6B35]">Anasayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1B2A4A] font-medium">{page.title}</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-[#1B2A4A] mb-6">{page.title}</h1>
          <div className="text-gray-700 leading-relaxed">
            {page.content}
          </div>
        </div>
      </div>
    </div>
  );
}
