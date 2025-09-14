import nodemailer from 'nodemailer'

type Transporter = nodemailer.Transporter

let cachedTransporter: Transporter | null = null

const getTransporter = async (): Promise<Transporter> => {
  if (cachedTransporter) return cachedTransporter

  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  // Dev fallback: support Ethereal for local testing when configured or when creds missing
  const isPlaceholderHost = host === 'smtp.yourprovider.com' || host?.endsWith('example.com')

  if (!host || !port || !user || !pass || host === 'ethereal' || isPlaceholderHost) {
    const testAccount = await nodemailer.createTestAccount()
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    })
    return cachedTransporter
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
  })

  return cachedTransporter
}

export async function sendVerificationEmail(toEmail: string, code: string) {
  const appName = '51Talk 数字名片平台'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const html = `
    <div style="font-family: Arial, 'Microsoft YaHei', Helvetica, sans-serif; line-height:1.6; color:#1f2937;">
      <h2 style="margin:0 0 12px;">${appName} 邮箱验证</h2>
      <p>您好！这是您的注册验证码，请在 10 分钟内完成验证：</p>
      <p style="font-size:24px; font-weight:bold; letter-spacing:4px; color:#ef4f24;">${code}</p>
      <p>如果不是您本人操作，请忽略此邮件。</p>
      <hr style="border:none; border-top:1px solid #e5e7eb; margin:16px 0;" />
      <p style="font-size:12px; color:#6b7280;">来自 <a href="${appUrl}" target="_blank" style="color:#ef4f24; text-decoration:none;">${appName}</a></p>
    </div>
  `

  const mailOptions = {
    from: process.env.SMTP_FROM || `no-reply@${new URL(appUrl).hostname}`,
    to: toEmail,
    subject: `${appName} 注册验证码：${code}`,
    html,
  }

  const transporter = await getTransporter()
  const info = await transporter.sendMail(mailOptions)
  const preview = nodemailer.getTestMessageUrl(info) || undefined
  return { messageId: info.messageId, previewUrl: preview }
}


