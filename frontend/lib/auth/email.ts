import nodemailer from "nodemailer";

const appUrl = () => process.env.APP_URL ?? "http://localhost:3000";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT ?? 465);
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function template(title: string, intro: string, button: string, link: string, outro: string) {
  return `
  <div style="background:#000;padding:32px;font-family:Arial,sans-serif;color:#fff">
    <div style="max-width:480px;margin:auto;border:1px solid #333;border-radius:16px;padding:32px;text-align:center">
      <h1 style="letter-spacing:6px;margin:0 0 8px;font-weight:600">COCTELERÍA</h1>
      <h2 style="font-weight:400;color:#cfcfd3;margin:0 0 24px">${title}</h2>
      <p style="color:#cfcfd3;line-height:1.6">${intro}</p>
      <p style="margin:28px 0"><a href="${link}" style="background:#fff;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">${button}</a></p>
      <p style="color:#8c8889;font-size:13px;line-height:1.5">${outro}</p>
      <p style="color:#8c8889;font-size:12px;word-break:break-all">Si el botón no funciona, copiá este enlace:<br>${link}</p>
    </div>
  </div>`;
}

async function sendMail(opts: { to: string; subject: string; html: string; text: string; devLink: string }) {
  const transport = getTransport();
  if (!transport) {
    if (process.env.NODE_ENV === "production") throw new Error("SMTP no configurado");
    console.warn(`[email] SMTP no configurado (solo desarrollo). Enlace para ${opts.to}: ${opts.devLink}`);
    return;
  }
  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}

export async function sendVerificationEmail(p: { to: string; username: string; token: string }) {
  const link = `${appUrl()}/verificar-email?token=${p.token}`;
  await sendMail({
    to: p.to,
    subject: "Verificá tu correo · COCTELERÍA",
    html: template(
      "Confirmá tu correo",
      `Hola ${escapeHtml(p.username)}, gracias por registrarte. Confirmá tu dirección para poder iniciar sesión.`,
      "Verificar mi correo",
      link,
      "El enlace vence en 24 horas. Si no creaste esta cuenta, ignorá este mensaje.",
    ),
    text: `Hola ${p.username}, verificá tu correo ingresando a: ${link} (vence en 24 horas).`,
    devLink: link,
  });
}

export async function sendPasswordResetEmail(p: { to: string; username: string; token: string }) {
  const link = `${appUrl()}/restablecer-password?token=${p.token}`;
  await sendMail({
    to: p.to,
    subject: "Recuperá tu contraseña · COCTELERÍA",
    html: template(
      "Restablecer contraseña",
      `Hola ${escapeHtml(p.username)}, recibimos una solicitud para restablecer tu contraseña.`,
      "Elegir nueva contraseña",
      link,
      "El enlace vence en 1 hora y solo puede usarse una vez. Si no lo pediste, ignorá este mensaje.",
    ),
    text: `Restablecé tu contraseña ingresando a: ${link} (vence en 1 hora).`,
    devLink: link,
  });
}