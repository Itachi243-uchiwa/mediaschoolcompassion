import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

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

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return res.status(500).json({ error: "Configuration email manquante (RESEND_API_KEY)" });

  const from = process.env.RESEND_FROM_EMAIL || "Compassion Média School <onboarding@resend.dev>";
  const resend = new Resend(resendKey);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr>
          <td style="background:#f97316;padding:32px;text-align:center">
            <img src="https://mediaschoolcompassion.vercel.app/Digital%20School%20Logo.png" alt="Média School" height="80" style="border-radius:12px" />
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px">
            <h1 style="margin:0 0 16px;color:#111827;font-size:24px">Bonne nouvelle ! 🎉</h1>
            <p style="margin:0 0 12px;color:#374151;font-size:16px;line-height:1.6">
              La formation <strong style="color:#f97316">${courseTitle}</strong> est maintenant disponible avec ses premiers modules !
            </p>
            <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6">
              Vous avez demandé à être averti lors de la sortie de cette formation — le moment est venu de commencer votre apprentissage.
            </p>
            <div style="text-align:center">
              <a href="${courseUrl}" style="display:inline-block;background:#f97316;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
                Accéder à la formation →
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;border-top:1px solid #f3f4f6;text-align:center">
            <p style="margin:0;color:#9ca3af;font-size:12px">Média School Compassion · Bruxelles</p>
            <p style="margin:4px 0 0;color:#9ca3af;font-size:12px">Formations gratuites pour tous.</p>
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
      await resend.emails.send({
        from,
        to: email,
        subject: `🎓 La formation "${courseTitle}" est maintenant disponible !`,
        html,
      });
      sent++;
    } catch (err) {
      errors.push(`${email}: ${err}`);
    }
  }

  return res.status(200).json({ sent, errors: errors.length ? errors : undefined });
}
