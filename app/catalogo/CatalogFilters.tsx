'use client'
import { useRouter, useSearchParams } from 'next/navigation'

const LINEAS = ['Essentials', 'Statement', 'Signature', 'Custom', 'B2B']

export default function CatalogFilters({ active }: { active?: string }) {
  const router = useRouter()
  const params = useSearchParams()

  const setFilter = (linea: string | null) => {
    const p = new URLSearchParams(params.toString())
    if (linea) p.set('linea', linea)
    else p.delete('linea')
    router.push(`/catalogo?${p.toString()}`)
  }

  return (
    <div className="flex gap-1 flex-wrap">
      <button onClick={() => setFilter(null)}
        className={`font-mono text-[10px] tracking-[2px] uppercase px-5 py-2.5 border transition-all
          ${!active ? 'bg-pearl text-carbon border-pearl' : 'bg-transparent text-ash border-stone/25 hover:border-pearl hover:text-pearl'}`}>
        Todo
      </button>
      {LINEAS.map(l => (
        <button key={l} onClick={() => setFilter(l)}
          className={`font-mono text-[10px] tracking-[2px] uppercase px-5 py-2.5 border transition-all
            ${active === l ? 'bg-pearl text-carbon border-pearl' : 'bg-transparent text-ash border-stone/25 hover:border-pearl hover:text-pearl'}`}>
          {l}
        </button>
      ))}
    </div>
  )
}
