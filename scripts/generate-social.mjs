// Genera los PNG de redes a partir de los SVG en public/branding/social/
//
// Uso:
//   npm i -D sharp @fontsource/cormorant-garamond   (si aún no están)
//   node scripts/generate-social.mjs
//
// Nota tipográfica: los SVG usan la fuente serif 'Cormorant Garamond'
// (con Georgia/Times como respaldo). Para que el PNG conserve esa
// tipografía, instala la fuente en tu sistema o usa @fontsource y déjala
// disponible para tu renderizador. En la mayoría de equipos con Georgia
// instalada (Windows/Mac) el respaldo se ve correcto sin pasos extra.

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dir = resolve(__dirname, '..', 'public', 'branding', 'social')

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error(
    '\n  Falta "sharp". Instálalo con:  npm i -D sharp\n'
  )
  process.exit(1)
}

const files = (await readdir(dir)).filter((f) => f.endsWith('.svg'))

if (files.length === 0) {
  console.log('No hay SVG en', dir)
  process.exit(0)
}

for (const file of files) {
  const svgPath = join(dir, file)
  const outPath = join(dir, file.replace(/\.svg$/, '.png'))
  const svg = await readFile(svgPath)
  // density alto = trazos vectoriales nítidos al rasterizar.
  const png = await sharp(svg, { density: 300 }).png().toBuffer()
  await writeFile(outPath, png)
  console.log('✓', file, '→', outPath.split('/').pop())
}

console.log(`\nListo: ${files.length} PNG generados en public/branding/social/`)
