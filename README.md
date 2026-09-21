# Woontegra frontendV4

Tek tenant CMS + Visual Page Builder + Commerce iskeleti.

## Geliştirme

```bash
cd frontendV4
npm install
npm run dev
```

Varsayılan port: **5174** (V3 ile çakışmaması için).

Backend proxy: `/api` ve `/uploads` → `VITE_DEV_API_PROXY` (varsayılan `http://127.0.0.1:4000`).

## Build

```bash
npm run build
```

IndexNow (Bing URL bildirimi) build/deploy katmanındadır; `VITE_` ile client’a çıkmaz. Kurulum: [docs/indexnow.md](docs/indexnow.md).

## Mimari

- `src/builder/` — esnek blok tipleri, registry, public renderer, yayın validasyonu
- `src/media/` — tek görsel resolver; gri placeholder yok
- `src/api/` — merkezi axios client
- frontendV3'e dokunulmaz; aynı backend API kullanılır

## KoopPlus dağıtım ayrımı

Website satış sayfasıdır; binary barındırmaz, R2 yönetmez, lisans doğrulamaz.

| Sistem | Rol |
| --- | --- |
| Woontegra website | Ürün/satış sayfası (`/yazilimlar/koopplus`) |
| Payment | Satın alma / checkout |
| Merkezi lisans sunucusu | Demo, aktivasyon, validate, cihaz limiti, expiry, renewal |
| Cloudflare R2 | Windows installer + uygulama güncelleme artifact’ları |
| KoopPlus Desktop | Merkezi lisans API + R2 updater/download |

Windows installer ve update dosyaları Vercel `public/`, GitHub Release veya lisans sunucusuna konmaz.

R2 bağlanınca config: `src/data/koopplusProduct.ts` → `KOOPPLUS_WINDOWS_DOWNLOAD_URL` (şu an `null`). Tahmini `r2.dev` / custom domain yazılmaz. Packaging dosya adları (`latest.yml`, nsis, blockmap vb.) Desktop updater fazında belirlenir.

Hedef R2 ağacı (dosya adları henüz kesin değil):

```
koopplus/windows/stable/     installer + updater metadata
koopplus/windows/releases/   sürümlü artifact’lar
```
