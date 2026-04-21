export function welcomeEmail(name: string, role: 'customer' | 'business' | 'rider') {
  const roleLabel =
    role === 'business' ? 'Business Owner' : role === 'rider' ? 'Delivery Rider' : 'Customer'

  const roleMessage =
    role === 'business'
      ? 'You can now list your store, add products, and start receiving orders from customers in Idado Estate.'
      : role === 'rider'
      ? 'You can now browse available deliveries and start earning by delivering orders within Idado Estate.'
      : 'You can now browse stores, place orders, and get them delivered right to your door in Idado Estate.'

  return {
    subject: `Welcome to Idado Eats, ${name}!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; font-weight: 800; color: #10b981; margin: 0;">idado<span style="color: #6b7280">.</span></h1>
        </div>
        <h2 style="font-size: 22px; font-weight: 700; color: #111; margin: 0 0 8px;">Welcome aboard!</h2>
        <p style="color: #555; line-height: 1.7; margin: 12px 0;">
          Hi <strong>${name}</strong>, your <strong>${roleLabel}</strong> account is ready.
        </p>
        <p style="color: #555; line-height: 1.7; margin: 12px 0;">${roleMessage}</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://idado-eats-8pe2.vercel.app/dashboard"
             style="display: inline-block; padding: 14px 32px; background: #10b981; color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px;">
            Get Started
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Idado Eats &mdash; Delivering within Idado Estate
        </p>
      </div>
    `,
  }
}
