export type SolutionDetailContent = {
  slug: string
  title: string
  description: string
  enabled: boolean
  seoTitle: string
  seoDescription: string
  hero: {
    eyebrow: string
    title: string
    description: string
    image: string
    imageAlt: string
    primaryCta: { text: string; to: string }
    secondaryCta: { text: string; to: string }
  }
  audience: {
    title: string
    subtitle: string
    items: Array<{ icon: string; title: string; description: string }>
  }
  benefits: {
    title: string
    subtitle: string
    items: Array<{ icon: string; title: string; description: string }>
  }
  modules: {
    title: string
    subtitle: string
    items: Array<{ icon: string; title: string; description: string; gradient: string }>
  }
  implementation: {
    title: string
    description: string
    bullets: string[]
    flowSteps: string[]
  }
  related: {
    title: string
    links: Array<{ label: string; href: string; description: string }>
  }
  cta: {
    title: string
    description: string
    buttonText: string
    buttonTo: string
    secondaryButtonText: string
    secondaryButtonTo: string
  }
}

const defaultCta = {
  title: 'Projeniz için görüşelim',
  description: 'İhtiyacınıza uygun çözüm mimarisini birlikte planlayalım.',
  buttonText: 'İletişime Geç',
  buttonTo: '/iletisim',
  secondaryButtonText: 'Tüm Çözümler',
  secondaryButtonTo: '/cozumler',
}

function solution(
  slug: string,
  title: string,
  description: string,
  seoDescription: string,
  partial: Partial<Omit<SolutionDetailContent, 'slug' | 'title' | 'description' | 'seoTitle' | 'seoDescription' | 'enabled'>> & {
    modules: SolutionDetailContent['modules']
    audience?: SolutionDetailContent['audience']
    benefits?: SolutionDetailContent['benefits']
    implementation?: SolutionDetailContent['implementation']
    related?: SolutionDetailContent['related']
    hero?: Partial<SolutionDetailContent['hero']>
  },
): SolutionDetailContent {
  return {
    slug,
    title,
    description,
    enabled: true,
    seoTitle: `${title} | Woontegra Çözümler`,
    seoDescription,
    hero: {
      eyebrow: 'Çözüm',
      title,
      description,
      image: '/images/solutions-hero.jpg',
      imageAlt: `${title} — Woontegra`,
      primaryCta: { text: 'Projeniz için görüşelim', to: '/iletisim' },
      secondaryCta: { text: 'Tüm Çözümler', to: '/cozumler' },
      ...partial.hero,
    },
    audience: partial.audience ?? {
      title: 'Kimler için?',
      subtitle: 'Bu çözüm hangi işletmeler için uygundur?',
      items: [],
    },
    benefits: partial.benefits ?? {
      title: 'Ne sağlar?',
      subtitle: 'Operasyonel ve ticari kazanımlar',
      items: [],
    },
    modules: partial.modules,
    implementation: partial.implementation ?? {
      title: 'Woontegra nasıl uygular?',
      description: 'İhtiyaç analizinden canlı kullanıma kadar uçtan uca yazılım süreci.',
      bullets: ['Süreç analizi ve kapsam netleştirme', 'Modüler mimari ve entegrasyon planı', 'Test, yayın ve operasyon desteği'],
      flowSteps: ['Analiz', 'Tasarım', 'Geliştirme', 'Entegrasyon', 'Yayın', 'Destek'],
    },
    related: partial.related ?? {
      title: 'İlgili hizmet ve ürünler',
      links: [{ label: 'Yazılım Geliştirme', href: '/hizmetler/yazilim-gelistirme', description: 'Özel panel ve entegrasyon projeleri' }],
    },
    cta: { ...defaultCta, ...partial.cta },
  }
}

