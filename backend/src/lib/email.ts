import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const APP_NAME = 'Visa Agent'
const APP_URL = process.env.DASHBOARD_URL || 'http://localhost:5173'

interface SendInviteParams {
  to: string
  inviterName: string
  organizationName: string
  token: string
  role: string
}

export async function sendInviteEmail({ to, inviterName, organizationName, token, role }: SendInviteParams) {
  const inviteUrl = `${APP_URL}/invite/${token}`

  const { data, error } = await resend.emails.send({
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    to: [to],
    subject: `You've been invited to join ${organizationName} on ${APP_NAME}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; margin: 0; padding: 40px 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: #111; border-radius: 16px; overflow: hidden; border: 1px solid #222;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #000; font-size: 24px; font-weight: 700;">
                ${APP_NAME}
              </h1>
            </div>

            <!-- Content -->
            <div style="padding: 32px;">
              <h2 style="margin: 0 0 16px; color: #fff; font-size: 20px; font-weight: 600;">
                You're invited!
              </h2>

              <p style="margin: 0 0 24px; color: #888; font-size: 15px; line-height: 1.6;">
                <strong style="color: #fff;">${inviterName}</strong> has invited you to join
                <strong style="color: #fff;">${organizationName}</strong> as a <strong style="color: #f59e0b;">${role}</strong>.
              </p>

              <p style="margin: 0 0 24px; color: #888; font-size: 15px; line-height: 1.6;">
                ${APP_NAME} helps immigration consultants auto-fill visa forms, manage client profiles, and generate support letters.
              </p>

              <!-- CTA Button -->
              <a href="${inviteUrl}" style="display: block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #000; text-decoration: none; text-align: center; padding: 14px 24px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
                Accept Invitation
              </a>

              <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.6;">
                This invitation expires in 7 days. If you didn't expect this email, you can safely ignore it.
              </p>
            </div>

            <!-- Footer -->
            <div style="padding: 24px 32px; border-top: 1px solid #222; text-align: center;">
              <p style="margin: 0; color: #444; font-size: 12px;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
You've been invited to join ${organizationName} on ${APP_NAME}!

${inviterName} has invited you to join as a ${role}.

Accept the invitation: ${inviteUrl}

This invitation expires in 7 days.

If you didn't expect this email, you can safely ignore it.
    `.trim(),
  })

  if (error) {
    console.error('Failed to send invite email:', error)
    throw new Error(`Failed to send invitation email: ${error.message}`)
  }

  return data
}
