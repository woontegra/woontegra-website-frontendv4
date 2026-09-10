import path from 'node:path'
import fs from 'node:fs'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function devV3PublicImagesPlugin(): Plugin {
  const imagesRoot = path.resolve(__dirname, '../frontendV3/public/images')
  return {
    name: 'dev-v3-public-images',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/images', (req, res, next) => {
        if (!req.url || req.method !== 'GET') return next()
        const rel = decodeURIComponent(req.url.split('?')[0] ?? '')
        if (rel.includes('..')) return next()
        const filePath = path.join(imagesRoot, rel.replace(/^\//, ''))
        if (!filePath.startsWith(imagesRoot) || !fs.existsSync(filePath)) return next()
        const ext = path.extname(filePath).toLowerCase()
        const types: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.gif': 'image/gif',
        }
        res.setHeader('Content-Type', types[ext] ?? 'application/octet-stream')
        fs.createReadStream(filePath).pipe(res)
      })
    },
  }
}

function isAdminChunk(dep: string): boolean {
  return /(?:^|\/)admin-[^/]+\.js$/i.test(dep) || dep.includes('/admin-')
}

/**
 * Vite preview defaults to SPA fallback (always root index.html).
 * Vercel serves existing filesystem HTML first, then SPA rewrite.
 * Mirror that: if dist/<route>/index.html exists, serve it.
 */
function previewPrerenderFirstPlugin(): Plugin {
  const distRoot = path.resolve(__dirname, 'dist')
  return {
    name: 'preview-prerender-first',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next()
        const raw = req.url?.split('?')[0] ?? '/'
        const pathname = decodeURIComponent(raw)
        if (pathname.startsWith('/api') || pathname.startsWith('/uploads') || pathname.startsWith('/assets')) {
          return next()
        }
        // Skip obvious static asset URLs that still have an extension
        if (/\.[a-zA-Z0-9]{1,8}$/.test(pathname) && !pathname.endsWith('.html')) {
          return next()
        }
        const rel =
          pathname === '/'
            ? 'index.html'
            : path.join(pathname.replace(/^\/+|\/+$/g, ''), 'index.html')
        const filePath = path.resolve(distRoot, rel)
        if (!filePath.startsWith(distRoot) || !fs.existsSync(filePath)) return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        if (req.method === 'HEAD') {
          res.statusCode = 200
          res.end()
          return
        }
        fs.createReadStream(filePath).pipe(res)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const railwayApi = 'https://websitebackend-production-ab6e.up.railway.app'
  // DEV: local backend (P0 öncesi davranış). .env ile override edilir.
  const devProxyTarget = env.VITE_DEV_API_PROXY?.trim() || 'http://127.0.0.1:4000'
  // PREVIEW/prerender: asla local backend gerektirmez
  const previewProxyTarget = env.VITE_PRERENDER_API_PROXY?.trim() || railwayApi

  return {
    plugins: [react(), tailwindcss(), devV3PublicImagesPlugin(), previewPrerenderFirstPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'es2020',
      cssMinify: true,
      sourcemap: false,
      modulePreload: {
        resolveDependencies(_filename, deps) {
          return deps.filter((dep) => !isAdminChunk(dep))
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              if (
                id.includes('/src/pages/admin/') ||
                id.includes('/src/builder/admin/') ||
                id.includes('/src/builder/store/') ||
                id.includes('/src/builder/load/') ||
                id.includes('/src/layouts/AdminLayout') ||
                id.includes('/src/app/guards/AdminGuard')
              ) {
                return 'admin'
              }
              return undefined
            }
            if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react'
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('@tanstack/react-query')) return 'vendor-query'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (id.includes('axios')) return 'vendor-axios'
            if (id.includes('zustand')) return 'vendor-zustand'
            return 'vendor-misc'
          },
        },
      },
    },
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target: devProxyTarget,
          changeOrigin: true,
          secure: true,
        },
        '/uploads': {
          target: devProxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    preview: {
      port: 4173,
      proxy: {
        '/api': {
          target: previewProxyTarget,
          changeOrigin: true,
          secure: true,
        },
        '/uploads': {
          target: previewProxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
