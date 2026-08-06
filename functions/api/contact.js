/**
 * POST /api/contact - the contact-form handler (Cloudflare Pages Function).
 *
 * - Anti-spam: honeypot + time-trap (isSpam), no CAPTCHA. Spam is silently
 *   accepted (redirected like a success) so bots get no signal.
 * - Validation: server-side mirror of the client checks (validateSubmission).
 * - Works without JavaScript: a normal form POST is answered with a 303 redirect
 *   to /thank-you/ (or back to /contact/ with an error). When the browser asks
 *   for JSON (the progressive-enhancement fetch), it replies with JSON instead.
 * - Sends exactly one email server-side. The mail credential lives only in a
 *   Cloudflare environment variable, never in the repo.
 *
 * Email provider is a deployment decision (see docs/DEPLOYMENT.md): the provider
 * becomes a data processor for contact messages, so pick one with an EU region /
 * DPA. The default below targets Resend; swap `deliverEmail` for another API if
 * preferred. Until CONTACT_* env vars are set, delivery is treated as
 * unconfigured and the handler reports a 503 (there is no traffic pre-go-live).
 */
import { validateSubmission, isSpam } from '../../lib/contact.js';

const wantsJson = (request) => (request.headers.get('accept') || '').includes('application/json');

const redirect = (url, status = 303) => new Response(null, { status, headers: { location: url } });

async function deliverEmail(env, { name, email, message }) {
  const to = env.CONTACT_TO;
  const from = env.CONTACT_FROM; // e.g. "silavapi.co.uk contact form <form@silavapi.co.uk>"
  const key = env.RESEND_API_KEY;
  if (!to || !from || !key) {
    const e = new Error(
      'Contact delivery is not configured (CONTACT_TO / CONTACT_FROM / RESEND_API_KEY).'
    );
    e.code = 'UNCONFIGURED';
    throw e;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `New message via silavapi.co.uk from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Email provider responded ${res.status}: ${detail.slice(0, 200)}`);
  }
}

export async function onRequestPost({ request, env }) {
  const json = wantsJson(request);
  let fields;
  try {
    const form = await request.formData();
    fields = Object.fromEntries(form.entries());
  } catch {
    return json
      ? Response.json({ ok: false, error: 'Could not read the form.' }, { status: 400 })
      : redirect('/contact/?error=1');
  }

  // Silently accept spam (no signal to bots), but never send it on.
  if (isSpam(fields)) return json ? Response.json({ ok: true }) : redirect('/thank-you/');

  const { ok, errors, values } = validateSubmission(fields);
  if (!ok) {
    return json
      ? Response.json({ ok: false, errors }, { status: 422 })
      : redirect('/contact/?error=1');
  }

  try {
    await deliverEmail(env, values);
  } catch (err) {
    const status = err.code === 'UNCONFIGURED' ? 503 : 502;
    return json
      ? Response.json(
          { ok: false, error: 'Sorry, sending failed. Please email me directly.' },
          { status }
        )
      : redirect('/contact/?error=send');
  }

  return json ? Response.json({ ok: true }) : redirect('/thank-you/');
}
