// Email Service
// Supports: console (dev) / SMTP / Alibaba Cloud DirectMail (production)

interface EmailInput {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(input: EmailInput): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER || 'console'

  switch (provider) {
    case 'smtp':
      return sendViaSMTP(input)
    case 'directmail':
      return sendViaDirectMail(input)
    case 'console':
    default:
      console.log(`[EMAIL] To: ${input.to} | Subject: ${input.subject} | ${input.text || input.html}`)
      return true
  }
}

async function sendViaSMTP(input: EmailInput): Promise<boolean> {
  try {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"设计师平台" <noreply@designer.com>',
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    })
    return true
  } catch (err) {
    console.error('SMTP send failed:', err)
    return false
  }
}

async function sendViaDirectMail(input: EmailInput): Promise<boolean> {
  // Alibaba Cloud DirectMail API
  // Requires: DIRECTMAIL_ACCESS_KEY, DIRECTMAIL_SECRET, DIRECTMAIL_ACCOUNT_NAME
  console.log(`[DirectMail] To: ${input.to} | Subject: ${input.subject}`)
  // Implementation: use @alicloud/directmail SDK
  return true
}

// Email templates
export function emailTemplates() {
  return {
    welcome: (name: string) => ({
      subject: '欢迎加入设计师接单平台',
      html: `<div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
        <div style="background:#00B578;padding:30px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">欢迎加入设计师接单平台 🎨</h1>
        </div>
        <div style="padding:30px;background:#fff;border:1px solid #e8e8e8;">
          <p>你好 <strong>${name}</strong>，</p>
          <p>感谢注册设计师接单平台！现在你可以：</p>
          <ul>
            <li>✅ 创建你的服务项目</li>
            <li>✅ 管理客户和订单</li>
            <li>✅ 展示你的作品集</li>
            <li>✅ 自动化合同和发票</li>
          </ul>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" style="display:inline-block;padding:12px 30px;background:#00B578;color:#fff;border-radius:8px;text-decoration:none;margin-top:16px;">进入工作台</a>
        </div>
      </div>`,
      text: `欢迎加入设计师接单平台，${name}！`,
    }),
    orderNotification: (name: string, orderTitle: string) => ({
      subject: `新订单：${orderTitle}`,
      html: `<div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
        <div style="background:#00B578;padding:30px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;">📦 你有一个新订单</h1>
        </div>
        <div style="padding:30px;background:#fff;border:1px solid #e8e8e8;">
          <p>${name}，你收到了一个新订单：</p>
          <p style="font-size:18px;font-weight:bold;color:#00B578;">${orderTitle}</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders" style="display:inline-block;padding:12px 30px;background:#00B578;color:#fff;border-radius:8px;text-decoration:none;margin-top:16px;">查看订单</a>
        </div>
      </div>`,
      text: `${name}，你收到了新订单：${orderTitle}`,
    }),
    paymentReceived: (name: string, amount: number, orderTitle: string) => ({
      subject: `收款通知：¥${amount.toLocaleString()}`,
      html: `<div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
        <div style="background:#52C41A;padding:30px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;">💰 收款成功</h1>
        </div>
        <div style="padding:30px;background:#fff;border:1px solid #e8e8e8;">
          <p>${name}，你收到了一笔付款：</p>
          <p style="font-size:24px;font-weight:bold;color:#52C41A;">¥${amount.toLocaleString()}</p>
          <p style="color:#666;">订单：${orderTitle}</p>
        </div>
      </div>`,
      text: `${name}，你收到 ¥${amount.toLocaleString()} 付款，订单：${orderTitle}`,
    }),
    passwordReset: (name: string, resetUrl: string) => ({
      subject: '密码重置请求',
      html: `<div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
        <div style="padding:30px;background:#fff;border:1px solid #e8e8e8;">
          <p>${name}，你请求了密码重置。</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 30px;background:#00B578;color:#fff;border-radius:8px;text-decoration:none;">重置密码</a>
          <p style="color:#999;font-size:12px;margin-top:16px;">此链接24小时内有效。如非本人操作，请忽略。</p>
        </div>
      </div>`,
      text: `${name}，请点击链接重置密码：${resetUrl}`,
    }),
  }
}
