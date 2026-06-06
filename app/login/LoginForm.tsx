'use client'
import { useState } from 'react'

export default function LoginForm() {
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password: pw }),
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (res.ok) {
        // Redirigir al panel — el setLoading no se cancela intencionalmente
        // para que el botón no vuelva a habilitarse durante la navegación.
        window.location.replace('/admin')
      } else {
        setError(data.error ?? 'Error desconocido')
        setPw('')
        setLoading(false)
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[9px] tracking-[3px] uppercase text-ash">
          Contraseña
        </label>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="off"
          data-form-type="other"
          className="input-field text-lg tracking-widest"
        />
      </div>
      {error && (
        <p className="text-red-400 font-mono text-[10px] tracking-wide leading-relaxed">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn-gold w-full text-center mt-2 disabled:opacity-50"
      >
        {loading ? 'Verificando...' : 'Entrar al panel'}
      </button>
    </form>
  )
}
