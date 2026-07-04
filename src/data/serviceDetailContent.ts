// Ported from frontend serviceDetailContent.ts

export type ServiceHeroTheme = 'emerald' | 'purple' | 'teal' | 'blue' | 'amber' | 'violet' | 'slate'

export type ServiceDetailContent = {
  slug: string
  heroTheme: ServiceHeroTheme
  hero: {
    eyebrow: string
    title: string
    description: string
    image: string
    imageAlt: string
    primaryCta: { text: string; to: string }
    secondaryCta: { text: string; to: string }
    highlights?: Array<{ icon: string; title: string }>
  }
  /** 'challenge' = sorun odaklı (kırmızı ikon); 'audience' = hedef kitle listesi */
  problemsTone?: 'challenge' | 'audience'
  problems: {
    title: string
    subtitle: string
    items: Array<{ icon: string; title: string; description: string }>
  }
  approach: {
    title: string
    description: string
    bullets: string[]
    flowSteps: string[]
  }
  scope: {
    title: string
    subtitle: string
    items: Array<{ icon: string; title: string; description: string; gradient: string }>
  }
  process: {
    title: string
    subtitle: string
    steps: Array<{ step: string; title: string; description: string }>
  }
  whyUs: {
    title: string
    items: Array<{ title: string; description: string }>
  }
  technology: {
    title: string
    description: string
    items: Array<{ icon: string; title: string; description: string }>
  }
  cta: {
    title: string
    description: string
    buttonText: string
    buttonTo: string
    secondaryButtonText?: string
    secondaryButtonTo?: string
  }
  related?: {
    title: string
    links: Array<{ label: string; href: string; description?: string }>
  }
}

