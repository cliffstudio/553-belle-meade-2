/**
 * Contact form API – sends submissions via Resend.
 *
 * From: Belle Meade <onboarding@resend.dev>
 * To: CONTACT_EMAIL_TO or the form’s “To email address” in Sanity (e.g. leasing@ajcpt.com).
 * Reply-To: submitter’s email so the admin can hit Reply to respond.
 *
 * Required env: RESEND_API_KEY
 * Optional: CONTACT_EMAIL_TO (default recipient when form doesn’t set one)
 */
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const DEFAULT_FROM = 'Belle Meade <noreply@bmvillage.com>'

const EMAIL_META_KEYS = new Set(['usercode', 'form-name', 'form-title', '_toEmailAddress', '_fromEmailAddress', '_formTitle', '_replyToEmail'])

function findReplyToEmail(body: Record<string, unknown>): string | undefined {
  const replyTo = (body?._replyToEmail as string)?.trim()
  if (replyTo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) return replyTo
  for (const [key, value] of Object.entries(body)) {
    if (EMAIL_META_KEYS.has(key)) continue
    const v = typeof value === 'string' ? value.trim() : ''
    if (v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return v
  }
  return undefined
}

function formatLabel(key: string): string {
  return key
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function buildEmailHtml(body: Record<string, unknown>): string {
  const rows = Object.entries(body)
    .filter(([k, v]) => !EMAIL_META_KEYS.has(k) && v != null && String(v).trim() !== '')
    .map(([key, value]) => `<tr><td><strong>${formatLabel(key)}</strong></td><td>${String(value)}</td></tr>`)
    .join('')
  return `
    <table style="border-collapse: collapse; width: 100%; max-width: 480px;">
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top: 1rem; color: #666; font-size: 0.875rem;">Sent from the Belle Meade contact form.</p>
  `.trim()
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>

    const apiKey = process.env.RESEND_API_KEY
    const toEmail = (body?._toEmailAddress as string)?.trim() || process.env.CONTACT_EMAIL_TO
    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM

    if (!apiKey) {
      console.error('RESEND_API_KEY is not set')
      return NextResponse.json(
        { error: 'Email is not configured. Set RESEND_API_KEY in .env.local.' },
        { status: 500 }
      )
    }

    if (!toEmail) {
      console.error('No recipient: set CONTACT_EMAIL_TO in .env.local or set "To email address" on the form in Sanity.')
      return NextResponse.json(
        { error: 'Recipient email is not configured. Set CONTACT_EMAIL_TO or the form’s To email address in Sanity.' },
        { status: 500 }
      )
    }

    // Honeypot: if usercode was filled, treat as bot and pretend success
    if (body?.usercode) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const resend = new Resend(apiKey)
    const html = buildEmailHtml(body)
    // Reply-To = submitter’s email from the form so the admin can reply directly to them
    const formTitle = (body?._formTitle as string)?.trim()
    const subject = formTitle ? `New submission from website form: ${formTitle}` : 'New message from Belle Meade contact form'
    const email = findReplyToEmail(body)
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email || undefined,
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      const message = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error))
      return NextResponse.json(
        { error: 'Failed to send email.', details: message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    console.error('Contact API error:', err)
    return NextResponse.json(
      { error: 'Invalid request', details: err.message },
      { status: 400 }
    )
  }
}
