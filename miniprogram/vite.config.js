import { defineConfig } from 'vite'
import UniPlugin from '@dcloudio/vite-plugin-uni'

// CJS/ESM interop — the alpha package exports { default: fn }
const uni = UniPlugin.default || UniPlugin

export default defineConfig({
  plugins: [uni()],
  css: {
    preprocessorOptions: {
      scss: {
        // 静默 Sass deprecation warnings（uView Plus 内部使用 @import 无法修改）
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
})