export const softwareDevelopmentDetail: ServiceDetailContent = {
  slug: 'yazilim-gelistirme',
  heroTheme: 'emerald',
  hero: {
    eyebrow: 'ÖZEL YAZILIM',
    title: 'Yazılım Geliştirme',
    description:
      'İş süreçlerinize özel web, masaüstü, panel ve entegrasyon tabanlı yazılım çözümleri geliştiriyoruz.',
    image: '/images/yazilim-dashboard.jpg',
    imageAlt: 'Woontegra yazılım geliştirme yönetim paneli',
    primaryCta: { text: 'Projenizi Konuşalım', to: '/iletisim' },
    secondaryCta: { text: 'Yazılım Ürünlerimizi İnceleyin', to: '/yazilimlar' },
    highlights: [
      { icon: 'Globe', title: 'Web ve masaüstü yazılım' },
      { icon: 'LayoutDashboard', title: 'Yönetim paneli geliştirme' },
      { icon: 'Plug', title: 'API ve entegrasyon altyapısı' },
    ],
  },
  problemsTone: 'audience',
  problems: {
    title: 'Kimler için uygun?',
    subtitle: 'Özel yazılım geliştirme hizmetimiz şu ihtiyaçlara sahip ekipler için tasarlanmıştır.',
    items: [
      {
        icon: 'Building2',
        title: 'Hazır paketlerle ihtiyacını karşılayamayan işletmeler',
        description: 'Standart yazılımlar sürecinize uymuyorsa size özel mimari kurulur.',
      },
      {
        icon: 'Rocket',
        title: 'Kendi SaaS ürününü geliştirmek isteyen girişimler',
        description: 'Abonelik, lisans ve kullanıcı yönetimi olan ürün altyapıları.',
      },
      {
        icon: 'Monitor',
        title: 'Masaüstü programını modernleştirmek isteyen firmalar',
        description: 'Windows tabanlı, lisanslı ve güvenli iş uygulamaları.',
      },
      {
        icon: 'FileSpreadsheet',
        title: 'Excel veya manuel süreçlerden kurtulmak isteyen ekipler',
        description: 'Tek panelde toplanan dijital operasyon akışları.',
      },
      {
        icon: 'LayoutDashboard',
        title: 'Sipariş, müşteri, ödeme ve lisans süreçlerini tek panelden yönetmek isteyenler',
        description: 'Operasyonu uçtan uca dijitalleştiren yönetim sistemleri.',
      },
      {
        icon: 'Link',
        title: 'Mevcut sistemleri birbiriyle konuşturmak isteyen şirketler',
        description: 'API ve entegrasyon katmanları ile veri akışı birleştirilir.',
      },
    ],
  },
  approach: {
    title: 'İşletmenize özel, yönetilebilir yazılım sistemleri',
    description:
      'Woontegra, hazır kalıplar yerine işletmenin gerçek ihtiyacına göre tasarlanmış, ölçeklenebilir ve sürdürülebilir yazılım çözümleri geliştirir. Web tabanlı yönetim panelleri, masaüstü programlar, müşteri portalları, lisans sistemleri, ödeme altyapıları ve üçüncü parti entegrasyonlar tek bir plan dahilinde hazırlanır.',
    bullets: [],
    flowSteps: [],
  },
  scope: {
    title: 'Neler geliştiriyoruz?',
    subtitle: 'Modüler, entegre ve uzun vadede yönetilebilir yazılım bileşenleri.',
    items: [
      {
        icon: 'LayoutDashboard',
        title: 'Web Tabanlı Yönetim Panelleri',
        description: 'Sipariş, müşteri, ürün, ödeme, rapor ve operasyon süreçleri için özel admin panelleri.',
        gradient: 'from-emerald-500 to-teal-500',
      },
      {
        icon: 'Monitor',
        title: 'Masaüstü Yazılımlar',
        description: 'Windows üzerinde çalışan, lisanslı veya yerel veriyle çalışan iş programları.',
        gradient: 'from-blue-500 to-cyan-500',
      },
      {
        icon: 'Cloud',
        title: 'SaaS Ürün Altyapıları',
        description: 'Üyelik, abonelik, kullanıcı rolleri, lisans ve ödeme süreçleri bulunan bulut tabanlı sistemler.',
        gradient: 'from-violet-500 to-purple-500',
      },
      {
        icon: 'Plug',
        title: 'API ve Entegrasyonlar',
        description: 'Ödeme, pazaryeri, muhasebe, kargo, lisans ve üçüncü parti servis bağlantıları.',
        gradient: 'from-orange-500 to-red-500',
      },
      {
        icon: 'Users',
        title: 'Müşteri ve Bayi Portalları',
        description: 'Kullanıcıların işlem yapabileceği güvenli hesap, takip ve destek ekranları.',
        gradient: 'from-pink-500 to-rose-500',
      },
      {
        icon: 'Workflow',
        title: 'Otomasyon Sistemleri',
        description: 'Tekrarlayan iş süreçlerini azaltan bildirim, takip, raporlama ve işlem akışları.',
        gradient: 'from-slate-600 to-slate-800',
      },
    ],
  },
  process: {
    title: 'Nasıl çalışıyoruz?',
    subtitle: 'Keşiften yayına, şeffaf ve ölçülebilir bir geliştirme süreci.',
    steps: [
      { step: '01', title: 'Analiz', description: 'İhtiyacı, hedef kullanıcıyı ve mevcut süreci netleştiririz.' },
      { step: '02', title: 'Planlama', description: 'Ekranları, modülleri, veri yapısını ve teknik altyapıyı çıkarırız.' },
      { step: '03', title: 'Tasarım', description: 'Kullanılabilir, sade ve gerçek iş akışına uygun arayüzler hazırlarız.' },
      { step: '04', title: 'Geliştirme', description: 'Frontend, backend, veritabanı, API ve entegrasyonları geliştiririz.' },
      { step: '05', title: 'Test', description: 'Yetki, veri, ödeme, lisans, mail ve kullanıcı akışlarını test ederiz.' },
      { step: '06', title: 'Yayın ve Bakım', description: 'Canlıya alma, iyileştirme, hata takibi ve geliştirme sürecini sürdürürüz.' },
    ],
  },
  whyUs: {
    title: 'Sadece yazılım yazmıyor, çalışan sistem kuruyoruz.',
    items: [
      {
        title: 'Ürün deneyimi',
        description:
          'Kendi yazılım ürünlerimizi geliştirip işlettiğimiz için sadece kod değil, operasyon mantığı da kurarız.',
      },
      {
        title: 'Yönetilebilir yapı',
        description:
          'Teslim edilen sistemin panel, içerik, kullanıcı ve süreç yönetimi düşünülerek hazırlanmasına önem veririz.',
      },
      {
        title: 'Ölçeklenebilir altyapı',
        description: 'Bugünün ihtiyacını çözerken yarının geliştirmelerine uygun temel oluştururuz.',
      },
      {
        title: 'Gerçek kullanım odağı',
        description: 'Ekranları gösterişli ama kullanışsız değil, günlük iş akışına uygun olacak şekilde planlarız.',
      },
    ],
  },
  technology: {
    title: 'Teknik kapsam',
    description: 'Projeye göre esnek stack seçimi; aşağıdaki teknolojiler tipik Woontegra projelerinde kullanılır.',
    items: [
      { icon: 'Code2', title: 'React / TypeScript frontend', description: 'Hızlı, bakımı kolay arayüz katmanı.' },
      { icon: 'Server', title: 'Node.js / Express backend', description: 'API, iş kuralları ve entegrasyon servisleri.' },
      { icon: 'Database', title: 'PostgreSQL / Prisma veri katmanı', description: 'Güvenilir ve ölçeklenebilir veri modeli.' },
      { icon: 'Plug', title: 'API entegrasyonları', description: 'Ödeme, pazaryeri, kargo ve üçüncü parti servisler.' },
      { icon: 'Shield', title: 'Rol ve yetki sistemi', description: 'Kullanıcı, admin ve operasyon erişim kontrolü.' },
      { icon: 'LayoutDashboard', title: 'Admin panel', description: 'İşletme süreçlerini yöneten merkezi arayüz.' },
      { icon: 'Image', title: 'Dosya ve medya yönetimi', description: 'Görsel, belge ve dijital içerik altyapısı.' },
      { icon: 'CreditCard', title: 'Ödeme altyapısı', description: 'PayTR, havale ve abonelik tahsilat entegrasyonları.' },
      { icon: 'Key', title: 'Lisans sistemi', description: 'Aktivasyon, süre ve kullanım hakları yönetimi.' },
      { icon: 'Mail', title: 'Bildirim ve e-posta akışları', description: 'Transactional mail ve sistem bildirimleri.' },
      { icon: 'BarChart3', title: 'Raporlama ekranları', description: 'Operasyon ve satış metriklerini izleme.' },
      { icon: 'Smartphone', title: 'Responsive tasarım', description: 'Mobil ve masaüstünde tutarlı kullanıcı deneyimi.' },
    ],
  },
  related: {
    title: 'İlgili hizmet ve ürünler',
    links: [
      { label: 'SaaS Ürün Geliştirme', href: '/hizmetler/saas', description: 'Abonelik tabanlı ürün mimarisi' },
      { label: 'E-Ticaret Çözümleri', href: '/hizmetler/e-ticaret', description: 'Satış odaklı mağaza altyapıları' },
      { label: 'Web Tasarım', href: '/hizmetler/web-tasarim', description: 'Kurumsal web ve landing sayfaları' },
      { label: 'Woontegra Yazılımlar', href: '/yazilimlar', description: 'Hazır yazılım ve SaaS ürünleri' },
    ],
  },
  cta: {
    title: 'Aklınızdaki yazılım fikrini birlikte netleştirelim.',
    description:
      'İhtiyacınızı dinleyip hangi modüllerin, ekranların ve entegrasyonların gerektiğini birlikte planlayalım.',
    buttonText: 'İletişime Geç',
    buttonTo: '/iletisim',
  },
}

