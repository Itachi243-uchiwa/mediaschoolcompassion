import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { emails, courseTitle, courseUrl } = req.body as {
    emails: string[];
    courseTitle: string;
    courseUrl: string;
  };

  if (!emails?.length || !courseTitle || !courseUrl) {
    return res.status(400).json({ error: "Données manquantes" });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    return res.status(500).json({ error: "Configuration email manquante (GMAIL_USER / GMAIL_APP_PASSWORD)" });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: gmailUser, pass: gmailPass },
  });

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
            <h2 style="margin:0 0 16px;color:#111827;font-size:22px">Bonne nouvelle ! 🎉</h2>
            <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7">
              La formation <strong style="color:#f97316">${courseTitle}</strong> est maintenant disponible avec ses premiers modules !
            </p>
            <p style="margin:0 0 32px;color:#374151;font-size:15px;line-height:1.7">
              Vous avez demandé à être averti — le moment est venu de commencer votre apprentissage.
            </p>
            <div style="text-align:center">
              <a href="${courseUrl}" style="display:inline-block;background:#f97316;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
                Accéder à la formation →
              </a>
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

  const errors: string[] = [];
  let sent = 0;

  for (const email of emails) {
    try {
      await transporter.sendMail({
        from: `"Média School Compassion" <${gmailUser}>`,
        to: email,
        subject: `🎓 La formation "${courseTitle}" est maintenant disponible !`,
        html,
      });
      sent++;
    } catch (err) {
      errors.push(`${email}: ${(err as Error).message}`);
    }
  }

  return res.status(200).json({ sent, errors: errors.length ? errors : undefined });
}
