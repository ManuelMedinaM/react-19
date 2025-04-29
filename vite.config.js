import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['react-19-vj2v.onrender.com'],
    // Configurar el historial de modo que todas las rutas se dirijan a index.html
    historyApiFallback: true,
    watch: {
      ignored: ['**/server/**']
    }
  },
  publicDir: 'public',
  // Copiar README.md al directorio public durante el build
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
})