export const webDesignDetail: ServiceDetailContent = {
  slug: 'web-tasarim',
  heroTheme: 'purple',
  hero: {
    eyebrow: 'Web Tasarım & Kurumsal Site',
    title: 'Dönüşüm Odaklı Kurumsal Web Siteleri Tasarlıyoruz',
    description:
      'Sadece estetik değil; hız, güven ve dönüşüm odaklı kurumsal web siteleri ile markanızı dijitalde güçlendiriyoruz.',
    image: '/images/web-tasarim-hero.png',
    imageAlt: 'Woontegra web tasarım örneği',
    primaryCta: { text: 'Teklif Al', to: '/teklif-al' },
    secondaryCta: { text: 'İletişime Geç', to: '/iletisim' },
  },
  problems: {
    title: 'Web Siteniz Yeterince Dönüştürüyor mu?',
    subtitle: 'Güzel görünen ama sonuç üretmeyen siteler yaygın bir sorun.',
    items: [
      { icon: 'Monitor', title: 'Yavaş ve karmaşık sayfalar', description: 'Ziyaretçi ilgisi saniyeler içinde kaybolur; hemen çıkış oranı artar.' },
      { icon: 'Search', title: 'SEO altyapısı zayıf', description: 'Arama motorlarında görünürlük düşük kalır, organik trafik kaçırılır.' },
      { icon: 'Smartphone', title: 'Mobil deneyim yetersiz', description: 'Mobil kullanıcılar için okunabilirlik ve CTA erişimi zayıflar.' },
      { icon: 'Target', title: 'Net aksiyon yönlendirmesi yok', description: 'Ziyaretçi ne yapacağını bilemez; teklif ve iletişim dönüşümü düşer.' },
    ],
  },
  approach: {
    title: 'Markanıza Uygun Dijital Vitrin Kuruyoruz',
    description: 'Tasarımı marka kimliği, kullanıcı deneyimi ve iş hedefleriyle birlikte kurguluyoruz.',
    bullets: ['Marka dilinizi dijitale taşırız', 'Kullanıcı yolculuğunu sadeleştiririz', 'Hızlı ve SEO uyumlu yapı kurarız', 'Dönüşüm odaklı CTA yerleşimi planlarız'],
    flowSteps: ['Brief', 'Wireframe', 'Tasarım', 'Geliştirme', 'Test', 'Yayın'],
  },
  scope: {
    title: 'Web Tasarım Kapsamımız',
    subtitle: 'Kurumsal siteden landing page’e, ihtiyacınıza göre modüler çözümler.',
    items: [
      { icon: 'Layout', title: 'Kurumsal Web Siteleri', description: 'Güven veren, hızlı ve yönetilebilir kurumsal dijital vitrinler.', gradient: 'from-purple-500 to-indigo-500' },
      { icon: 'Palette', title: 'UI/UX Tasarım', description: 'Kullanıcı odaklı arayüzler ve tutarlı görsel dil.', gradient: 'from-pink-500 to-rose-500' },
      { icon: 'Smartphone', title: 'Mobil Uyumlu Yapı', description: 'Tüm cihazlarda okunabilir, erişilebilir deneyim.', gradient: 'from-blue-500 to-cyan-500' },
      { icon: 'Search', title: 'SEO Altyapısı', description: 'Teknik SEO, meta yapısı ve performans optimizasyonu.', gradient: 'from-emerald-500 to-teal-500' },
      { icon: 'Zap', title: 'Performans Optimizasyonu', description: 'Hızlı yüklenen, Core Web Vitals odaklı sayfalar.', gradient: 'from-amber-500 to-orange-500' },
      { icon: 'Megaphone', title: 'Landing & Kampanya Sayfaları', description: 'Tek hedefli, yüksek dönüşüm odaklı kampanya sayfaları.', gradient: 'from-violet-500 to-purple-600' },
    ],
  },
  process: {
    title: 'Nasıl Çalışıyoruz?',
    subtitle: 'Tasarımdan yayına şeffaf ve iteratif süreç.',
    steps: [
      { step: '01', title: 'Keşif ve Hedef', description: 'Marka, hedef kitle ve dönüşüm hedeflerini netleştiririz.' },
      { step: '02', title: 'Bilgi Mimarisi', description: 'Sayfa yapısı, içerik hiyerarşisi ve kullanıcı akışını planlarız.' },
      { step: '03', title: 'Tasarım & Geliştirme', description: 'Modern arayüz ve temiz kod ile üretime geçeriz.' },
      { step: '04', title: 'Test ve Optimizasyon', description: 'Cihaz, hız ve erişilebilirlik testlerini tamamlarız.' },
      { step: '05', title: 'Yayın ve Destek', description: 'Canlıya alır, güncelleme ve bakım desteği sağlarız.' },
    ],
  },
  whyUs: {
    title: 'Neden Woontegra?',
    items: [
      { title: 'Ajans değil, ürün deneyimi', description: 'Kendi dijital ürünlerimizden gelen UX tecrübesiyle tasarlıyoruz.' },
      { title: 'Dönüşüm odaklı yaklaşım', description: 'Görsel kaliteyi iş hedefleriyle birlikte düşünüyoruz.' },
      { title: 'Hızlı ve sürdürülebilir kod', description: 'Uzun vadede yönetilebilir, güncellenebilir frontend altyapısı.' },
      { title: 'SEO ve performans birlikte', description: 'Güzel site + arama motoru görünürlüğü + hız üçlüsünü hedefliyoruz.' },
    ],
  },
  technology: {
    title: 'Siteniz bugün güçlü, yarın büyümeye hazır olsun.',
    description: 'Teknik altyapıyı performans, güvenlik ve yönetilebilirlik için optimize ediyoruz.',
    items: [
      { icon: 'Zap', title: 'Hızlı yükleme', description: 'Optimize asset ve modern build ile düşük yükleme süresi.' },
      { icon: 'Search', title: 'SEO uyumlu yapı', description: 'Semantik HTML, meta ve sitemap altyapısı.' },
      { icon: 'Shield', title: 'Güvenli altyapı', description: 'Güncel bağımlılıklar ve güvenli dağıtım pratikleri.' },
      { icon: 'RefreshCw', title: 'Kolay güncelleme', description: 'CMS entegrasyonu ile içerik yönetimi kolaylığı.' },
    ],
  },
  cta: {
    title: 'Kurumsal web sitenizi birlikte güçlendirelim.',
    description: 'Markanıza yakışan, hızlı ve dönüşüm odaklı bir dijital vitrin tasarlayalım.',
    buttonText: 'Teklif Al',
    buttonTo: '/teklif-al',
    secondaryButtonText: 'İletişime Geç',
    secondaryButtonTo: '/iletisim',
  },
}

