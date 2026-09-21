# IndexNow

Woontegra public URL’lerini Bing ve diğer IndexNow katılımcılarına bildiren build/deploy katmanı. Client bundle’a girmez; LCP/CLS ve prerender akışına dokunmaz.

## Vercel’de tanımlanacak değişken

| Ad | Ortam | Açıklama |
| --- | --- | --- |
| `INDEXNOW_KEY` | Production | 8–128 karakter, `a-z A-Z 0-9 -`. `VITE_` öneki **kullanılmaz**. |

Preview/Development’a koymaya gerek yoktur. Preview URL’ler IndexNow’a gönderilmez.

İsteğe bağlı:

- `INDEXNOW_SUBMIT=0` — production build’de canlı bildirimi kapatır.
- `INDEXNOW_DRY_RUN=1` — her ortamda dry-run zorlar.

## Key nasıl üretilir

Bing Webmaster Tools → IndexNow → API key, veya lokal:

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Aynı değeri Vercel Production env olarak kaydedin. Repoya, `.env.example` dışındaki placeholder dışında yazmayın.

## Doğrulama URL’si

Build, `dist/<INDEXNOW_KEY>.txt` üretir (içerik = key). Git’e yazılmaz.

Canlı kontrol (deploy sonrası, key’i tarayıcıya yapıştırarak):

```
https://www.woontegra.com/<INDEXNOW_KEY>.txt
```

Beklenen: düz metin, yalnızca key. `404` ise henüz production’a çıkmamış veya env eksik demektir.

## Submission nasıl çalışır

1. `npm run build` sitemap + prerender + SEO verify eder.
2. `indexnow:key` verification dosyasını `dist/` içine yazar.
3. `indexnow:submit` çalışır:
   - Lokal / preview: **dry-run**. Payload loglanır, API çağrılmaz.
   - Vercel Production: önce `https://www.woontegra.com/<KEY>.txt` canlı mı bakar.
     - Değilse (ilk deploy veya key değişimi): bildirimi atlar. Bu deploy yalnızca dosyayı yayınlar.
     - Canlıysa: **canlı** `https://www.woontegra.com/sitemap.xml` listesini gönderir.

Canlı sitemap kullanılır; henüz yayına çıkmamış URL’ler erken bildirilmez. Yeni bir public sayfa bir sonraki production deploy’da (artık sitemap’te ve canlıyken) gider.

Endpoint: `POST https://api.indexnow.org/indexnow`  
Gövde: `host`, `key`, `keyLocation`, `urlList` (resmi format).  
51 URL, 10.000 limitinin çok altındadır; değişenleri ayıklamak yerine sitemap’teki tüm indexlenebilir URL’ler gönderilir.

IndexNow hatası (ağ, 403, 429, …) **build’i düşürmez**. Log’da HTTP kodu ve anlamı vardır; key yazılmaz.

## Yeni URL eklendiğinde

URL `scripts/generate-sitemap.mjs` kaynaklarına (statik liste, blog/ürün API, BH SEO slug) eklenip sitemap’e giriyorsa IndexNow listesine de girer. İkinci bir URL listesi tutulmaz.

Akış: commit/push → Vercel production deploy (sayfa canlı + sitemap güncel) → bir sonraki production deploy IndexNow’a bildirir.

İlk key yayınından hemen sonra bildirim için (key URL’si 200 döndükten sonra, lokal):

```bash
# Gerçek key'i shell’e yazın; komutu ancak bilinçli olarak çalıştırın
set INDEXNOW_KEY=...
npm run indexnow:submit -- --submit
```

Bu görevdeki lokal testler `--submit` kullanmaz.

## Hata kontrolü

- Vercel build log: `[indexnow]` satırları.
- Canlı key URL’si 200 mü?
- Bing Webmaster Tools → IndexNow / URL submission geçmişi.
- `npm run indexnow:dry-run` — payload’u yerelde görür (API yok).

## Güvenlik

- Key yalnızca `INDEXNOW_KEY` (server/build). `VITE_INDEXNOW_KEY` okunmaz.
- `src/` içinden import edilmez.
- Log’larda key ve ham `keyLocation` maskelenir.
- Protokol gereği key, yayınlandıktan sonra `https://www.woontegra.com/<KEY>.txt` üzerinden okunabilir; bu beklenen doğrulama yöntemidir.
