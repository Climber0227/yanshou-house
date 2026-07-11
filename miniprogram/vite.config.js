import { defineConfig } from 'vite'
import UniPlugin from '@dcloudio/vite-plugin-uni'

// CJS/ESM interop — the alpha package exports { default: fn }
const uni = UniPlugin.default || UniPlugin

export default defineConfig({
  plugins: [uni()],
})
