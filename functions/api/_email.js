/**
 * _email.js - send a plain-text email via Resend (shared by the comment
 * Functions). Not a route. Throws UNCONFIGURED when the env isn't set, so
 * callers can degrade gracefully. Uses `reply_to` (Resend REST field name).
 */
export async function deliverEmail(env, { subject, text, replyTo }) {
  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
    const err = new Error('UNCONFIGURED');
    err.code = 'UNCONFIGURED';
    throw err;
  }
  const payload = {
    from: env.CONTACT_FROM,
    to: env.CONTACT_TO,
    subject,
    text,
  };
  if (replyTo) payload.reply_to = replyTo;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
}