export const eTicaretAltyapisiDetail = solution(
  'e-ticaret-altyapisi',
  'E-ticaret Altyapısı',
  'Ürün, kategori, sepet, ödeme, sipariş, müşteri hesabı, kampanya ve içerik yönetimini tek panelde toplayan yönetilebilir e-ticaret altyapıları.',
  'Woontegra e-ticaret altyapısı — ürün, sepet, ödeme, sipariş ve kampanya yönetimi tek panelde.',
  {
    audience: {
      title: 'Kimler için?',
      subtitle: 'Dijital satış kanalı kurmak veya mevcut mağazasını ölçeklemek isteyen işletmeler.',
      items: [
        { icon: 'ShoppingCart', title: 'Perakende ve toptan satış', description: 'Online mağaza ile yeni satış kanalı açmak isteyen markalar.' },
        { icon: 'Package', title: 'Ürün kataloğu yoğun işletmeler', description: 'Çok SKU, varyant ve kampanya yönetimi gerektiren yapılar.' },
        { icon: 'Building2', title: 'Büyüyen e-ticaret operasyonları', description: 'Dağınık süreçleri tek panelde toplamak isteyen ekipler.' },
      ],
    },
    benefits: {
      title: 'Ne sağlar?',
      subtitle: 'Satış ve operasyonu aynı sistemde birleştirir.',
      items: [
        { icon: 'LayoutDashboard', title: 'Merkezi yönetim', description: 'Ürün, sipariş ve müşteri verileri tek panelde.' },
        { icon: 'CreditCard', title: 'Esnek ödeme altyapısı', description: 'PayTR, havale ve kapıda ödeme seçenekleri.' },
        { icon: 'TrendingUp', title: 'Ölçeklenebilir mimari', description: 'Trafik ve ürün sayısı arttıkça yönetilebilir kalır.' },
      ],
    },
    modules: {
      title: 'Temel modüller',
      subtitle: 'E-ticaret altyapısının çekirdek bileşenleri',
      items: [
        { icon: 'Boxes', title: 'Ürün ve kategori yönetimi', description: 'Varyant, stok ve medya ile birlikte katalog yönetimi.', gradient: 'from-emerald-500 to-teal-500' },
        { icon: 'ShoppingCart', title: 'Sepet ve ödeme akışı', description: 'Dönüşüm odaklı checkout ve sipariş oluşturma.', gradient: 'from-blue-500 to-cyan-500' },
        { icon: 'CreditCard', title: 'Ödeme altyapıları', description: 'PayTR, havale ve kapıda ödeme entegrasyonları.', gradient: 'from-violet-500 to-purple-500' },
        { icon: 'Truck', title: 'Sipariş ve müşteri yönetimi', description: 'Sipariş durumu, müşteri hesabı ve teslimat takibi.', gradient: 'from-orange-500 to-red-500' },
        { icon: 'Search', title: 'SEO ve içerik sayfaları', description: 'Landing, blog ve yasal sayfa altyapısı.', gradient: 'from-pink-500 to-rose-500' },
        { icon: 'Percent', title: 'Kampanya altyapısı', description: 'İndirim, kupon ve dönemsel kampanya kuralları.', gradient: 'from-slate-600 to-slate-800' },
        { icon: 'Image', title: 'Medya yönetimi', description: 'Görsel ve dosya yükleme, CDN uyumlu medya katmanı.', gradient: 'from-emerald-600 to-green-600' },
      ],
    },
    related: {
      title: 'İlgili hizmet ve ürünler',
      links: [
        { label: 'E-Ticaret Çözümleri', href: '/hizmetler/e-ticaret', description: 'Mağaza kurulumu ve özelleştirme hizmeti' },
        { label: 'Pazaryeri Entegrasyonu', href: '/cozumler/pazaryeri-entegrasyonu', description: 'Çok kanallı satış entegrasyonu' },
        { label: 'Yazılımlar', href: '/yazilimlar', description: 'Hazır yazılım ve SaaS ürünleri' },
      ],
    },
  },
)

