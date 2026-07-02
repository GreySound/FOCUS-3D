import { NextResponse } from 'next/server'
import { isEmailConfigured, emailConfig } from '@/lib/email'

// Endpoint de prueba para verificar configuración de Resend
// Accede desde: https://www.focusstudio3d.com/api/test-email
export async function GET() {
  const configured = isEmailConfigured()
  const config = emailConfig()
  
  return NextResponse.json({
    configured,
    hasApiKey: !!config.apiKey,
    apiKeyPrefix: config.apiKey ? config.apiKey.substring(0, 6) + '...' : 'NO CONFIGURADO',
    from: config.from,
    replyTo: config.replyTo,
  })
}