export const ecommerceDetail: ServiceDetailContent = {
  slug: 'e-ticaret',
  heroTheme: 'teal',
  hero: {
    eyebrow: 'E-Ticaret Çözümleri',
    title: 'Satış Odaklı E-Ticaret Altyapıları Kuruyoruz',
    description:
      'Sadece mağaza açmak değil; sipariş, stok, ödeme ve lojistik süreçlerini yönetilebilir bir satış sistemine dönüştürüyoruz.',
    image: '/images/e-ticaret.jpeg',
    imageAlt: 'Woontegra e-ticaret sistemi',
    primaryCta: { text: 'Teklif Al', to: '/teklif-al' },
    secondaryCta: { text: 'İletişime Geç', to: '/iletisim' },
  },
  problems: {
    title: 'E-Ticaret Operasyonunuz Kontrol Altında mı?',
    subtitle: 'Satış artarken operasyon karmaşıklığı da artar.',
    items: [
      { icon: 'Package', title: 'Stok ve sipariş dağınık', description: 'Farklı kanallarda stok senkronizasyonu zorlaşır.' },
      { icon: 'Truck', title: 'Lojistik süreçleri manuel', description: 'Kargo ve iade takibi zaman alır, hata riski yükselir.' },
      { icon: 'CreditCard', title: 'Ödeme ve entegrasyon kopuk', description: 'Pazar yeri ve ödeme sistemleri ayrı yönetilir.' },
      { icon: 'BarChart3', title: 'Raporlama geç ve eksik', description: 'Karar vermek için güncel veriye zamanında ulaşılamaz.' },
    ],
  },
  approach: {
    title: 'Satış ve Operasyonu Tek Sistemde Birleştiriyoruz',
    description: 'E-ticaret altyapısını satış hunisi, operasyon paneli ve entegrasyonlarla uçtan uca kuruyoruz.',
    bullets: ['Satış kanallarını entegre ederiz', 'Stok ve sipariş akışını otomatikleştiririz', 'Yönetim paneli ile kontrol sağlarız', 'Büyümeye hazır mimari kurarız'],
    flowSteps: ['Analiz', 'Mimari', 'Mağaza', 'Entegrasyon', 'Yayın', 'Büyüme'],
  },
  scope: {
    title: 'E-Ticaret Hizmet Kapsamı',
    subtitle: 'Mağazadan entegrasyona, satış odaklı modüler çözümler.',
    items: [
      { icon: 'ShoppingCart', title: 'Online Mağaza', description: 'Hızlı, güvenilir ve dönüşüm odaklı e-ticaret vitrini.', gradient: 'from-emerald-500 to-teal-500' },
      { icon: 'Package', title: 'Stok Yönetimi', description: 'Çok kanallı stok takibi ve otomatik güncelleme.', gradient: 'from-blue-500 to-cyan-500' },
      { icon: 'CreditCard', title: 'Ödeme Entegrasyonları', description: 'Güvenli ödeme altyapısı ve sanal POS bağlantıları.', gradient: 'from-violet-500 to-purple-500' },
      { icon: 'Truck', title: 'Kargo & Lojistik', description: 'Kargo firmaları ve takip süreçleri entegrasyonu.', gradient: 'from-amber-500 to-orange-500' },
      { icon: 'Users', title: 'Müşteri Yönetimi', description: 'Sipariş geçmişi, segmentasyon ve destek araçları.', gradient: 'from-pink-500 to-rose-500' },
      { icon: 'BarChart3', title: 'Raporlama Paneli', description: 'Satış, dönüşüm ve operasyon metrikleri tek ekranda.', gradient: 'from-slate-600 to-slate-800' },
    ],
  },
  process: {
    title: 'Nasıl Çalışıyoruz?',
    subtitle: 'Mağaza kurulumundan operasyon optimizasyonuna.',
    steps: [
      { step: '01', title: 'İş Modeli Analizi', description: 'Ürün, kanal ve operasyon yapınızı inceleriz.' },
      { step: '02', title: 'Altyapı Planlama', description: 'Mağaza, panel ve entegrasyon mimarisini belirleriz.' },
      { step: '03', title: 'Kurulum & Entegrasyon', description: 'Ödeme, kargo ve pazar yeri bağlantılarını tamamlarız.' },
      { step: '04', title: 'Test & Yayın', description: 'Sipariş akışı testleri sonrası canlıya alırız.' },
      { step: '05', title: 'Operasyon Desteği', description: 'Satış büyüdükçe sistem ve süreçleri optimize ederiz.' },
    ],
  },
  whyUs: {
    title: 'Neden Woontegra?',
    items: [
      { title: 'Gerçek e-ticaret operasyonu deneyimi', description: 'Kendi markalarımızda yönettiğimiz satış süreçlerinden gelen tecrübe.' },
      { title: 'Tek panelden yönetim', description: 'Dağınık araçlar yerine entegre operasyon yaklaşımı.' },
      { title: 'Ölçeklenebilir altyapı', description: 'Kampanya ve sezon yüklerine dayanıklı sistem mimarisi.' },
      { title: 'Sürekli optimizasyon', description: 'Dönüşüm ve operasyon verimliliğini birlikte iyileştiriyoruz.' },
    ],
  },
  technology: {
    title: 'Mağazanız bugün satış yapsın, yarın büyüsün.',
    description: 'E-ticaret altyapısını performans, güvenlik ve entegrasyon esnekliği ile kuruyoruz.',
    items: [
      { icon: 'TrendingUp', title: 'Ölçeklenebilir mimari', description: 'Trafik artışında stabil performans.' },
      { icon: 'Lock', title: 'Güvenli ödeme akışı', description: 'PCI uyumlu süreçler ve güvenli veri yönetimi.' },
      { icon: 'Workflow', title: 'Entegrasyon esnekliği', description: 'API ile üçüncü parti sistemlere bağlanabilir yapı.' },
      { icon: 'Activity', title: 'Canlı izleme', description: 'Sipariş ve sistem sağlığı takibi.' },
    ],
  },
  cta: {
    title: 'Satış odaklı e-ticaret altyapınızı kuralım.',
    description: 'Ürün ve operasyon modelinize uygun, yönetilebilir bir e-ticaret sistemi için birlikte planlayalım.',
    buttonText: 'Teklif Al',
    buttonTo: '/teklif-al',
    secondaryButtonText: 'İletişime Geç',
    secondaryButtonTo: '/iletisim',
  },
}