export const pazaryeriEntegrasyonuDetail = solution(
  'pazaryeri-entegrasyonu',
  'Pazaryeri Entegrasyonu',
  'Trendyol ve benzeri pazaryerlerindeki ürün, sipariş, fiyat ve stok süreçlerini merkezi panelden yönetilebilir hale getiren entegrasyon yapıları.',
  'Pazaryeri entegrasyonu — ürün aktarımı, stok senkronizasyonu ve sipariş yönetimi.',
  {
    audience: {
      title: 'Kimler için?',
      subtitle: 'Birden fazla satış kanalında aynı ürünleri yöneten işletmeler.',
      items: [
        { icon: 'Store', title: 'Pazaryeri satıcıları', description: 'Trendyol ve benzeri kanallarda aktif satış yapan markalar.' },
        { icon: 'RefreshCw', title: 'Stok senkron ihtiyacı olanlar', description: 'Web ve pazaryeri stoklarını eşitlemek isteyen operasyon ekipleri.' },
        { icon: 'Workflow', title: 'Operasyon yoğun e-ticaret', description: 'Sipariş hacmi arttıkça manuel iş yükünü azaltmak isteyenler.' },
      ],
    },
    benefits: {
      title: 'Ne sağlar?',
      subtitle: 'Çok kanallı satışı tek merkezden yönetilebilir kılar.',
      items: [
        { icon: 'Link', title: 'Kanal birleşimi', description: 'Pazaryeri ve web mağaza verileri aynı sistemde.' },
        { icon: 'Clock', title: 'Zaman tasarrufu', description: 'Manuel ürün ve sipariş aktarımını otomatikleştirir.' },
        { icon: 'ShieldCheck', title: 'Tutarlı veri', description: 'Fiyat ve stok sapmalarını minimize eder.' },
      ],
    },
    modules: {
      title: 'Temel modüller',
      subtitle: 'Pazaryeri entegrasyon katmanı',
      items: [
        { icon: 'Upload', title: 'Ürün aktarımı', description: 'Toplu ve tekil ürün gönderimi, güncelleme senaryoları.', gradient: 'from-blue-500 to-cyan-500' },
        { icon: 'Tags', title: 'Kategori eşleştirme', description: 'Marka, kategori ve özellik eşleştirme altyapısı.', gradient: 'from-emerald-500 to-teal-500' },
        { icon: 'DollarSign', title: 'Fiyat senkronizasyonu', description: 'Kanal bazlı fiyat stratejileri ve otomatik güncelleme.', gradient: 'from-violet-500 to-purple-500' },
        { icon: 'Package', title: 'Stok senkronizasyonu', description: 'Gerçek zamanlı veya periyodik stok eşitleme.', gradient: 'from-orange-500 to-red-500' },
        { icon: 'Inbox', title: 'Sipariş çekme', description: 'Pazaryeri siparişlerinin merkezi panele aktarımı.', gradient: 'from-pink-500 to-rose-500' },
        { icon: 'MessageCircle', title: 'Müşteri soruları', description: 'Pazaryeri müşteri iletişim süreçlerine hazırlık.', gradient: 'from-slate-600 to-slate-800' },
        { icon: 'FileText', title: 'Kargo ve fatura', description: 'Operasyon sonrası süreçlere entegrasyon hazırlığı.', gradient: 'from-emerald-600 to-green-600' },
      ],
    },
    related: {
      title: 'İlgili hizmet ve ürünler',
      links: [
        { label: 'E-ticaret Altyapısı', href: '/cozumler/e-ticaret-altyapisi', description: 'Ana mağaza altyapısı' },
        { label: 'Stok ve Fiyat Yönetimi', href: '/cozumler/stok-fiyat-yonetimi', description: 'Fiyat ve stok stratejileri' },
      ],
    },
  },
)

