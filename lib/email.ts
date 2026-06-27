// ── Cliente de email transaccional (solo servidor) ─────────────
// Envía emails con Resend (https://resend.com). Plantillas HTML inline,
// sin dependencias pesadas: respetan el branding del sitio (Cormorant +
// paleta dorada) y se ven bien en Gmail / Outlook / Apple Mail / móvil.
//
// Configuración por variables de entorno:
//   RESEND_API_KEY   Clave de API (empieza con "re_"). Obligatoria.
//   EMAIL_FROM       Remitente con formato "Nombre <correo@dominio.com>".
//                    Si tu dominio no está verificado todavía en Resend,
//                    deja onboarding@resend.dev (solo manda a tu propio email).
//
// ⚠️ NUNCA importar este archivo desde un componente 'use client'.

import { Resend } from 'resend'
import { siteConfig } from './site-config'

export type SendEmailResult = { ok: boolean; error?: string; id?: string }

export function emailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY || '',
    // Default seguro para pruebas iniciales sin verificar dominio en Resend.
    // En producción, usa hola@focus3d.art u otro buzón de tu dominio verificado.
    from: process.env.EMAIL_FROM || 'FOCUS-3D <onboarding@resend.dev>',
    replyTo: process.env.EMAIL_REPLY_TO || siteConfig.contact.email,
  }
}

export function isEmailConfigured(): boolean {
  return Boolean(emailConfig().apiKey)
}

// Llamada genérica a Resend. El resto del archivo construye plantillas
// y delega aquí el envío real.
async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  text?: string
}): Promise<SendEmailResult> {
  const c = emailConfig()
  if (!c.apiKey) return { ok: false, error: 'Resend no configurado (falta RESEND_API_KEY).' }

  try {
    const resend = new Resend(c.apiKey)
    const res = await resend.emails.send({
      from: c.from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: c.replyTo,
    })
    if (res.error) return { ok: false, error: res.error.message }
    return { ok: true, id: res.data?.id }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error de red' }
  }
}

