// Genera arte clásico minimalista en monolínea dorada para los fondos:
//  - classical-rays.svg   : sol radiante (Apolo / Helios)
//  - classical-laurel.svg : corona de laurel (victoria, motivo grecorromano)
import { writeFileSync, mkdirSync } from 'fs'

const goldGrad = (x1, y1, x2, y2) => `<defs><linearGradient id="gold" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
<stop offset="0" stop-color="#efd89b"/><stop offset="0.5" stop-color="#bd9d5c"/><stop offset="1" stop-color="#7c5e2b"/>
</linearGradient></defs>`

// ── Sol radiante ───────────────────────────────────────────
function rays() {
  const cx = 200, cy = 200
  const N = 60
  const out = []
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2
    const r1 = 60
    const r2 = i % 2 === 0 ? 190 : 150
    out.push(`<line x1="${(cx + Math.cos(a) * r1).toFixed(2)}" y1="${(cy + Math.sin(a) * r1).toFixed(2)}" x2="${(cx + Math.cos(a) * r2).toFixed(2)}" y2="${(cy + Math.sin(a) * r2).toFixed(2)}"/>`)
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
${goldGrad(60, 60, 340, 340)}
<g fill="none" stroke="url(#gold)" stroke-width="1" stroke-linecap="round">
<circle cx="${cx}" cy="${cy}" r="50"/>
<circle cx="${cx}" cy="${cy}" r="44"/>
${out.join('')}
</g>
</svg>
`
}

// ── Corona de laurel ───────────────────────────────────────
function laurel() {
  const cx = 200, cy = 206, R = 150
  const leaves = []
  const branch = []
  // Hojas alrededor del círculo, dejando una abertura arriba (entre 250° y 290°).
  const start = 290, end = 250 + 360 // recorre el arco largo (der -> abajo -> izq)
  const step = 11
  let first = true
  for (let deg = start; deg <= end; deg += step) {
    const t = (deg * Math.PI) / 180
    const bx = cx + Math.cos(t) * R
    const by = cy + Math.sin(t) * R
    branch.push(`${first ? 'M' : 'L'}${bx.toFixed(2)},${by.toFixed(2)}`)
    first = false
    // Dirección de la hoja: hacia afuera, inclinada hacia el crecimiento de la rama.
    const lean = ((deg * Math.PI) / 180) + 0.45
    const nx = Math.cos(lean), ny = Math.sin(lean)
    const len = 30
    const tipx = bx + nx * len, tipy = by + ny * len
    const mx = bx + nx * len * 0.5, my = by + ny * len * 0.5
    const px = -ny, py = nx // perpendicular
    const w = 7
    leaves.push(`<path d="M${bx.toFixed(2)},${by.toFixed(2)} Q${(mx + px * w).toFixed(2)},${(my + py * w).toFixed(2)} ${tipx.toFixed(2)},${tipy.toFixed(2)} Q${(mx - px * w).toFixed(2)},${(my - py * w).toFixed(2)} ${bx.toFixed(2)},${by.toFixed(2)} Z"/>`)
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
${goldGrad(40, 40, 360, 360)}
<g fill="none" stroke="url(#gold)" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round">
<path d="${branch.join(' ')}" opacity="0.7"/>
${leaves.join('')}
</g>
</svg>
`
}

mkdirSync('public/branding', { recursive: true })
writeFileSync('public/branding/classical-rays.svg', rays())
writeFileSync('public/branding/classical-laurel.svg', laurel())
console.log('OK -> public/branding/classical-{rays,laurel}.svg')
