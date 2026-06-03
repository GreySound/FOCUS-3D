'use client'
import { useState } from 'react'
import { createClient, type Producto } from '@/lib/supabase'
import { uploadImage } from '@/lib/upload-action'
import { useRouter } from 'next/navigation'

const LINEAS = ['Essentials', 'Statement', 'Signature', 'Custom', 'B2B']
const ESTADOS = ['disponible', 'agotado', 'bajo_pedido']

export default function ProductForm({ producto }: { producto?: Producto }) {
  const router = useRouter()
  const isEdit = !!producto

  const [form, setForm] = useState({
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    linea: producto?.linea ?? 'Essentials',
    precio_min: producto?.precio_min ?? 500,
    precio_max: producto?.precio_max ?? 800,
    stock: producto?.stock ?? 5,
    estado: producto?.estado ?? 'disponible',
  })
  const [images, setImages] = useState<string[]>(producto?.imagenes ?? [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: k.includes('precio') || k === 'stock' ? Number(e.target.value) : e.target.value }))

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    setUploadError('')

    try {
      const fd = new FormData()
      fd.append('file', file)
      const result = await uploadImage(fd)

      if (result.error) {
        setUploadError(`Error: ${result.error}`)
      } else if (result.url) {
        setImages(prev => [...prev, result.url!])
      }
    } catch (err: any) {
      setUploadError(`Error inesperado: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (url: string) => setImages(prev => prev.filter(i => i !== url))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()
    const payload = { ...form, imagenes: images }
    const { error: saveErr } = isEdit
      ? await supabase.from('productos').update(payload).eq('id', producto.id)
      : await supabase.from('productos').insert([payload])
    if (saveErr) { setError(saveErr.message); setSaving(false); return }
    router.push('/admin/productos')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[3px] uppercase text-ash">Nombre *</label>
          <input required value={form.nombre} onChange={set('nombre')} placeholder="Ej: Atlas" className="input-field" />
        </div>
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[3px] uppercase text-ash">Descripción</label>
          <textarea value={form.descripcion} onChange={set('descripcion')} rows={3}
            placeholder="Describe la pieza, acabado, dimensiones..." className="input-field resize-y" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[3px] uppercase text-ash">Línea</label>
          <select value={form.linea} onChange={set('linea')} className="input-field">
            {LINEAS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[3px] uppercase text-ash">Estado</label>
          <select value={form.estado} onChange={set('estado')} className="input-field">
            {ESTADOS.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[3px] uppercase text-ash">Precio mínimo (MXN)</label>
          <input type="number" value={form.precio_min} onChange={set('precio_min')} min={0} className="input-field" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[3px] uppercase text-ash">Precio máximo (MXN)</label>
          <input type="number" value={form.precio_max} onChange={set('precio_max')} min={0} className="input-field" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[3px] uppercase text-ash">Unidades disponibles</label>
          <input type="number" value={form.stock} onChange={set('stock')} min={0} className="input-field" />
        </div>
      </div>

      {/* Imágenes */}
      <div className="flex flex-col gap-3">
        <label className="font-mono text-[9px] tracking-[3px] uppercase text-ash">
          Imágenes del producto
        </label>
        <div className="flex flex-wrap gap-3">
          {images.map(url => (
            <div key={url} className="relative w-24 h-24 bg-carbon border border-stone/20">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeImage(url)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600">
                ×
              </button>
            </div>
          ))}
          <label className={`w-24 h-24 border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors
            ${uploading ? 'border-gold/50 opacity-50 pointer-events-none' : 'border-stone/30 hover:border-gold'}`}>
            <span className="text-2xl text-stone">{uploading ? '⏳' : '+'}</span>
            <span className="font-mono text-[8px] tracking-wide uppercase text-ash">
              {uploading ? 'Subiendo...' : 'Foto'}
            </span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
        {uploadError && (
          <p className="text-red-400 font-mono text-[10px] tracking-wide">{uploadError}</p>
        )}
      </div>

      {error && <p className="text-red-400 font-mono text-[10px] tracking-wide">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving || uploading} className="btn-gold disabled:opacity-50">
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost">Cancelar</button>
      </div>
    </form>
  )
}
