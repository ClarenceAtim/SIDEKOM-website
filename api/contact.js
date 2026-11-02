// POST /api/contact — receives the SIDEKOM contact form and emails it to the team.
//
// Runs as a Vercel Serverless Function (ESM, see package.json "type": "module").
// Delivery goes through the site's OWN Hostinger mailbox via SMTP — no third party.
// Required env vars (set in Vercel project settings, never in code):
//   SMTP_USER  (default Contact@sidekom.com)
//   SMTP_PASS  (the mailbox password — the owner enters it in Vercel, it is never in code)
// Optional env vars:
//   SMTP_HOST (default smtp.hostinger.com), SMTP_PORT (default 465),
//   CONTACT_TO_EMAIL (default Contact@sidekom.com).
//
// Frontend: js/contact-form.js POSTs JSON here when settings.formEndpoint = "/api/contact".

import nodemailer from "nodemailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { name: 120, email: 254, company: 160, need: 160, pack: 80, message: 5000, language: 12 };

// Strip control characters, trim, and cap length — never trust client input.
const clean = (value, max) =>
  String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  if (!body || typeof body !== "object") body = {};

  // Spam honeypot: bots fill this hidden field, real visitors never see it.
  // Pretend success so bots learn nothing.
  if (clean(body._gotcha, 200)) return res.status(200).json({ ok: true });

  const data = {
    name: clean(body.name, MAX.name),
    email: clean(body.email, MAX.email),
    company: clean(body.company, MAX.company),
    need: clean(body.need, MAX.need),
    pack: clean(body.pack, MAX.pack),
    message: clean(body.message, MAX.message),
    language: clean(body.language, MAX.language),
  };

  if (!data.name || !data.email || !data.message || !data.need) {
    return res.status(400).json({ ok: false, error: "missing_fields" });
  }
  if (!EMAIL_RE.test(data.email)) {
    return res.status(400).json({ ok: false, error: "invalid_email" });
  }

  const smtpUser = process.env.SMTP_USER || "Contact@sidekom.com";
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpPass) {
    console.error("[contact] SMTP_PASS is not set");
    return res.status(503).json({ ok: false, error: "email_not_configured" });
  }

  const to = process.env.CONTACT_TO_EMAIL || "Contact@sidekom.com";
  const subject = clean(body._subject, 160) || "Nouvelle demande depuis le site SIDEKOM";
  const stamp = new Date().toISOString();

  const text = [
    `Nom: ${data.name}`,
    `E-mail: ${data.email}`,
    `Entreprise: ${data.company || "-"}`,
    `Besoin: ${data.need}`,
    `Pack: ${data.pack || "-"}`,
    `Langue: ${data.language || "-"}`,
    `Date: ${stamp}`,
    "",
    data.message,
  ].join("\n");

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.hostinger.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
    });
    await transporter.sendMail({
      from: `"SIDEKOM Website" <${smtpUser}>`,
      to,
      replyTo: data.email, // owner can reply to the visitor in one click
      subject: `[SIDEKOM] ${subject}`,
      text,
    });
  } catch (err) {
    console.error("[contact] smtp error", err && err.message ? err.message : err);
    return res.status(502).json({ ok: false, error: "email_send_failed" });
  }

  return res.status(200).json({ ok: true });
}
