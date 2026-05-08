import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, courseTitle } = req.body as { email: string; courseTitle: string };
  if (!email || !courseTitle) return res.status(400).json({ error: "Données manquantes" });

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    return res.status(500).json({
      error: `Variables manquantes sur Vercel — GMAIL_USER: ${gmailUser ? "✓" : "ABSENT"}, GMAIL_APP_PASSWORD: ${gmailPass ? "✓" : "ABSENT"}`,
    });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: gmailUser, pass: gmailPass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 8000,
    socketTimeout: 8000,
  });

  // Vérification de la connexion SMTP avant envoi
  try {
    await transporter.verify();
  } catch (err) {
    console.error("SMTP verify failed:", err);
    return res.status(500).json({
      error: `Connexion Gmail échouée : ${(err as Error).message}. Vérifiez GMAIL_USER et GMAIL_APP_PASSWORD.`,
    });
  }

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr>
          <td style="background:#f97316;padding:32px;text-align:center">
            <h1 style="margin:0;color:#ffffff;font-size:28px;letter-spacing:-0.5px">Média School</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px">
            <h2 style="margin:0 0 8px;color:#111827;font-size:22px">Inscription confirmée !</h2>
            <p style="margin:0 0 20px;color:#6b7280;font-size:14px">Merci pour votre intérêt.</p>
            <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7">
              Votre inscription a bien été enregistrée pour la formation
              <strong style="color:#f97316"> ${courseTitle}</strong>.
            </p>
            <p style="margin:0 0 32px;color:#374151;font-size:15px;line-height:1.7">
              Vous serez averti par email dès que les premiers modules seront disponibles.
            </p>
            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px">
              <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.6">
                📚 <strong>Média School Compassion</strong> propose des formations gratuites accessibles à tous.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center">
            <p style="margin:0;color:#9ca3af;font-size:12px">Média School Compassion · Bruxelles</p>
            <p style="margin:4px 0 0;color:#9ca3af;font-size:12px">Powered by Martinez Muzela</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const info = await transporter.sendMail({
      from: `"Média School Compassion" <${gmailUser}>`,
      to: email,
      subject: `✅ Inscription confirmée — ${courseTitle}`,
      html,
    });
    console.log("Email sent:", info.messageId, "→", email);
    return res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error("sendMail error:", err);
    return res.status(500).json({ error: `Envoi échoué : ${(err as Error).message}` });
  }
}
