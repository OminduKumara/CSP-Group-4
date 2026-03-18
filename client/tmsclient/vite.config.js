import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // Pre-process: treat .js files in src/ as JSX before the react plugin sees them
    {
      name: 'js-as-jsx',
      enforce: 'pre',
      async transform(code, id) {
        if (!id.match(/\/src\/.*\.js$/)) return null
        return transformWithEsbuild(code, id, { loader: 'jsx' })
      },
    },
    react(),
  ],
})