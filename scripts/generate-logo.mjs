// Generador del logo Focus 3D en estilo monolínea dorada.
// Recrea el cubo 3D wireframe + la estrella de 4 puntas tipo "string art".
import { writeFileSync, mkdirSync } from 'fs'

const GOLD = '#b89a5a'
const DARK = '#111110'
const PEARL = '#e8e4dd'
const ASH = '#8a8478'

const c = 64        // centro
const R = 18        // radio de la estrella
const n = 7         // densidad de líneas por cuadrante

// ── Cubo wireframe (dos cuadrados conectados = caja 3D) ──
const cube = [
  // cara frontal
  [29, 47, 81, 47], [81, 47, 81, 99], [81, 99, 29, 99], [29, 99, 29, 47],
  // cara trasera (desplazada arriba-derecha)
  [47, 29, 99, 29], [99, 29, 99, 81], [99, 81, 47, 81], [47, 81, 47, 29],
  // aristas conectoras
  [29, 47, 47, 29], [81, 47, 99, 29], [81, 99, 99, 81], [29, 99, 47, 81],
]

// ── Estrella de 4 puntas por "string art" ──
const arms = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] }
const quads = [['up', 'right'], ['right', 'down'], ['down', 'left'], ['left', 'up']]
const star = []
for (const [a, b] of quads) {
  const A = arms[a], B = arms[b]
  for (let i = 0; i <= n; i++) {
    const j = n - i
    star.push([
      +(c + A[0] * R * i / n).toFixed(2), +(c + A[1] * R * i / n).toFixed(2),
      +(c + B[0] * R * j / n).toFixed(2), +(c + B[1] * R * j / n).toFixed(2),
    ])
  }
}

const line = ([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`
const cubeG = `<g stroke-width="1.3">${cube.map(line).join('')}</g>`
const starG = `<g stroke-width="0.7" opacity="0.95">${star.map(line).join('')}</g>`
const art = `<g fill="none" stroke="${GOLD}" stroke-linecap="round" stroke-linejoin="round">${cubeG}${starG}</g>`

const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
${art}
</svg>
`

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
<rect width="128" height="128" rx="16" fill="${DARK}"/>
${art}
</svg>
`

const lockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="470" height="150" viewBox="0 0 470 150">
<rect width="470" height="150" fill="${DARK}"/>
<g transform="translate(8,11) scale(1.0)">${art}</g>
<text x="156" y="84" font-family="Georgia, 'Cormorant Garamond', serif" font-size="62" letter-spacing="2" fill="${PEARL}">FOCUS <tspan fill="${GOLD}" font-style="italic">3D</tspan></text>
<text x="159" y="112" font-family="'DM Mono', monospace" font-size="13" letter-spacing="11" fill="${ASH}">IMPRESIONES</text>
</svg>
`

mkdirSync('public/branding', { recursive: true })
writeFileSync('public/branding/logo-mark.svg', markSvg)
writeFileSync('public/branding/favicon-preview.svg', iconSvg)
writeFileSync('public/branding/logo-lockup.svg', lockupSvg)
console.log('OK -> public/branding/{logo-mark,favicon-preview,logo-lockup}.svg')
console.log('cube lines:', cube.length, '| star lines:', star.length)
