// Fondo decorativo clásico (sol de Apolo girando lento + corona de laurel flotando).
// Solo decorativo: no captura clics y queda detrás del contenido.
export default function ClassicalBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        src="/branding/classical-rays.svg"
        alt=""
        className="absolute left-1/2 top-1/2 w-[720px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.07] anim-spin-slow"
      />
      <img
        src="/branding/classical-laurel.svg"
        alt=""
        className="absolute left-1/2 top-1/2 w-[460px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.12] anim-float"
      />
    </div>
  )
}
