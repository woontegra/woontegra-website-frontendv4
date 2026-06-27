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

## Mimari

- `src/builder/` — esnek blok tipleri, registry, public renderer, yayın validasyonu
- `src/media/` — tek görsel resolver; gri placeholder yok
- `src/api/` — merkezi axios client
- frontendV3'e dokunulmaz; aynı backend API kullanılır
