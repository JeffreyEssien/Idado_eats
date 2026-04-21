import * as tls from 'tls'

type MailOptions = {
  to: string
  subject: string
  html: string
}

function sendCommand(socket: tls.TLSSocket, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const onData = (data: Buffer) => {
      socket.removeListener('data', onData)
      resolve(data.toString())
    }
    socket.on('data', onData)
    socket.write(command + '\r\n', (err) => {
      if (err) reject(err)
    })
    setTimeout(() => {
      socket.removeListener('data', onData)
      reject(new Error('SMTP timeout'))
    }, 10000)
  })
}

function waitGreeting(socket: tls.TLSSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    const onData = (data: Buffer) => {
      socket.removeListener('data', onData)
      resolve(data.toString())
    }
    socket.on('data', onData)
    setTimeout(() => {
      socket.removeListener('data', onData)
      reject(new Error('SMTP greeting timeout'))
    }, 10000)
  })
}

export async function sendMail({ to, subject, html }: MailOptions) {
  const host = process.env.SMTP_HOST!
  const port = parseInt(process.env.SMTP_PORT || '465')
  const user = process.env.SMTP_USER!
  const pass = process.env.SMTP_PASS!
  const from = process.env.SMTP_FROM || user

  const socket = tls.connect(port, host, { rejectUnauthorized: true })

  await new Promise<void>((resolve, reject) => {
    socket.on('secureConnect', resolve)
    socket.on('error', reject)
  })

  await waitGreeting(socket)
  await sendCommand(socket, `EHLO localhost`)
  await sendCommand(socket, `AUTH LOGIN`)
  await sendCommand(socket, Buffer.from(user).toString('base64'))
  await sendCommand(socket, Buffer.from(pass).toString('base64'))
  await sendCommand(socket, `MAIL FROM:<${from}>`)
  await sendCommand(socket, `RCPT TO:<${to}>`)
  await sendCommand(socket, `DATA`)

  const boundary = `----=_Part_${Date.now()}`
  const message = [
    `From: Idado Eats <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    html,
    ``,
    `--${boundary}--`,
    `.`,
  ].join('\r\n')

  await sendCommand(socket, message)
  await sendCommand(socket, `QUIT`)
  socket.destroy()
}
