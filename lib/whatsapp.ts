// ── Cliente de WhatsApp Cloud API (solo servidor) ─────────────
// Envía mensajes de PLANTILLA (template) a través de la Graph API de Meta.
// WhatsApp obliga a usar plantillas pre-aprobadas para iniciar conversaciones
// de marketing (no se puede mandar texto libre masivo), y el destinatario
// debe haber dado consentimiento (opt-in).
//
// Configuración por variables de entorno (NO usan NEXT_PUBLIC_: son secretas
// y solo viven en el servidor):
//   WHATSAPP_ACCESS_TOKEN     Token de acceso de la app de Meta
//   WHATSAPP_PHONE_NUMBER_ID  ID del número emisor (lo da el panel de WhatsApp)
//   WHATSAPP_API_VERSION      (opcional) versión de la Graph API, ej. v22.0
//   WHATSAPP_PROMO_TEMPLATE   (opcional) nombre de la plantilla de promociones
//   WHATSAPP_TEMPLATE_LANG    (opcional) idioma de la plantilla, ej. es_MX
//
// ⚠️ NUNCA importar este archivo desde un componente 'use client':
//    solo desde server actions, server components o route handlers.

const GRAPH = 'https://graph.facebook.com'

export function whatsappConfig() {
  return {
    token: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    version: process.env.WHATSAPP_API_VERSION || 'v22.0',
    template: process.env.WHATSAPP_PROMO_TEMPLATE || 'promo_focus3d',
    lang: process.env.WHATSAPP_TEMPLATE_LANG || 'es_MX',
  }
}

// ¿Están las credenciales mínimas para poder enviar?
export function isWhatsappConfigured(): boolean {
  const c = whatsappConfig()
  return Boolean(c.token && c.phoneNumberId)
}

type SendResult = { ok: boolean; error?: string; id?: string }

// Envía un mensaje de plantilla a un número (formato internacional, solo dígitos).
// Soporta los 3 componentes de una plantilla de promoción:
//   - headerImageUrl : imagen del encabezado (URL pública del producto)
//   - bodyParams     : variables {{1}}, {{2}}, ... del cuerpo
//   - buttonUrlParam : sufijo dinámico del botón URL (índice 0), ej. el id
//                      del producto que se anexa a la URL base de la plantilla.
export async function sendTemplateMessage(opts: {
  to: string
  template?: string
  lang?: string
  bodyParams?: string[]
  headerImageUrl?: string
  buttonUrlParam?: string
}): Promise<SendResult> {
  const c = whatsappConfig()
  if (!c.token || !c.phoneNumberId) {
    return { ok: false, error: 'WhatsApp API no configurada' }
  }

  // Los componentes deben enviarse en el MISMO orden y forma que define la
  // plantilla aprobada en Meta (encabezado → cuerpo → botón).
  const components: Array<Record<string, unknown>> = []

  if (opts.headerImageUrl) {
    components.push({
      type: 'header',
      parameters: [{ type: 'image', image: { link: opts.headerImageUrl } }],
    })
  }

  if (opts.bodyParams && opts.bodyParams.length > 0) {
    components.push({
      type: 'body',
      parameters: opts.bodyParams.map((text) => ({ type: 'text', text })),
    })
  }

  if (opts.buttonUrlParam) {
    components.push({
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [{ type: 'text', text: opts.buttonUrlParam }],
    })
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: opts.to.replace(/\D/g, ''),
    type: 'template',
    template: {
      name: opts.template || c.template,
      language: { code: opts.lang || c.lang },
      ...(components.length > 0 ? { components } : {}),
    },
  }

  try {
    const res = await fetch(`${GRAPH}/${c.version}/${c.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${c.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: data?.error?.message || `HTTP ${res.status}` }
    }
    return { ok: true, id: data?.messages?.[0]?.id }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error de red' }
  }
}