export const saasProductDetail: ServiceDetailContent = {
  slug: 'saas',
  heroTheme: 'blue',
  hero: {
    eyebrow: 'SaaS Ürün Geliştirme',
    title: 'Ölçeklenebilir SaaS Ürünleri Geliştiriyoruz',
    description:
      'Abonelik modeliyle çalışan, çok kiracılı ve büyümeye hazır yazılım ürünleri tasarlıyor ve hayata geçiriyoruz.',
    image: '/images/saas-hero.png',
    imageAlt: 'Woontegra SaaS dashboard',
    primaryCta: { text: 'Teklif Al', to: '/teklif-al' },
    secondaryCta: { text: 'İletişime Geç', to: '/iletisim' },
  },
  problems: {
    title: 'Ürün Fikriniz Ölçeklenebilir mi?',
    subtitle: 'SaaS ürünleri doğru mimari olmadan büyüyemez.',
    items: [
      { icon: 'Layers', title: 'Mimari erken kararları eksik', description: 'Yanlış temel yapı sonradan pahalı refactoring gerektirir.' },
      { icon: 'Users', title: 'Kullanıcı yönetimi karmaşık', description: 'Rol, abonelik ve faturalama akışları net değilse büyüme yavaşlar.' },
      { icon: 'Lock', title: 'Güvenlik ve veri izolasyonu', description: 'Çok kiracılı yapıda veri güvenliği kritik risk oluşturur.' },
      { icon: 'Activity', title: 'Ürün metrikleri takip edilmiyor', description: 'Aktivasyon ve churn ölçülmezse ürün kararları sezgisel kalır.' },
    ],
  },
  approach: {
    title: 'Ürünü Uçtan Uca Tasarlıyoruz',
    description: 'MVP’den ölçeklenebilir SaaS’a, ürün stratejisi ve teknik mimariyi birlikte kurguluyoruz.',
    bullets: ['Ürün vizyonunu netleştiririz', 'MVP kapsamını belirleriz', 'Ölçeklenebilir mimari kurarız', 'Büyüme metriklerini tanımlarız'],
    flowSteps: ['Vizyon', 'MVP', 'Mimari', 'Geliştirme', 'Lansman', 'Büyüme'],
  },
  scope: {
    title: 'SaaS Geliştirme Kapsamı',
    subtitle: 'Ürünleşmiş yazılım için uçtan uca hizmetler.',
    items: [
      { icon: 'Cloud', title: 'Bulut Altyapısı', description: 'AWS, Railway veya tercih ettiğiniz cloud üzerinde ölçeklenebilir deploy.', gradient: 'from-sky-500 to-blue-600' },
      { icon: 'Users', title: 'Kullanıcı & Abonelik', description: 'Kayıt, rol, plan ve faturalama akışları.', gradient: 'from-violet-500 to-purple-500' },
      { icon: 'Layout', title: 'Admin Paneli', description: 'Ürün yönetimi, kullanıcı takibi ve operasyon araçları.', gradient: 'from-emerald-500 to-teal-500' },
      { icon: 'Database', title: 'Veri Mimarisi', description: 'Çok kiracılı, güvenli ve performanslı veri modeli.', gradient: 'from-slate-600 to-slate-800' },
      { icon: 'Zap', title: 'API & Entegrasyon', description: 'Üçüncü parti servisler ve webhook altyapısı.', gradient: 'from-amber-500 to-orange-500' },
      { icon: 'BarChart3', title: 'Analitik & Metrikler', description: 'Kullanıcı davranışı ve ürün performansı takibi.', gradient: 'from-pink-500 to-rose-500' },
    ],
  },
  process: {
    title: 'Nasıl Çalışıyoruz?',
    subtitle: 'Fikirden lansmana odaklı ürün geliştirme süreci.',
    steps: [
      { step: '01', title: 'Ürün Keşfi', description: 'Hedef kullanıcı, değer önerisi ve MVP kapsamını belirleriz.' },
      { step: '02', title: 'Mimari Tasarım', description: 'Ölçeklenebilir, güvenli teknik altyapıyı planlarız.' },
      { step: '03', title: 'MVP Geliştirme', description: 'Hızlı iterasyon ile çalışan ürünü ortaya çıkarırız.' },
      { step: '04', title: 'Test & Lansman', description: 'Beta testleri ve kontrollü yayın sürecini yönetiriz.' },
      { step: '05', title: 'Büyüme & İterasyon', description: 'Metrik odaklı geliştirme ve özellik genişletmesi.' },
    ],
  },
  whyUs: {
    title: 'Neden Woontegra?',
    items: [
      { title: 'Kendi SaaS ürünleri deneyimi', description: 'Aktif olarak yönettiğimiz dijital ürünlerden gelen pratik bilgi.' },
      { title: 'MVP odaklı hızlı başlangıç', description: 'Gereksiz özellik yükü olmadan hızlı piyasaya çıkış.' },
      { title: 'Ölçeklenebilir mimari', description: 'Büyüme geldiğinde altyapıyı yeniden yazmak zorunda kalmayın.' },
      { title: 'Ürün sonrası destek', description: 'Lansman sonrası bakım, izleme ve geliştirme devam eder.' },
    ],
  },
  technology: {
    title: 'SaaS ürününüz büyümeye hazır temellerle başlasın.',
    description: 'Güvenlik, ölçeklenebilirlik ve gözlemlenebilirlik odaklı teknik altyapı.',
    items: [
      { icon: 'Shield', title: 'Çok kiracılı güvenlik', description: 'Veri izolasyonu ve rol tabanlı erişim kontrolü.' },
      { icon: 'TrendingUp', title: 'Yatay ölçekleme', description: 'Kullanıcı artışına uyumlu mimari.' },
      { icon: 'Activity', title: 'Gözlemlenebilirlik', description: 'Log, metrik ve hata takibi altyapısı.' },
      { icon: 'RefreshCw', title: 'Sürekli dağıtım', description: 'Güvenli ve hızlı güncelleme süreçleri.' },
    ],
  },
  cta: {
    title: 'SaaS ürününüzü birlikte hayata geçirelim.',
    description: 'Fikrinizi ölçeklenebilir, sürdürülebilir bir yazılım ürününe dönüştürmek için birlikte planlayalım.',
    buttonText: 'Teklif Al',
    buttonTo: '/teklif-al',
    secondaryButtonText: 'İletişime Geç',
    secondaryButtonTo: '/iletisim',
  },
}