export const siparisYonetimiDetail = solution(
  'siparis-yonetimi',
  'Sipariş Yönetimi',
  'Web sitesi, pazaryeri ve manuel satışlardan gelen siparişleri tek merkezde izlemeye yarayan operasyon yönetim sistemi.',
  'Merkezi sipariş yönetimi — ödeme, teslimat ve lisans teslimatı tek panelde.',
  {
    audience: {
      title: 'Kimler için?',
      subtitle: 'Sipariş hacmi arttıkça operasyonu dijitalleştirmek isteyen işletmeler.',
      items: [
        { icon: 'ShoppingBag', title: 'E-ticaret operasyon ekipleri', description: 'Çok kaynaktan gelen siparişleri tek ekranda yönetmek isteyenler.' },
        { icon: 'Monitor', title: 'Dijital ürün satıcıları', description: 'Lisans ve indirilebilir ürün teslimatı yapan yapılar.' },
        { icon: 'Users', title: 'Müşteri odaklı markalar', description: 'Sipariş sonrası deneyimi standartlaştırmak isteyen ekipler.' },
      ],
    },
    benefits: {
      title: 'Ne sağlar?',
      subtitle: 'Satış sonrası süreçleri görünür ve yönetilebilir kılar.',
      items: [
        { icon: 'ListChecks', title: 'Tek sipariş ekranı', description: 'Tüm kanallardan gelen siparişler listelenir.' },
        { icon: 'Bell', title: 'Durum takibi', description: 'Ödeme, hazırlık ve teslimat aşamaları izlenir.' },
        { icon: 'Key', title: 'Dijital teslimat', description: 'Lisanslı ürünler için otomatik teslimat akışı.' },
      ],
    },
    modules: {
      title: 'Temel modüller',
      subtitle: 'Sipariş operasyon katmanı',
      items: [
        { icon: 'ClipboardList', title: 'Sipariş listesi', description: 'Filtreleme, arama ve durum bazlı görünüm.', gradient: 'from-violet-500 to-purple-500' },
        { icon: 'FileSearch', title: 'Sipariş detayı', description: 'Kalem, müşteri, ödeme ve teslimat bilgileri.', gradient: 'from-blue-500 to-cyan-500' },
        { icon: 'CreditCard', title: 'Ödeme durumu', description: 'PayTR, havale ve diğer ödeme yöntemi takibi.', gradient: 'from-emerald-500 to-teal-500' },
        { icon: 'Truck', title: 'Teslimat bilgileri', description: 'Kargo, adres ve teslimat notları.', gradient: 'from-orange-500 to-red-500' },
        { icon: 'Download', title: 'Lisans teslimatı', description: 'Dijital ürün indirme ve lisans aktivasyonu.', gradient: 'from-pink-500 to-rose-500' },
        { icon: 'User', title: 'Müşteri bilgileri', description: 'Sipariş geçmişi ve iletişim verileri.', gradient: 'from-slate-600 to-slate-800' },
        { icon: 'StickyNote', title: 'Operasyon notları', description: 'Admin notları ve iç ekip takibi.', gradient: 'from-emerald-600 to-green-600' },
      ],
    },
    related: {
      title: 'İlgili hizmet ve ürünler',
      links: [
        { label: 'E-ticaret Altyapısı', href: '/cozumler/e-ticaret-altyapisi', description: 'Mağaza ve checkout altyapısı' },
        { label: 'Dijital Operasyon', href: '/cozumler/dijital-operasyon', description: 'Satış sonrası süreçler' },
      ],
    },
  },
)

export const stokFiyatYonetimiDetail = solution(
  'stok-fiyat-yonetimi',
  'Stok ve Fiyat Yönetimi',
  'Ürün fiyatları, kampanyalar, stok durumları ve pazaryeri fiyat stratejilerini yönetilebilir hale getiren sistemler.',
  'Stok ve fiyat yönetimi — kampanya, pazaryeri stratejisi ve toplu güncelleme.',
  {
    audience: {
      title: 'Kimler için?',
      subtitle: 'Fiyat ve stok güncellemelerini hızlı ve tutarlı yönetmek isteyen işletmeler.',
      items: [
        { icon: 'BarChart3', title: 'Çok kanallı satıcılar', description: 'Web ve pazaryerinde farklı fiyat stratejisi uygulayan markalar.' },
        { icon: 'Percent', title: 'Kampanya yoğun dönemler', description: 'Sezonluk indirim ve promosyon yönetimi gerektiren yapılar.' },
        { icon: 'Layers', title: 'Varyantlı ürün katalogları', description: 'Stok ve fiyatı varyant bazında takip eden operasyonlar.' },
      ],
    },
    benefits: {
      title: 'Ne sağlar?',
      subtitle: 'Fiyatlandırma ve envanter kontrolünü merkezileştirir.',
      items: [
        { icon: 'RefreshCw', title: 'Toplu güncelleme', description: 'Yüzlerce ürünü tek seferde güncelleme imkânı.' },
        { icon: 'Target', title: 'Kanal stratejisi', description: 'Pazaryeri ve web için ayrı fiyat kuralları.' },
        { icon: 'AlertTriangle', title: 'Stok görünürlüğü', description: 'Kritik stok seviyelerini erken fark etme.' },
      ],
    },
    modules: {
      title: 'Temel modüller',
      subtitle: 'Stok ve fiyat yönetim katmanı',
      items: [
        { icon: 'Package', title: 'Stok takibi', description: 'Gerçek zamanlı stok durumu ve hareket geçmişi.', gradient: 'from-emerald-500 to-teal-500' },
        { icon: 'DollarSign', title: 'Fiyat güncelleme', description: 'Liste fiyatı, indirimli fiyat ve KDV yönetimi.', gradient: 'from-blue-500 to-cyan-500' },
        { icon: 'Percent', title: 'Kampanya fiyatı', description: 'Dönemsel ve koşullu kampanya kuralları.', gradient: 'from-violet-500 to-purple-500' },
        { icon: 'Store', title: 'Pazaryeri stratejisi', description: 'Kanal bazlı fiyat ve marj yönetimi.', gradient: 'from-orange-500 to-red-500' },
        { icon: 'Upload', title: 'Toplu güncelleme', description: 'Excel/CSV veya API ile toplu fiyat-stok aktarımı.', gradient: 'from-pink-500 to-rose-500' },
        { icon: 'GitBranch', title: 'Varyant hazırlığı', description: 'Renk, beden ve özellik bazlı stok-fiyat yapısı.', gradient: 'from-slate-600 to-slate-800' },
      ],
    },
    related: {
      title: 'İlgili hizmet ve ürünler',
      links: [
        { label: 'Pazaryeri Entegrasyonu', href: '/cozumler/pazaryeri-entegrasyonu', description: 'Kanal senkronizasyonu' },
        { label: 'E-ticaret Altyapısı', href: '/cozumler/e-ticaret-altyapisi', description: 'Ürün kataloğu altyapısı' },
      ],
    },
  },
)

