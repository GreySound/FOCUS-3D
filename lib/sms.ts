// ── Cliente de SMS (solo servidor) ─────────────────────────
// Envía mensajes de texto con Twilio (https://www.twilio.com).
// SMS = texto plano, máximo 160 caracteres por segmento (los siguientes
// segmentos se cobran como mensajes adicionales). Mantenemos los textos cortos.
//
// Configuración por variables de entorno:
//   TWILIO_ACCOUNT_SID    Account SID (empieza con "AC...")
//   TWILIO_AUTH_TOKEN     Auth Token
//   TWILIO_FROM_NUMBER    Número emisor en formato internacional (+1...).
//                         En México, Twilio recomienda un Messaging Service SID
//                         si quieres mejor entregabilidad; si lo tienes, ponlo en
//                         TWILIO_MESSAGING_SERVICE_SID y se prioriza sobre el número.
//   TWILIO_MESSAGING_SERVICE_SID  (opcional) SID del Messaging Service.
//
// ⚠️ NUNCA importar este archivo desde un componente 'use client'.

import twilio from 'twilio'
import { siteConfig } from './site-config'

export type SendSmsResult = { ok: boolean; error?: string; id?: string }

export function smsConfig() {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    from: process.env.TWILIO_FROM_NUMBER || '',
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || '',
  }
}

export function isSmsConfigured(): boolean {
  const c = smsConfig()
  // Se necesita SID + token y al menos UNO de los dos remitentes.
  return Boolean(c.accountSid && c.authToken && (c.from || c.messagingServiceSid))
}

// Normaliza un teléfono mexicano al formato E.164 que pide Twilio (+52...).
// Acepta variantes con/sin lada y con/sin el "1" móvil de WhatsApp.
function toE164(raw: string): string | null {
  let d = String(raw ?? '').replace(/\D/g, '')
  if (d.startsWith('52')) d = d.slice(2)
  if (d.startsWith('1') && d.length === 11) d = d.slice(1)
  if (d.length !== 10) return null
  return `+52${d}`
}

async function sendSms(opts: { to: string; body: string }): Promise<SendSmsResult> {
  const c = smsConfig()
  if (!isSmsConfigured()) {
    return { ok: false, error: 'Twilio no configurado (faltan credenciales).' }
  }
  const to = toE164(opts.to)
  if (!to) return { ok: false, error: 'Número inválido (no se pudo normalizar a E.164).' }

  try {
    const client = twilio(c.accountSid, c.authToken)
    const message = await client.messages.create({
      to,
      body: opts.body,
      // Si hay Messaging Service, lo usamos (mejor entregabilidad / pooling de números).
      // Si no, caemos al número fijo.
      ...(c.messagingServiceSid
        ? { messagingServiceSid: c.messagingServiceSid }
        : { from: c.from }),
    })
    return { ok: true, id: message.sid }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error de red' }
  }
}

// ──────────────────────────────────────────────────────────
//  Plantillas
// ──────────────────────────────────────────────────────────
// SMS NO soporta HTML ni acentos garantizados en todos los carriers MX
// (algunos los entregan como ASCII). Mantenemos texto plano, corto y claro.

// Cupón de bienvenida. ~145-155 caracteres (1 segmento = 1 mensaje).
export async function sendCuponBienvenidaSms(opts: {
  to: string
  nombre: string
  cupon: string
  token: string
}): Promise<SendSmsResult> {
  const cuponUrl = `${siteConfig.url}/cupon/${encodeURIComponent(opts.token)}`
  const body =
    `${siteConfig.name}: Hola ${opts.nombre}, ` +
    `tu cupon 10% es ${opts.cupon}. ` +
    `Actívalo aquí: ${cuponUrl}`
  return sendSms({ to: opts.to, body })
}

// Aviso de promoción. ~150-160 caracteres (1 segmento).
export async function sendPromocionSms(opts: {
  to: string
  nombre: string
  producto: { id: string; nombre: string }
  etiqueta: string
  precio: string
}): Promise<SendSmsResult> {
  const productoUrl = `${siteConfig.url}/producto/${encodeURIComponent(opts.producto.id)}`
  // Cortamos el nombre del producto si es muy largo para mantener 1 segmento.
  const nombreCorto =
    opts.producto.nombre.length > 30
      ? `${opts.producto.nombre.slice(0, 28)}…`
      : opts.producto.nombre
  const body =
    `${siteConfig.name}: ${opts.etiqueta} ${nombreCorto} ${opts.precio}. ` +
    `Verla: ${productoUrl}`
  return sendSms({ to: opts.to, body })
}