export const trademarkPatentDetail: ServiceDetailContent = {
  slug: 'marka-patent-vekilligi',
  heroTheme: 'amber',
  hero: {
    eyebrow: 'Marka & Patent Vekilliği',
    title: 'Markanızı ve Fikri Mülkiyetinizi Koruyoruz',
    description:
      'Marka tescil, patent başvurusu ve fikri mülkiyet süreçlerinde uçtan uca danışmanlık ve vekillik hizmeti sunuyoruz.',
    image: '/images/hero-dashboard.jpg',
    imageAlt: 'Marka ve patent belgeleri',
    primaryCta: { text: 'Teklif Al', to: '/teklif-al' },
    secondaryCta: { text: 'İletişime Geç', to: '/iletisim' },
  },
  problems: {
    title: 'Markanız Koruma Altında mı?',
    subtitle: 'Fikri mülkiyet ihlalleri marka değerini hızla düşürebilir.',
    items: [
      { icon: 'Scale', title: 'Tescilsiz marka riski', description: 'Rakipler veya kötü niyetli aktörler markanızı kullanabilir.' },
      { icon: 'FileCheck', title: 'Başvuru süreci karmaşık', description: 'Eksik evrak ve yanlış sınıflandırma başvurunun reddine yol açar.' },
      { icon: 'Search', title: 'Ön araştırma yapılmıyor', description: 'Benzer markalar tespit edilmezse hukuki süreç uzar.' },
      { icon: 'Globe', title: 'Uluslararası koruma eksik', description: 'Yurt dışı pazarlarda marka güvenliği sağlanamaz.' },
    ],
  },
  approach: {
    title: 'Stratejik Marka Koruma Süreci',
    description: 'Sadece başvuru değil; marka stratejisi, araştırma ve takip süreçlerini birlikte yönetiyoruz.',
    bullets: ['Marka araştırması yaparız', 'Doğru sınıflandırmayı belirleriz', 'Başvuru sürecini yönetiriz', 'Tescil sonrası takip sağlarız'],
    flowSteps: ['Araştırma', 'Strateji', 'Başvuru', 'Takip', 'Tescil', 'Koruma'],
  },
  scope: {
    title: 'Hizmet Kapsamımız',
    subtitle: 'Marka ve fikri mülkiyet süreçlerinde kapsamlı destek.',
    items: [
      { icon: 'Scale', title: 'Marka Tescil', description: 'Türkiye ve uluslararası marka tescil başvuruları.', gradient: 'from-amber-500 to-orange-500' },
      { icon: 'FileCheck', title: 'Patent Başvurusu', description: 'Buluş ve tasarım patent süreçleri danışmanlığı.', gradient: 'from-blue-500 to-cyan-500' },
      { icon: 'Search', title: 'Marka Araştırması', description: 'Benzer marka taraması ve risk analizi.', gradient: 'from-violet-500 to-purple-500' },
      { icon: 'Shield', title: 'İhlal Takibi', description: 'Marka ihlali tespiti ve hukuki süreç desteği.', gradient: 'from-emerald-500 to-teal-500' },
      { icon: 'Globe', title: 'Uluslararası Tescil', description: 'Madrid Protokolü ve yurt dışı marka koruma.', gradient: 'from-sky-500 to-blue-600' },
      { icon: 'Lightbulb', title: 'Fikri Mülkiyet Danışmanlığı', description: 'Marka portföyü ve strateji danışmanlığı.', gradient: 'from-slate-600 to-slate-800' },
    ],
  },
  process: {
    title: 'Nasıl Çalışıyoruz?',
    subtitle: 'Başvurudan tescile şeffaf ve takip edilebilir süreç.',
    steps: [
      { step: '01', title: 'Ön Araştırma', description: 'Marka benzerlik taraması ve risk değerlendirmesi.' },
      { step: '02', title: 'Strateji & Sınıflandırma', description: 'Doğru Nice sınıfları ve koruma kapsamı belirlenir.' },
      { step: '03', title: 'Başvuru Hazırlığı', description: 'Evrak, vekaletname ve başvuru dosyası tamamlanır.' },
      { step: '04', title: 'Süreç Takibi', description: 'TPMK ve ilgili kurumlarla süreç izlenir.' },
      { step: '05', title: 'Tescil & Koruma', description: 'Tescil sonrası yenileme ve ihlal takibi sağlanır.' },
    ],
  },
  whyUs: {
    title: 'Neden Woontegra?',
    items: [
      { title: 'Teknoloji + marka uzmanlığı', description: 'Dijital markalar ve yazılım ürünleri konusunda deneyimli ekip.' },
      { title: 'Uçtan uca süreç yönetimi', description: 'Araştırmadan tescile tek noktadan takip.' },
      { title: 'Şeffaf iletişim', description: 'Her aşamada net bilgilendirme ve durum raporu.' },
      { title: 'Uzun vadeli marka koruma', description: 'Tescil sonrası yenileme ve izleme desteği.' },
    ],
  },
  technology: {
    title: 'Markanız dijital dünyada da korunmalı.',
    description: 'Online marka varlığı ve dijital haklar için entegre koruma yaklaşımı.',
    items: [
      { icon: 'Globe', title: 'Dijital marka takibi', description: 'Online platformlarda marka kullanımı izleme.' },
      { icon: 'Shield', title: 'Hukuki koruma', description: 'İhlal durumunda hızlı müdahale süreçleri.' },
      { icon: 'FileCheck', title: 'Dokümantasyon', description: 'Tüm süreç belgelerinin düzenli arşivlenmesi.' },
      { icon: 'RefreshCw', title: 'Yenileme takibi', description: 'Tescil yenileme tarihlerinin proaktif yönetimi.' },
    ],
  },
  cta: {
    title: 'Markanızı birlikte koruma altına alalım.',
    description: 'Marka tescil ve fikri mülkiyet süreçleriniz için ücretsiz ön değerlendirme yapalım.',
    buttonText: 'Teklif Al',
    buttonTo: '/teklif-al',
    secondaryButtonText: 'İletişime Geç',
    secondaryButtonTo: '/iletisim',
  },
}