export const dijitalOperasyonDetail = solution(
  'dijital-operasyon',
  'Dijital Operasyon',
  'İşletmelerin satış sonrası, müşteri, ödeme, lisans, bildirim ve raporlama süreçlerini dijital ortama taşıyan operasyon sistemleri.',
  'Dijital operasyon — müşteri, ödeme, lisans ve raporlama tek panelde.',
  {
    audience: {
      title: 'Kimler için?',
      subtitle: 'Operasyonel süreçleri Excel ve manuel adımlardan kurtarmak isteyen işletmeler.',
      items: [
        { icon: 'Building2', title: 'Büyüyen dijital işletmeler', description: 'Satış sonrası süreçleri standartlaştırmak isteyen ekipler.' },
        { icon: 'Cloud', title: 'SaaS ve lisans satıcıları', description: 'Abonelik, lisans ve müşteri yaşam döngüsü yönetimi.' },
        { icon: 'Headphones', title: 'Müşteri destek odaklı markalar', description: 'Talep, ödeme ve bildirim süreçlerini dijitalleştirmek isteyenler.' },
      ],
    },
    benefits: {
      title: 'Ne sağlar?',
      subtitle: 'Operasyonel verimliliği ve görünürlüğü artırır.',
      items: [
        { icon: 'LayoutDashboard', title: 'Panel tabanlı yönetim', description: 'Tüm operasyon adımları tek arayüzde.' },
        { icon: 'Bell', title: 'Otomatik bildirimler', description: 'E-posta ve sistem içi bildirim akışları.' },
        { icon: 'LineChart', title: 'Raporlama', description: 'Satış, ödeme ve müşteri metrikleri.' },
      ],
    },
    modules: {
      title: 'Temel modüller',
      subtitle: 'Dijital operasyon katmanı',
      items: [
        { icon: 'Inbox', title: 'Müşteri talepleri', description: 'Destek ve iletişim taleplerinin takibi.', gradient: 'from-emerald-500 to-teal-500' },
        { icon: 'CreditCard', title: 'Ödeme takibi', description: 'Tahsilat, iade ve ödeme durumu izleme.', gradient: 'from-blue-500 to-cyan-500' },
        { icon: 'Key', title: 'Lisans yönetimi', description: 'Aktivasyon, yenileme ve kullanım hakları.', gradient: 'from-violet-500 to-purple-500' },
        { icon: 'Bell', title: 'Bildirimler', description: 'Sistem, e-posta ve operasyon uyarıları.', gradient: 'from-orange-500 to-red-500' },
        { icon: 'Monitor', title: 'Yönetim paneli', description: 'Rol bazlı erişim ve modüler admin arayüzü.', gradient: 'from-pink-500 to-rose-500' },
        { icon: 'BarChart3', title: 'Raporlama', description: 'Satış, operasyon ve performans ekranları.', gradient: 'from-slate-600 to-slate-800' },
      ],
    },
    related: {
      title: 'İlgili hizmet ve ürünler',
      links: [
        { label: 'Sipariş Yönetimi', href: '/cozumler/siparis-yonetimi', description: 'Sipariş operasyonu' },
        { label: 'SaaS Ürün Geliştirme', href: '/hizmetler/saas', description: 'Abonelik tabanlı yazılım' },
        { label: 'Yazılımlar', href: '/yazilimlar', description: 'Hazır yazılım ürünleri' },
      ],
    },
  },
)

