export default function Loading() {
  return (
    <main className="min-h-screen bg-carbon flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <svg viewBox="0 0 120 90" className="w-20 animate-pulse" fill="none" aria-hidden="true">
          <polygon points="60,10 110,80 10,80" stroke="#b89a5a" strokeWidth="1.5" />
          <circle cx="60" cy="57" r="8" stroke="#b89a5a" strokeWidth="1.5" />
        </svg>
      </div>
      <span className="font-mono text-[10px] tracking-[4px] uppercase text-ash">Cargando…</span>
    </main>
  )
}