export const mobileAppDevelopmentDetail: ServiceDetailContent = {
  slug: 'mobil-uygulama-gelistirme',
  heroTheme: 'blue',
  hero: {
    eyebrow: 'Mobil Uygulama Geliştirme',
    title: 'iOS ve Android İçin Ölçeklenebilir Mobil Uygulamalar',
    description:
      'Kurumsal mobil uygulamalardan tüketici ürünlerine kadar; performans, güvenlik ve kullanıcı deneyimi odaklı native ve cross-platform çözümler geliştiriyoruz.',
    image: '/images/saas-dashboard.jpg',
    imageAlt: 'Woontegra mobil uygulama geliştirme',
    primaryCta: { text: 'Teklif Al', to: '/teklif-al' },
    secondaryCta: { text: 'İletişime Geç', to: '/iletisim' },
  },
  problems: {
    title: 'Kimler İçin?',
    subtitle: 'Mobil uygulama yatırımı yapan ekiplerin karşılaştığı tipik ihtiyaçlar.',
    items: [
      {
        icon: 'Smartphone',
        title: 'Kurumsal mobil operasyon',
        description: 'Saha ekipleri, bayiler veya iç kullanıcılar için güvenli mobil iş akışları.',
      },
      {
        icon: 'Users',
        title: 'Tüketici mobil ürünleri',
        description: 'App Store ve Google Play’de konumlanan, büyümeye hazır mobil uygulamalar.',
      },
      {
        icon: 'Building2',
        title: 'Mevcut sistem entegrasyonu',
        description: 'ERP, CRM veya web paneli ile senkron çalışan mobil istemciler.',
      },
      {
        icon: 'Rocket',
        title: 'MVP ile hızlı piyasaya çıkış',
        description: 'Sınırlı bütçe ve sürede test edilebilir, iterasyona açık ilk sürüm ihtiyacı.',
      },
    ],
  },
  approach: {
    title: 'Ürün Odaklı Mobil Geliştirme Yaklaşımı',
    description:
      'Mobil uygulamanızı yalnızca ekran tasarımı olarak değil; sürdürülebilir bir dijital ürün olarak ele alırız. Kullanıcı akışları, teknik mimari ve yayın stratejisini birlikte planlarız.',
    bullets: [
      'Hedef kullanıcı ve iş senaryolarını netleştiririz',
      'UX akışları ve teknik mimariyi birlikte tasarlarız',
      'Performans ve güvenlik gereksinimlerini erken aşamada tanımlarız',
      'Mağaza yayını ve sürüm yönetimini sürece dahil ederiz',
    ],
    flowSteps: ['Keşif', 'UX', 'Geliştirme', 'Test', 'Yayın', 'Bakım'],
  },
  scope: {
    title: 'Neler Sunuyoruz?',
    subtitle: 'Mobil uygulama projelerinde uçtan uca geliştirme ve destek kapsamı.',
    items: [
      {
        icon: 'Smartphone',
        title: 'Native & Cross-Platform',
        description: 'iOS, Android ve gerektiğinde React Native / Flutter tabanlı çözümler.',
        gradient: 'from-blue-500 to-cyan-500',
      },
      {
        icon: 'Layout',
        title: 'UX/UI Tasarımı',
        description: 'Mobil öncelikli arayüz, bileşen kütüphanesi ve etkileşim tasarımı.',
        gradient: 'from-violet-500 to-purple-600',
      },
      {
        icon: 'Zap',
        title: 'API & Backend Entegrasyonu',
        description: 'REST/GraphQL servisleri, kimlik doğrulama ve gerçek zamanlı senkronizasyon.',
        gradient: 'from-emerald-500 to-teal-500',
      },
      {
        icon: 'Bell',
        title: 'Push & Bildirim',
        description: 'FCM/APNs entegrasyonu, segmentli bildirim ve kullanıcı tercih yönetimi.',
        gradient: 'from-amber-500 to-orange-500',
      },
      {
        icon: 'Shield',
        title: 'Güvenlik & Uyumluluk',
        description: 'Token yönetimi, veri şifreleme ve KVKK odaklı veri işleme pratikleri.',
        gradient: 'from-slate-600 to-slate-800',
      },
      {
        icon: 'BarChart3',
        title: 'Analitik & İzleme',
        description: 'Olay takibi, çökme raporlama ve sürüm performans metrikleri.',
        gradient: 'from-pink-500 to-rose-500',
      },
    ],
  },
  process: {
    title: 'Süreç',
    subtitle: 'Fikirden mağaza yayınına kadar yapılandırılmış geliştirme adımları.',
    steps: [
      { step: '01', title: 'Keşif & Kapsam', description: 'İş hedefleri, kullanıcı profilleri ve MVP kapsamı belirlenir.' },
      { step: '02', title: 'Tasarım & Prototip', description: 'Akışlar, wireframe ve tıklanabilir prototip onaylanır.' },
      { step: '03', title: 'Geliştirme', description: 'Sprint bazlı geliştirme, kod inceleme ve düzenli demo.' },
      { step: '04', title: 'Test & Kalite', description: 'Cihaz matrisi, performans ve güvenlik testleri tamamlanır.' },
      { step: '05', title: 'Mağaza Yayını', description: 'App Store / Play Store süreçleri ve sürüm notları yönetilir.' },
      { step: '06', title: 'Bakım & İterasyon', description: 'Hata düzeltme, OS güncellemeleri ve özellik genişletmesi.' },
    ],
  },
  whyUs: {
    title: 'Avantajlarımız',
    items: [
      { title: 'Ürün + yazılım deneyimi', description: 'Kendi dijital ürünlerimizden gelen mobil geliştirme pratiği.' },
      { title: 'Performans odaklı mimari', description: 'Düşük gecikme, optimize edilmiş veri kullanımı ve stabil sürümler.' },
      { title: 'Şeffaf proje yönetimi', description: 'Sprint planı, teslimat takvimi ve düzenli durum raporları.' },
      { title: 'Yayın sonrası destek', description: 'Mağaza güncellemeleri, izleme ve sürekli iyileştirme.' },
    ],
  },
  technology: {
    title: 'Sık Sorulan Sorular',
    description: 'Mobil uygulama projelerinde en çok sorulan konular.',
    items: [
      {
        icon: 'HelpCircle',
        title: 'Native mi cross-platform mu tercih edilmeli?',
        description:
          'Performans, bütçe ve yayın takvimine göre birlikte karar veririz. Kurumsal entegrasyon ağırlıklı projelerde native; hızlı MVP için cross-platform uygun olabilir.',
      },
      {
        icon: 'HelpCircle',
        title: 'Mevcut web panelimizle entegre olur mu?',
        description:
          'Evet. Mevcut API veya yeni bir backend katmanı üzerinden mobil uygulama ile web sisteminizi senkronize ederiz.',
      },
      {
        icon: 'HelpCircle',
        title: 'App Store ve Google Play sürecini siz yönetiyor musunuz?',
        description:
          'Evet. Hesap yapılandırması, sürüm gönderimi, reddedilme durumları ve güncelleme döngüsünde destek sağlarız.',
      },
      {
        icon: 'HelpCircle',
        title: 'Proje tesliminden sonra bakım alabilir miyiz?',
        description:
          'Evet. SLA kapsamında hata giderme, OS uyumluluk güncellemeleri ve yeni özellik geliştirmesi sunuyoruz.',
      },
    ],
  },
  cta: {
    title: 'Mobil uygulama projenizi birlikte hayata geçirelim.',
    description: 'Hedeflerinizi, kullanıcı kitlenizi ve teknik gereksinimlerinizi konuşarak net bir yol haritası çıkaralım.',
    buttonText: 'Teklif Al',
    buttonTo: '/teklif-al',
    secondaryButtonText: 'İletişime Geç',
    secondaryButtonTo: '/iletisim',
  },
}

export const SERVICE_DETAIL_BY_SLUG: Record<string, ServiceDetailContent> = {
  'mobil-uygulama-gelistirme': mobileAppDevelopmentDetail,
  'yazilim-gelistirme': softwareDevelopmentDetail,
  'web-tasarim': webDesignDetail,
  'e-ticaret': ecommerceDetail,
  saas: saasProductDetail,
  'marka-patent-vekilligi': trademarkPatentDetail,
}