export async function sendMagicLink(opts: {
  apiKey: string;
  from: string;
  to: string;
  link: string;
  appName: string;
}): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: opts.from,
      to: [opts.to],
      subject: `Accedi a ${opts.appName}`,
      html: `
        <p>Clicca il link per accedere a <strong>${opts.appName}</strong>:</p>
        <p><a href="${opts.link}">${opts.link}</a></p>
        <p>Il link scade in 10 minuti e può essere usato una sola volta.</p>
      `,
    }),
  });
  if (!res.ok) {
    console.error('[sendMagicLink] Resend error', res.status, await res.text());
  }
}