export const ozelYazilimSurecleriDetail = solution(
  'ozel-yazilim-surecleri',
  'Özel Yazılım Süreçleri',
  'İşletmenin kendi iş akışına göre özel panel, masaüstü yazılım, SaaS, entegrasyon ve otomasyon sistemleri geliştirme süreci.',
  'Özel yazılım süreçleri — analiz, geliştirme, entegrasyon ve bakım.',
  {
    audience: {
      title: 'Kimler için?',
      subtitle: 'Hazır yazılımların karşılamadığı özel iş akışına sahip işletmeler.',
      items: [
        { icon: 'Code', title: 'Özel süreç ihtiyacı olanlar', description: 'Sektöre özel panel ve otomasyon gerektiren yapılar.' },
        { icon: 'Cpu', title: 'Masaüstü ve SaaS projeleri', description: 'Lisanslı veya abonelik tabanlı yazılım geliştirmek isteyenler.' },
        { icon: 'Plug', title: 'Entegrasyon ihtiyacı', description: 'Mevcut sistemlerle API entegrasyonu gerektiren operasyonlar.' },
      ],
    },
    benefits: {
      title: 'Ne sağlar?',
      subtitle: 'İş akışınıza tam uyumlu yazılım altyapısı.',
      items: [
        { icon: 'Target', title: 'İhtiyaca özel mimari', description: 'Gereksiz modül yükü olmadan hedefe odaklı sistem.' },
        { icon: 'Shield', title: 'Sürdürülebilir kod tabanı', description: 'Bakım ve genişletmeye uygun yapı.' },
        { icon: 'Rocket', title: 'Uçtan uca süreç', description: 'Analizden yayına kadar tek ekip yönetimi.' },
      ],
    },
    modules: {
      title: 'Temel modüller',
      subtitle: 'Özel yazılım geliştirme süreci',
      items: [
        { icon: 'Search', title: 'İhtiyaç analizi', description: 'Süreç haritalama ve kapsam netleştirme.', gradient: 'from-emerald-500 to-teal-500' },
        { icon: 'Palette', title: 'UI/UX tasarım', description: 'Kullanıcı odaklı arayüz ve deneyim tasarımı.', gradient: 'from-blue-500 to-cyan-500' },
        { icon: 'Code', title: 'Backend / frontend', description: 'Modern stack ile uygulama geliştirme.', gradient: 'from-violet-500 to-purple-500' },
        { icon: 'Plug', title: 'API entegrasyonları', description: 'Ödeme, pazaryeri ve üçüncü parti servisler.', gradient: 'from-orange-500 to-red-500' },
        { icon: 'Key', title: 'Lisans ve ödeme', description: 'Ticari modelinize uygun altyapı katmanı.', gradient: 'from-pink-500 to-rose-500' },
        { icon: 'CheckCircle', title: 'Test ve yayın', description: 'Kalite kontrol, deploy ve bakım süreci.', gradient: 'from-slate-600 to-slate-800' },
      ],
    },
    related: {
      title: 'İlgili hizmet ve ürünler',
      links: [
        { label: 'Yazılım Geliştirme', href: '/hizmetler/yazilim-gelistirme', description: 'Özel yazılım hizmeti' },
        { label: 'SaaS Ürün Geliştirme', href: '/hizmetler/saas', description: 'Abonelik tabanlı ürünler' },
        { label: 'Mobil Uygulama', href: '/hizmetler/mobil-uygulama-gelistirme', description: 'Mobil uygulama geliştirme' },
      ],
    },
  },
)

export const SOLUTION_DETAIL_BY_SLUG: Record<string, SolutionDetailContent> = {
  'e-ticaret-altyapisi': eTicaretAltyapisiDetail,
  'pazaryeri-entegrasyonu': pazaryeriEntegrasyonuDetail,
  'siparis-yonetimi': siparisYonetimiDetail,
  'stok-fiyat-yonetimi': stokFiyatYonetimiDetail,
  'dijital-operasyon': dijitalOperasyonDetail,
  'ozel-yazilim-surecleri': ozelYazilimSurecleriDetail,
}

export function getSolutionDetailBySlug(slug: string): SolutionDetailContent | undefined {
  return SOLUTION_DETAIL_BY_SLUG[slug]
}
