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
  }
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
}

export const softwareDevelopmentDetail: ServiceDetailContent = {
  slug: 'yazilim-gelistirme',
  heroTheme: 'emerald',
  hero: {
    eyebrow: 'Özel Yazılım Geliştirme',
    title: 'İşletmenize Özel Yazılım Sistemleri Geliştiriyoruz',
    description:
      'Hazır çözümlerin yetmediği süreçlerde, işletmenize özel yönetim panelleri, e-ticaret altyapıları, CRM sistemleri ve operasyon yazılımları geliştiriyoruz.',
    image: '/images/yazilim-hero.png',
    imageAlt: 'Woontegra yazılım geliştirme dashboard',
    primaryCta: { text: 'Teklif Al', to: '/teklif-al' },
    secondaryCta: { text: 'İletişime Geç', to: '/iletisim' },
  },
  problems: {
    title: 'Hazır Sistemler İşinizi Yavaşlatıyor mu?',
    subtitle: 'Birçok işletme hazır yazılımlarla aynı dört sorunla karşılaşıyor.',
    items: [
      {
        icon: 'Workflow',
        title: 'Hazır sistemler iş akışınıza uymaz',
        description: 'Süreçlerinize göre değil, yazılımın kurallarına göre çalışmak zorunda kalırsınız.',
      },
      {
        icon: 'Layers',
        title: 'Gereksiz özellikler süreci yavaşlatır',
        description: 'Kullanılmayan modüller ekip verimliliğini düşürür ve eğitim maliyetini artırır.',
      },
      {
        icon: 'Database',
        title: 'Kritik veriler dağınık kalır',
        description: 'Sipariş, stok ve müşteri verileri farklı araçlarda parçalanır; raporlama güçleşir.',
      },
      {
        icon: 'RefreshCw',
        title: 'Manuel operasyon zaman kaybettirir',
        description: 'Excel ve manuel adımlar büyüdükçe hata riski ve operasyon yükü katlanır.',
      },
    ],
  },
  approach: {
    title: 'İhtiyacınıza Özel Sistem Kuruyoruz',
    description:
      'Hazır şablonları zorlamak yerine sürecinizi analiz eder, işletmenize özel yönetilebilir bir yazılım altyapısı kurarız.',
    bullets: [
      'İş süreçlerinizi ve darboğazları analiz ederiz',
      'Operasyonu dijital modele dönüştürürüz',
      'Yönetilebilir ve ölçeklenebilir sistem kurarız',
      'Performansı ölçülebilir hale getiririz',
    ],
    flowSteps: ['İhtiyaç', 'Analiz', 'Tasarım', 'Geliştirme', 'Yayın', 'Destek'],
  },
  scope: {
    title: 'Geliştirdiğimiz Yazılım Türleri',
    subtitle: 'İşletmenizin ihtiyacına göre modüler, entegre ve sürdürülebilir sistemler.',
    items: [
      {
        icon: 'Settings',
        title: 'Yönetim Panelleri',
        description: 'Sipariş, stok, kullanıcı ve operasyon süreçlerini tek merkezden yönetin.',
        gradient: 'from-emerald-500 to-teal-500',
      },
      {
        icon: 'ShoppingCart',
        title: 'E-Ticaret Altyapıları',
        description: 'Satış, ödeme ve lojistik akışlarını entegre eden ölçeklenebilir mağaza sistemleri.',
        gradient: 'from-blue-500 to-cyan-500',
      },
      {
        icon: 'Users',
        title: 'CRM Sistemleri',
        description: 'Müşteri ilişkilerini, teklif süreçlerini ve satış hunisini tek panelde toplayın.',
        gradient: 'from-violet-500 to-purple-500',
      },
      {
        icon: 'Cloud',
        title: 'SaaS Platformları',
        description: 'Abonelik, kullanıcı yönetimi ve çok kiracılı mimari ile ürünleşmiş yazılımlar.',
        gradient: 'from-sky-500 to-blue-600',
      },
      {
        icon: 'Zap',
        title: 'Otomasyon Sistemleri',
        description: 'Tekrarlayan işleri otomatikleştirerek ekip kapasitesini stratejik işlere ayırın.',
        gradient: 'from-amber-500 to-orange-500',
      },
      {
        icon: 'Boxes',
        title: 'Entegrasyon Sistemleri',
        description: 'ERP, pazar yeri, kargo ve muhasebe araçlarını tek veri akışında birleştirin.',
        gradient: 'from-slate-600 to-slate-800',
      },
    ],
  },
  process: {
    title: 'Nasıl Çalışıyoruz?',
    subtitle: 'Keşiften yayına, ölçülebilir ve şeffaf bir geliştirme süreci.',
    steps: [
      { step: '01', title: 'Keşif ve Analiz', description: 'İhtiyaç, kullanıcı ve operasyon akışını birlikte haritalandırırız.' },
      { step: '02', title: 'Sistem Planlama', description: 'Mimari, modüller ve entegrasyon noktalarını netleştiririz.' },
      { step: '03', title: 'Arayüz ve Geliştirme', description: 'Kullanılabilir arayüzler ve güvenilir backend ile üretime geçeriz.' },
      { step: '04', title: 'Test ve Yayın', description: 'Kalite kontrol sonrası canlıya alır, ekip eğitimini tamamlarız.' },
      { step: '05', title: 'Destek ve Geliştirme', description: 'Yayın sonrası izleme, bakım ve yeni özellik geliştirmesi sağlarız.' },
    ],
  },
  whyUs: {
    title: 'Neden Woontegra?',
    items: [
      {
        title: 'Hazır şablon değil, size özel yapı',
        description: 'İşletmenizin süreçlerine göre tasarlanan, esnek ve büyüyebilir sistemler kuruyoruz.',
      },
      {
        title: 'Kendi ürünlerini geliştiren ekip deneyimi',
        description: 'Sadece müşteri projesi değil; kendi markalarımızda edindiğimiz ürün tecrübesini aktarıyoruz.',
      },
      {
        title: 'E-ticaret ve operasyon tecrübesi',
        description: 'Gerçek satış, stok ve operasyon süreçlerinden gelen pratik bilgiyle geliştiriyoruz.',
      },
      {
        title: 'Yayın sonrası destek ve geliştirme',
        description: 'Canlıya aldıktan sonra da yanınızdayız; sistem büyüdükçe birlikte geliştiriyoruz.',
      },
    ],
  },
  technology: {
    title: 'Kurulan sistem sadece bugün için değil, büyüme için hazırlanır.',
    description: 'Teknik altyapıyı sürdürülebilir, güvenli ve ölçeklenebilir şekilde kurgularız.',
    items: [
      { icon: 'Settings', title: 'Yönetilebilir altyapı', description: 'Modüler yapı ile ekip içi kontrol ve hızlı güncelleme.' },
      { icon: 'TrendingUp', title: 'Ölçeklenebilir yapı', description: 'Trafik ve iş hacmi arttıkça performansı koruyan mimari.' },
      { icon: 'Shield', title: 'Güvenli veri akışı', description: 'Yetkilendirme, loglama ve veri bütünlüğü odaklı geliştirme.' },
      { icon: 'Code2', title: 'Bakımı sürdürülebilir kod', description: 'Okunabilir, dokümante ve uzun vadeli desteklenebilir kod tabanı.' },
    ],
  },
  cta: {
    title: 'İşletmenize özel yazılım sistemi kuralım.',
    description:
      'Mevcut süreçlerinizi birlikte analiz edelim; size özel, yönetilebilir ve geliştirilebilir bir yazılım altyapısı oluşturalım.',
    buttonText: 'Teklif Al',
    buttonTo: '/teklif-al',
    secondaryButtonText: 'İletişime Geç',
    secondaryButtonTo: '/iletisim',
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

export const digitalConsultingDetail: ServiceDetailContent = {
  slug: 'dijital-danismanlik',
  heroTheme: 'slate',
  hero: {
    eyebrow: 'Dijital Danışmanlık',
    title: 'Dijital Dönüşüm ve Teknoloji Stratejisi Danışmanlığı',
    description:
      'İşletmenizin dijital olgunluğunu artırmak, süreçleri optimize etmek ve doğru teknoloji yatırımlarını planlamak için stratejik danışmanlık sunuyoruz.',
    image: '/images/danismanlik-hero.png',
    imageAlt: 'Woontegra dijital danışmanlık',
    primaryCta: { text: 'Teklif Al', to: '/teklif-al' },
    secondaryCta: { text: 'İletişime Geç', to: '/iletisim' },
  },
  problems: {
    title: 'Dijital Stratejiniz Net mi?',
    subtitle: 'Belirsiz teknoloji yatırımları kaynak israfına yol açar.',
    items: [
      { icon: 'Target', title: 'Strateji eksikliği', description: 'Dijital hedefler net değilse yatırımlar dağınık kalır.' },
      { icon: 'Workflow', title: 'Süreçler dijitalleşmemiş', description: 'Manuel operasyonlar ölçeklenmeyi engeller.' },
      { icon: 'Layers', title: 'Teknoloji seçimi zor', description: 'Yanlış araç seçimi maliyet ve verimlilik kaybı yaratır.' },
      { icon: 'BarChart3', title: 'Ölçüm yapılmıyor', description: 'ROI takibi olmadan iyileştirme mümkün değil.' },
    ],
  },
  approach: {
    title: 'Veriye Dayalı Dijital Yol Haritası',
    description: 'Mevcut durum analizi, hedef belirleme ve uygulanabilir aksiyon planı ile dijital dönüşümü yönetiyoruz.',
    bullets: ['Mevcut durumu analiz ederiz', 'Hedef ve KPI belirleriz', 'Yol haritası oluştururuz', 'Uygulamayı destekleriz'],
    flowSteps: ['Analiz', 'Hedef', 'Yol Haritası', 'Uygulama', 'Ölçüm', 'İyileştirme'],
  },
  scope: {
    title: 'Danışmanlık Kapsamımız',
    subtitle: 'Stratejiden uygulamaya, ihtiyaca özel danışmanlık alanları.',
    items: [
      { icon: 'Lightbulb', title: 'Dijital Strateji', description: 'İş hedeflerine uygun dijital dönüşüm planı.', gradient: 'from-amber-500 to-orange-500' },
      { icon: 'Workflow', title: 'Süreç Optimizasyonu', description: 'Operasyon akışlarının dijitalleştirilmesi.', gradient: 'from-emerald-500 to-teal-500' },
      { icon: 'Code2', title: 'Teknoloji Seçimi', description: 'Doğru araç ve platform önerileri.', gradient: 'from-blue-500 to-cyan-500' },
      { icon: 'ShoppingCart', title: 'E-Ticaret Danışmanlığı', description: 'Satış kanalı ve operasyon stratejisi.', gradient: 'from-violet-500 to-purple-500' },
      { icon: 'Cloud', title: 'SaaS & Ürün Danışmanlığı', description: 'Ürünleşme ve SaaS modeli planlaması.', gradient: 'from-sky-500 to-blue-600' },
      { icon: 'BarChart3', title: 'Performans & KPI', description: 'Ölçüm çerçevesi ve raporlama altyapısı.', gradient: 'from-slate-600 to-slate-800' },
    ],
  },
  process: {
    title: 'Nasıl Çalışıyoruz?',
    subtitle: 'Analizden uygulamaya yapılandırılmış danışmanlık süreci.',
    steps: [
      { step: '01', title: 'Durum Analizi', description: 'Mevcut süreçler, araçlar ve dijital olgunluk değerlendirmesi.' },
      { step: '02', title: 'Hedef Belirleme', description: 'İş hedefleri ve ölçülebilir KPI tanımlanır.' },
      { step: '03', title: 'Yol Haritası', description: 'Öncelikli aksiyonlar ve zaman planı oluşturulur.' },
      { step: '04', title: 'Uygulama Desteği', description: 'Seçilen projelerin hayata geçirilmesinde destek.' },
      { step: '05', title: 'Ölçüm & İyileştirme', description: 'Sonuçların takibi ve sürekli optimizasyon.' },
    ],
  },
  whyUs: {
    title: 'Neden Woontegra?',
    items: [
      { title: 'Uygulayıcı danışmanlık', description: 'Sadece rapor değil; gerçek projelerde uygulanan öneriler.' },
      { title: 'Çok disiplinli ekip', description: 'Yazılım, e-ticaret ve operasyon uzmanlığı tek çatıda.' },
      { title: 'Kendi ürün deneyimi', description: 'Kendi markalarımızdan gelen pratik operasyon bilgisi.' },
      { title: 'Ölçülebilir sonuçlar', description: 'KPI odaklı danışmanlık ve şeffaf ilerleme takibi.' },
    ],
  },
  technology: {
    title: 'Doğru teknoloji, doğru süreçle değer üretir.',
    description: 'Teknoloji yatırımlarını iş hedefleriyle hizalıyoruz.',
    items: [
      { icon: 'Target', title: 'Hedef odaklı planlama', description: 'İş sonuçlarına bağlı teknoloji kararları.' },
      { icon: 'Workflow', title: 'Süreç entegrasyonu', description: 'Araçlar arası veri ve iş akışı bütünlüğü.' },
      { icon: 'BarChart3', title: 'Veri odaklı karar', description: 'Metrik ve raporlama altyapısı kurulumu.' },
      { icon: 'RefreshCw', title: 'Sürekli iyileştirme', description: 'Periyodik gözden geçirme ve optimizasyon.' },
    ],
  },
  cta: {
    title: 'Dijital dönüşüm yol haritanızı birlikte çizelim.',
    description: 'İşletmenizin dijital olgunluğunu artırmak ve doğru teknoloji yatırımlarını planlamak için görüşelim.',
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
  'dijital-danismanlik': digitalConsultingDetail,
}