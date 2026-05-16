import { build } from 'esbuild'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Try to load the pino plugin, fall back gracefully if not available
let pinoPlugin
try {
  const { default: plugin } = await import('esbuild-plugin-pino')
  pinoPlugin = plugin({ transports: [] })
} catch {
  pinoPlugin = null
}

const plugins = pinoPlugin ? [pinoPlugin] : []

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/index.mjs',
  sourcemap: true,
  target: 'node20',
  external: [
    'mineflayer',
    'mineflayer-pathfinder',
    'minecraft-data',
    'prismarine-physics',
    'prismarine-block',
    'prismarine-chunk',
    'prismarine-entity',
    'prismarine-item',
    'prismarine-nbt',
    'prismarine-recipe',
    'prismarine-windows',
    'node-gyp-build',
    'pg-native',
  ],
  banner: {
    js: [
      "import { createRequire } from 'module';",
      "import { fileURLToPath } from 'url';",
      "import path from 'path';",
      "const require = createRequire(import.meta.url);",
      "const __filename = fileURLToPath(import.meta.url);",
      "const __dirname = path.dirname(__filename);",
    ].join('\n'),
  },
  plugins,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
})

console.log('Build complete → dist/index.mjs')
