import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '@/_lib/mailer'
import { welcomeEmail } from '@/_lib/email-templates'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { name, email, role } = await req.json()

  if (!name || !email || !role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { subject, html } = welcomeEmail(name, role)

  try {
    await sendMail({ to: email, subject, html })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email send failed:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
