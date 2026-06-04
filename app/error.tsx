'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // En producción conviene enviar esto a un servicio de monitoreo.
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-carbon text-pearl flex flex-col items-center justify-center px-6 text-center">
      <div className="font-mono text-[10px] tracking-[4px] uppercase text-gold mb-4">Algo salió mal</div>
      <h1 className="font-serif text-5xl md:text-6xl font-light leading-none mb-6">
        Ocurrió un<br /><em className="text-stone">error inesperado.</em>
      </h1>
      <p className="text-ash font-light max-w-sm mb-10">
        Intenta de nuevo. Si el problema continúa, vuelve más tarde o contáctanos.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <button onClick={reset} className="btn-gold">Reintentar</button>
        <a href="/" className="btn-ghost">Volver al inicio</a>
      </div>
    </main>
  )
}
