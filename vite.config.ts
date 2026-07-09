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

export default defineConfig(({ mode }) => {  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiProxyTarget = env.VITE_DEV_API_PROXY?.trim() || 'http://127.0.0.1:4000'

  return {
    plugins: [react(), tailwindcss(), devV3PublicImagesPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'es2020',
      cssMinify: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              if (
                id.includes('/src/pages/admin/') ||
                id.includes('/src/builder/admin/') ||
                id.includes('/src/builder/store/') ||
                id.includes('/src/builder/load/')
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
          target: apiProxyTarget,
          changeOrigin: true,
          secure: true,
        },
        '/uploads': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
