export default function Loading() {
  return (
    <main className="min-h-screen bg-carbon flex flex-col items-center justify-center gap-6">
      <img
        src="/branding/logo-mark.svg"
        alt=""
        aria-hidden="true"
        className="w-24 animate-pulse"
      />
      <span className="font-mono text-[10px] tracking-[4px] uppercase text-ash">Cargando…</span>
    </main>
  )
}