// ──────────────────────────────────────────────────────────
//  Plantilla base: envoltorio HTML con estilo del sitio
// ──────────────────────────────────────────────────────────
// Mantén los estilos INLINE: muchos clientes (Gmail, Outlook) ignoran <style>
// dentro del <head> o lo reescriben. Inline es la única forma confiable.
function emailLayout(opts: { titulo: string; bodyHtml: string }): string {
  const carbon = '#111110'
  const ink = '#1a1a18'
  const pearl = '#e8e6e0'
  const gold = '#b89a5a'
  const ash = '#6b6860'

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(opts.titulo)}</title>
  </head>
  <body style="margin:0;padding:0;background:${carbon};font-family:Georgia,'Cormorant Garamond',serif;color:${pearl};">
    <div style="display:none;max-height:0;overflow:hidden;">
      ${escapeHtml(opts.titulo)} — ${siteConfig.name}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${carbon};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="max-width:560px;background:${ink};border:1px solid rgba(184,154,90,0.25);">
            <tr>
              <td style="padding:32px 32px 16px 32px;text-align:center;border-bottom:1px solid rgba(107,104,96,0.18);">
                <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${gold};margin-bottom:8px;">
                  ${escapeHtml(siteConfig.name)}
                </div>
                <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${ash};font-family:'Courier New',monospace;">
                  ${escapeHtml(siteConfig.tagline)}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px;">
                ${opts.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;border-top:1px solid rgba(107,104,96,0.18);text-align:center;">
                <p style="margin:0 0 8px 0;font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${ash};">
                  ${escapeHtml(siteConfig.name)} · ${escapeHtml(siteConfig.country)}
                </p>
                <p style="margin:0;font-family:Georgia,serif;font-size:12px;color:${ash};">
                  <a href="${siteConfig.url}" style="color:${gold};text-decoration:none;">${escapeHtml(siteConfig.url.replace(/^https?:\/\//,''))}</a>
                </p>
                <p style="margin:16px 0 0 0;font-family:Georgia,serif;font-size:11px;color:${ash};line-height:1.6;">
                  Recibes este mensaje porque te suscribiste en nuestra tienda.<br>
                  Si fue por error, simplemente ignora este correo.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

// Sanitiza interpolaciones para evitar inyección de HTML en plantillas.
function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ──────────────────────────────────────────────────────────
//  Cupón de bienvenida (alta de newsletter)
// ──────────────────────────────────────────────────────────
export async function sendCuponBienvenidaEmail(opts: {
  to: string
  nombre: string
  cupon: string
  token: string
}): Promise<SendEmailResult> {
  const gold = '#b89a5a'
  const pearl = '#e8e6e0'
  const ash = '#6b6860'
  const carbon = '#111110'

  const cuponUrl = `${siteConfig.url}/cupon/${encodeURIComponent(opts.token)}`
  const catalogoUrl = `${siteConfig.url}/catalogo`

  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:64px;height:64px;border:1px solid ${gold};border-radius:50%;line-height:62px;text-align:center;font-size:28px;color:${gold};">
        &#127873;
      </div>
    </div>
    <h1 style="margin:0 0 12px 0;font-family:Georgia,'Cormorant Garamond',serif;font-weight:300;font-size:32px;color:${pearl};text-align:center;letter-spacing:-0.02em;">
      Hola ${escapeHtml(opts.nombre)},
    </h1>
    <p style="margin:0 0 24px 0;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:${pearl};text-align:center;">
      Aquí está tu <em style="color:${gold};">cupón del 10%</em> de bienvenida.
      Úsalo en tu primera pieza de Focus 3D.
    </p>

    <div style="margin:32px 0;padding:24px;border:1px solid ${gold};text-align:center;background:rgba(184,154,90,0.05);">
      <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${ash};margin-bottom:12px;">
        Tu cupón
      </div>
      <div style="font-family:'Courier New',monospace;font-size:22px;letter-spacing:4px;color:${gold};font-weight:bold;">
        ${escapeHtml(opts.cupon)}
      </div>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 16px 0;">
      <tr>
        <td align="center">
          <a href="${cuponUrl}"
             style="display:inline-block;background:${gold};color:${carbon};font-family:'Courier New',monospace;font-size:12px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:16px 32px;font-weight:bold;">
            Ver mi cupón &rarr;
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0 0;font-family:Georgia,serif;font-size:14px;line-height:1.6;color:${ash};text-align:center;">
      O explora el catálogo directamente:
      <a href="${catalogoUrl}" style="color:${gold};">${escapeHtml(siteConfig.url.replace(/^https?:\/\//,''))}/catalogo</a>
    </p>

    <p style="margin:32px 0 0 0;font-family:Georgia,serif;font-size:12px;line-height:1.6;color:${ash};text-align:center;font-style:italic;">
      Te avisaremos primero cuando salgan nuevas piezas o promociones especiales.
    </p>
  `

  const text =
    `Hola ${opts.nombre},\n\n` +
    `Tu cupón del 10% en Focus 3D: ${opts.cupon}\n\n` +
    `Verlo: ${cuponUrl}\n` +
    `Catálogo: ${catalogoUrl}\n\n` +
    `— ${siteConfig.name}`

  return sendEmail({
    to: opts.to,
    subject: `${opts.nombre}, tu cupón del 10% en Focus 3D 🎁`,
    html: emailLayout({ titulo: 'Tu cupón de bienvenida', bodyHtml: body }),
    text,
  })
}

// ──────────────────────────────────────────────────────────
//  Aviso de promoción a suscriptores
// ──────────────────────────────────────────────────────────
export async function sendPromocionEmail(opts: {
  to: string
  nombre: string
  producto: { id: string; nombre: string; imagen?: string }
  etiqueta: string   // ej. "-20%" o "Promoción"
  precio: string     // ej. "$2,400" o "desde $1,800"
}): Promise<SendEmailResult> {
  const gold = '#b89a5a'
  const pearl = '#e8e6e0'
  const ash = '#6b6860'
  const carbon = '#111110'

  const productoUrl = `${siteConfig.url}/producto/${encodeURIComponent(opts.producto.id)}`

  const imagenHtml = opts.producto.imagen
    ? `<img src="${escapeHtml(opts.producto.imagen)}" alt="${escapeHtml(opts.producto.nombre)}"
            width="496" style="display:block;width:100%;max-width:496px;height:auto;border:0;outline:none;">`
    : ''

  const body = `
    <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${gold};text-align:center;margin-bottom:8px;">
      ${escapeHtml(opts.etiqueta)}
    </div>
    <h1 style="margin:0 0 24px 0;font-family:Georgia,serif;font-weight:300;font-size:28px;color:${pearl};text-align:center;letter-spacing:-0.02em;">
      ${escapeHtml(opts.producto.nombre)}
    </h1>

    ${imagenHtml ? `<div style="margin:0 0 24px 0;">${imagenHtml}</div>` : ''}

    <p style="margin:0 0 8px 0;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:${pearl};text-align:center;">
      Hola ${escapeHtml(opts.nombre)},
    </p>
    <p style="margin:0 0 24px 0;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:${pearl};text-align:center;">
      Tenemos una pieza nueva con un precio especial para ti.
    </p>

    <div style="margin:24px 0;text-align:center;">
      <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${ash};margin-bottom:8px;">
        Precio
      </div>
      <div style="font-family:Georgia,serif;font-size:28px;color:${gold};font-weight:bold;letter-spacing:1px;">
        ${escapeHtml(opts.precio)}
      </div>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px 0;">
      <tr>
        <td align="center">
          <a href="${productoUrl}"
             style="display:inline-block;background:${gold};color:${carbon};font-family:'Courier New',monospace;font-size:12px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:16px 32px;font-weight:bold;">
            Ver la pieza &rarr;
          </a>
        </td>
      </tr>
    </table>
  `

  const text =
    `${opts.etiqueta}: ${opts.producto.nombre} — ${opts.precio}\n\n` +
    `Hola ${opts.nombre}, tenemos una pieza nueva con precio especial para ti.\n` +
    `Verla: ${productoUrl}\n\n` +
    `— ${siteConfig.name}`

  return sendEmail({
    to: opts.to,
    subject: `${opts.etiqueta}: ${opts.producto.nombre} · ${siteConfig.name}`,
    html: emailLayout({ titulo: opts.producto.nombre, bodyHtml: body }),
    text,
  })
}
